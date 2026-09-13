<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAbsenceRequest;
use App\Http\Requests\UpdateAbsenceRequest;
use App\Models\Absence;
use App\Models\AnneeScolaire;
use App\Models\Etablissement;
use App\Models\Classe;
use App\Models\Educateur;
use App\Models\EducateurClasse;
use App\Models\Eleve;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Inertia\Response;

class AbsenceController extends Controller
{
    /**
     * Liste des absences.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');
        $isEducateur = $user->hasRole('Educateur');

        /*
         * ============================================================
         * FILTRES
         * ============================================================
         */

        $filters = [
            'etablissement_id' => $request->input('etablissement_id') ?? '',
            'classe_id'        => $request->input('classe_id') ?? '',
            'periode'          => $request->input('periode') ?? '',
            'recherche'        => $request->input('recherche') ?? '',
        ];

        /*
         * ============================================================
         * REQUÊTE PRINCIPALE
         * ============================================================
         */

        $query = Absence::with([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
        ]);

        /*
         * ============================================================
         * PÉRIMÈTRE D'ACCÈS
         * ============================================================
         */

        if ($isSuperAdmin) {

            /*
             * SuperAdmin :
             * accès à tous les établissements.
             */
            if (filled($filters['etablissement_id'])) {
                $query->whereHas('eleve', function ($q) use ($filters) {
                    $q->where(
                        'etablissement_id',
                        $filters['etablissement_id']
                    );
                });
            }
        } elseif ($isEducateur) {

            /*
             * ========================================================
             * ÉDUCATEUR
             * ========================================================
             *
             * L'éducateur est limité :
             *
             * 1. à son établissement ;
             * 2. à ses propres classes affectées ;
             * 3. à l'année scolaire de l'absence ;
             * 4. uniquement aux affectations actives.
             */

            $query->whereHas('eleve', function ($q) use ($user) {
                $q->where(
                    'etablissement_id',
                    $user->etablissement_id
                );
            });

            $query->whereExists(function ($subQuery) use ($user) {
                $subQuery
                    ->select(DB::raw(1))
                    ->from('educateur_classes')
                    ->whereColumn(
                        'educateur_classes.classe_id',
                        'absences.classe_id'
                    )
                    ->whereColumn(
                        'educateur_classes.annee_scolaire_id',
                        'absences.annee_scolaire_id'
                    )
                    ->where(
                        'educateur_classes.educateur_id',
                        $user->educateur_id
                    )
                    ->where(
                        'educateur_classes.etablissement_id',
                        $user->etablissement_id
                    )
                    ->where(
                        'educateur_classes.actif',
                        true
                    );
            });
        } else {

            /*
             * ========================================================
             * AUTRES UTILISATEURS
             * ========================================================
             *
             * Administrateur / Direction :
             * uniquement leur établissement.
             */

            $query->whereHas('eleve', function ($q) use ($user) {
                $q->where(
                    'etablissement_id',
                    $user->etablissement_id
                );
            });
        }

        /*
         * ============================================================
         * FILTRE CLASSE
         * ============================================================
         */

        if (filled($filters['classe_id'])) {
            $query->where(
                'classe_id',
                $filters['classe_id']
            );
        }

        /*
         * ============================================================
         * FILTRE PÉRIODE
         * ============================================================
         *
         * La table absences ne possède actuellement pas
         * de colonne "periode".
         */

        if (
            filled($filters['periode']) &&
            Schema::hasColumn('absences', 'periode')
        ) {
            $query->where(
                'periode',
                $filters['periode']
            );
        }

        /*
         * ============================================================
         * RECHERCHE
         * ============================================================
         */

        if (filled($filters['recherche'])) {

            $recherche = trim(
                $filters['recherche']
            );

            $query->whereHas('eleve', function ($q) use ($recherche) {

                $q->where(
                    'nom',
                    'like',
                    "%{$recherche}%"
                )
                    ->orWhere(
                        'prenoms',
                        'like',
                        "%{$recherche}%"
                    )
                    ->orWhere(
                        'matricule',
                        'like',
                        "%{$recherche}%"
                    );
            });
        }

        /*
         * ============================================================
         * RÉSULTATS
         * ============================================================
         */

        $absences = $query
            ->orderByDesc('date_absence')
            ->orderByDesc('id')
            ->get();

        /*
         * ============================================================
         * ÉTABLISSEMENTS DISPONIBLES
         * ============================================================
         */

        if ($isSuperAdmin) {

            $etablissements = Etablissement::query()
                ->orderBy('nom')
                ->get([
                    'id',
                    'nom',
                ]);
        } else {

            $etablissements = Etablissement::query()
                ->where(
                    'id',
                    $user->etablissement_id
                )
                ->get([
                    'id',
                    'nom',
                ]);
        }

        /*
         * ============================================================
         * CLASSES DISPONIBLES
         * ============================================================
         */

        $classesQuery = Classe::query();

        if ($isEducateur) {

            /*
             * Éducateur :
             * uniquement ses classes affectées.
             */
            $classesQuery
                ->where('etablissement_id', $user->etablissement_id)
                ->whereExists(function ($subQuery) use ($user) {
                    $subQuery
                        ->select(DB::raw(1))
                        ->from('educateur_classes')
                        ->whereColumn(
                            'educateur_classes.classe_id',
                            'classes.id'
                        )
                        ->where(
                            'educateur_classes.educateur_id',
                            $user->educateur_id
                        )
                        ->where(
                            'educateur_classes.etablissement_id',
                            $user->etablissement_id
                        )
                        ->where(
                            'educateur_classes.actif',
                            true
                        );
                });
        } elseif (! $isSuperAdmin) {

            /*
             * Administrateur / Direction :
             * toutes les classes de leur établissement.
             */
            $classesQuery->where(
                'etablissement_id',
                $user->etablissement_id
            );
        } elseif (
            $isSuperAdmin &&
            filled($filters['etablissement_id'])
        ) {

            /*
             * SuperAdmin avec établissement sélectionné.
             */
            $classesQuery->where(
                'etablissement_id',
                $filters['etablissement_id']
            );
        }

        $classes = $classesQuery
            ->orderBy('libelle')
            ->get([
                'id',
                'libelle',
                'etablissement_id',
                'annee_scolaire_id',
            ]);

        /*
         * ============================================================
         * RÉPONSE INERTIA
         * ============================================================
         */

        return Inertia::render('Absences/Index', [
            'absences'       => $absences,
            'etablissements' => $etablissements,
            'classes'        => $classes,
            'filters'        => $filters,
            'isSuperAdmin'   => $isSuperAdmin,
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create(): Response
    {
        $user = auth()->user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');
        $isEducateur = $user->hasRole('Educateur');

        /*
         * ============================================================
         * ÉTABLISSEMENTS
         * ============================================================
         */

        $etablissements = $isSuperAdmin
            ? Etablissement::orderBy('nom')->get([
                'id',
                'nom',
            ])
            : Etablissement::where(
                'id',
                $user->etablissement_id
            )->get([
                'id',
                'nom',
            ]);

        $etablissementId = $isSuperAdmin
            ? null
            : $user->etablissement_id;

        /*
         * ============================================================
         * ÉLÈVES
         * ============================================================
         */

        $elevesQuery = Eleve::with('classe')
            ->orderBy('nom')
            ->orderBy('prenoms');

        /*
         * ============================================================
         * CLASSES
         * ============================================================
         */

        $classesQuery = Classe::orderBy('libelle');

        /*
 * ============================================================
 * ÉDUCATEURS
 * ============================================================
 */

        if ($isEducateur) {

            /*
     * Un éducateur connecté ne peut pas choisir
     * un autre éducateur.
     *
     * Son identité est imposée par son compte utilisateur.
     */
            $educateursQuery = Educateur::query()
                ->where('id', $user->educateur_id)
                ->where('etablissement_id', $user->etablissement_id)
                ->where('actif', true);
        } else {

            /*
     * SuperAdmin :
     * tous les éducateurs.
     *
     * Administrateur / Direction :
     * tous les éducateurs de leur établissement.
     */
            $educateursQuery = Educateur::query()
                ->where('actif', true)
                ->orderBy('nom')
                ->orderBy('prenoms');

            if ($etablissementId) {
                $educateursQuery->where(
                    'etablissement_id',
                    $etablissementId
                );
            }
        }

        /*
         * ============================================================
         * RESTRICTION PAR ÉTABLISSEMENT
         * ============================================================
         */

        if ($etablissementId) {

            $elevesQuery->where(
                'etablissement_id',
                $etablissementId
            );

            $educateursQuery->where(
                'etablissement_id',
                $etablissementId
            );

            if ($isEducateur) {

                /*
                 * L'éducateur ne reçoit que les classes
                 * qui lui sont affectées.
                 */
                $classesQuery
                    ->where(
                        'etablissement_id',
                        $etablissementId
                    )
                    ->whereExists(function ($subQuery) use ($user) {
                        $subQuery
                            ->select(DB::raw(1))
                            ->from('educateur_classes')
                            ->whereColumn(
                                'educateur_classes.classe_id',
                                'classes.id'
                            )
                            ->where(
                                'educateur_classes.educateur_id',
                                $user->educateur_id
                            )
                            ->where(
                                'educateur_classes.etablissement_id',
                                $user->etablissement_id
                            )
                            ->where(
                                'educateur_classes.actif',
                                true
                            );
                    });

                /*
                 * Les élèves sont limités aux classes
                 * affectées à l'éducateur.
                 */
                $elevesQuery->whereExists(function ($subQuery) use ($user) {
                    $subQuery
                        ->select(DB::raw(1))
                        ->from('educateur_classes')
                        ->whereColumn(
                            'educateur_classes.classe_id',
                            'eleves.classe_id'
                        )
                        ->where(
                            'educateur_classes.educateur_id',
                            $user->educateur_id
                        )
                        ->where(
                            'educateur_classes.etablissement_id',
                            $user->etablissement_id
                        )
                        ->where(
                            'educateur_classes.actif',
                            true
                        );
                });
            } else {

                /*
                 * Administrateur / Direction :
                 * toutes les classes de leur établissement.
                 */
                $classesQuery->where(
                    'etablissement_id',
                    $etablissementId
                );
            }
        }

        /*
         * ============================================================
         * RÉPONSE
         * ============================================================
         */

        return Inertia::render('Absences/Create', [
            'eleves' => $elevesQuery->get(),

            'educateurs' => $educateursQuery->get(),

            'anneesScolaires' => AnneeScolaire::orderByDesc('id')
                ->get(),

            'classes' => $classesQuery->get(),

            'etablissements' => $etablissements,

            'isSuperAdmin' => $isSuperAdmin,
            
            'isEducateur' => $isEducateur,

            'etablissementId' => $user->etablissement_id,
        ]);
    }

    /**
     * Enregistrement d'une absence.
     */
    public function store(
        StoreAbsenceRequest $request
    ): RedirectResponse {
        $user = auth()->user();

        $absence = DB::transaction(function () use ($request, $user) {

            $data = $request->validated();

            /*
             * ========================================================
             * ÉLÈVE
             * ========================================================
             */

            $eleve = Eleve::with('classe')
                ->findOrFail($data['eleve_id']);

            /*
             * Vérification établissement.
             */
            if (
                ! $user->hasRole('SuperAdmin')
                && (int) $eleve->etablissement_id !==
                (int) $user->etablissement_id
            ) {
                abort(
                    403,
                    'Accès interdit à cet élève.'
                );
            }

            /*
             * La classe est toujours déterminée
             * à partir de l'élève.
             */
            if ($eleve->classe_id) {
                $data['classe_id'] = $eleve->classe_id;
            }

            /*
             * ========================================================
             * ÉDUCATEUR
             * ========================================================
             */

            if ($user->hasRole('Educateur')) {

                /*
                 * L'éducateur ne peut jamais choisir
                 * un autre éducateur.
                 */
                $data['educateur_id'] = $user->educateur_id;

                /*
                 * Vérification de l'affectation
                 * pour l'année scolaire sélectionnée.
                 */
                $this->verifierAffectationEducateur(
                    $user->educateur_id,
                    $data['classe_id'],
                    $data['annee_scolaire_id'],
                    $user->etablissement_id
                );
            }

            /*
             * ========================================================
             * ÉDUCATEUR SÉLECTIONNÉ
             * ========================================================
             */

            if (
                ! $user->hasRole('SuperAdmin')
                && isset($data['educateur_id'])
            ) {

                $educateur = Educateur::findOrFail(
                    $data['educateur_id']
                );

                if (
                    (int) $educateur->etablissement_id !==
                    (int) $user->etablissement_id
                ) {
                    abort(
                        403,
                        'Cet éducateur n’appartient pas à votre établissement.'
                    );
                }
            }

            /*
             * ========================================================
             * VÉRIFICATION CLASSE / ÉTABLISSEMENT
             * ========================================================
             */

            $classe = Classe::findOrFail(
                $data['classe_id']
            );

            if (
                ! $user->hasRole('SuperAdmin')
                && (int) $classe->etablissement_id !==
                (int) $user->etablissement_id
            ) {
                abort(
                    403,
                    'Cette classe n’appartient pas à votre établissement.'
                );
            }

            /*
             * ========================================================
             * CRÉATION
             * ========================================================
             */

            $absence = Absence::create($data);

            /*
             * ========================================================
             * NUMÉRO DU BILLET
             * ========================================================
             */

            $annee = $absence->date_absence->format('Y');

            $absence->update([
                'numero_billet' =>
                'BA-' .
                    $annee .
                    '-' .
                    str_pad(
                        $absence->id,
                        6,
                        '0',
                        STR_PAD_LEFT
                    ),
            ]);

            return $absence;
        });

        return redirect()
            ->route('absences.index')
            ->with(
                'success',
                "Absence enregistrée avec succès. Billet {$absence->numero_billet}."
            );
    }

    /**
     * Affichage détaillé d'une absence.
     */
    public function show(
        Absence $absence
    ): Response {
        $this->verifierAccesAbsence($absence);

        $absence->load([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
        ]);

        return Inertia::render('Absences/Show', [
            'absence' => $absence,
        ]);
    }

    /**
     * Formulaire de modification.
     */
    public function edit(
        Absence $absence
    ): Response {
        $this->verifierAccesAbsence($absence);

        $user = auth()->user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');
        $isEducateur = $user->hasRole('Educateur');

        $absence->load([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
        ]);

        $etablissementId = $isSuperAdmin
            ? null
            : $user->etablissement_id;

        /*
         * ============================================================
         * ÉLÈVES
         * ============================================================
         */

        $elevesQuery = Eleve::with('classe')
            ->orderBy('nom')
            ->orderBy('prenoms');

        /*
         * ============================================================
         * CLASSES
         * ============================================================
         */

        $classesQuery = Classe::orderBy('libelle');

        /*
 * ============================================================
 * ÉDUCATEURS
 * ============================================================
 */

        if ($isEducateur) {

            /*
     * Un éducateur connecté ne peut modifier
     * une absence qu'en son propre nom.
     */
            $educateursQuery = Educateur::query()
                ->where('id', $user->educateur_id)
                ->where('etablissement_id', $user->etablissement_id)
                ->where('actif', true);
        } else {

            $educateursQuery = Educateur::query()
                ->where('actif', true)
                ->orderBy('nom')
                ->orderBy('prenoms');

            if ($etablissementId) {
                $educateursQuery->where(
                    'etablissement_id',
                    $etablissementId
                );
            }
        }

        /*
         * ============================================================
         * RESTRICTIONS
         * ============================================================
         */

        if ($etablissementId) {

            $elevesQuery->where(
                'etablissement_id',
                $etablissementId
            );

            $educateursQuery->where(
                'etablissement_id',
                $etablissementId
            );

            if ($isEducateur) {

                /*
                 * Classes affectées à l'éducateur.
                 */
                $classesQuery
                    ->where(
                        'etablissement_id',
                        $etablissementId
                    )
                    ->whereExists(function ($subQuery) use ($user) {
                        $subQuery
                            ->select(DB::raw(1))
                            ->from('educateur_classes')
                            ->whereColumn(
                                'educateur_classes.classe_id',
                                'classes.id'
                            )
                            ->where(
                                'educateur_classes.educateur_id',
                                $user->educateur_id
                            )
                            ->where(
                                'educateur_classes.etablissement_id',
                                $user->etablissement_id
                            )
                            ->where(
                                'educateur_classes.actif',
                                true
                            );
                    });

                /*
                 * Élèves des classes affectées.
                 */
                $elevesQuery->whereExists(function ($subQuery) use ($user) {
                    $subQuery
                        ->select(DB::raw(1))
                        ->from('educateur_classes')
                        ->whereColumn(
                            'educateur_classes.classe_id',
                            'eleves.classe_id'
                        )
                        ->where(
                            'educateur_classes.educateur_id',
                            $user->educateur_id
                        )
                        ->where(
                            'educateur_classes.etablissement_id',
                            $user->etablissement_id
                        )
                        ->where(
                            'educateur_classes.actif',
                            true
                        );
                });
            } else {

                $classesQuery->where(
                    'etablissement_id',
                    $etablissementId
                );
            }
        }

        return Inertia::render('Absences/Edit', [
            'absence' => $absence,

            'eleves' => $elevesQuery->get(),

            'educateurs' => $educateursQuery->get(),

            'anneesScolaires' => AnneeScolaire::orderByDesc('id')
                ->get(),

            'classes' => $classesQuery->get(),

            'isSuperAdmin' => $isSuperAdmin,

            'etablissementId' => $user->etablissement_id,
        ]);
    }

    /**
     * Mise à jour d'une absence.
     */
    public function update(
        UpdateAbsenceRequest $request,
        Absence $absence
    ): RedirectResponse {
        $this->verifierAccesAbsence($absence);

        $user = auth()->user();

        $data = $request->validated();

        /*
         * ============================================================
         * ÉLÈVE
         * ============================================================
         */

        $eleve = Eleve::with('classe')
            ->findOrFail($data['eleve_id']);

        if (
            ! $user->hasRole('SuperAdmin')
            && (int) $eleve->etablissement_id !==
            (int) $user->etablissement_id
        ) {
            abort(
                403,
                'Accès interdit à cet élève.'
            );
        }

        /*
         * La classe est déterminée par l'élève.
         */
        if ($eleve->classe_id) {
            $data['classe_id'] = $eleve->classe_id;
        }

        /*
         * ============================================================
         * ÉDUCATEUR
         * ============================================================
         */

        if ($user->hasRole('Educateur')) {

            $data['educateur_id'] = $user->educateur_id;

            /*
             * Vérification de l'affectation.
             */
            $this->verifierAffectationEducateur(
                $user->educateur_id,
                $data['classe_id'],
                $data['annee_scolaire_id'],
                $user->etablissement_id
            );
        }

        /*
         * ============================================================
         * ÉDUCATEUR SÉLECTIONNÉ
         * ============================================================
         */

        if (
            ! $user->hasRole('SuperAdmin')
            && isset($data['educateur_id'])
        ) {

            $educateur = Educateur::findOrFail(
                $data['educateur_id']
            );

            if (
                (int) $educateur->etablissement_id !==
                (int) $user->etablissement_id
            ) {
                abort(
                    403,
                    'Cet éducateur n’appartient pas à votre établissement.'
                );
            }
        }

        /*
         * ============================================================
         * CLASSE
         * ============================================================
         */

        $classe = Classe::findOrFail(
            $data['classe_id']
        );

        if (
            ! $user->hasRole('SuperAdmin')
            && (int) $classe->etablissement_id !==
            (int) $user->etablissement_id
        ) {
            abort(
                403,
                'Cette classe n’appartient pas à votre établissement.'
            );
        }

        /*
         * ============================================================
         * MISE À JOUR
         * ============================================================
         */

        $absence->update($data);

        return redirect()
            ->route('absences.index')
            ->with(
                'success',
                'Absence modifiée avec succès.'
            );
    }

    /**
     * Génération du billet d'absence en PDF.
     */
    public function billetPdf(
        Absence $absence
    ) {
        $this->verifierAccesAbsence($absence);

        $absence->load([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
        ]);

        $pdf = Pdf::loadView(
            'absences.billet',
            [
                'absence' => $absence,
            ]
        );

        return $pdf->download(
            'billet-absence-' .
                $absence->numero_billet .
                '.pdf'
        );
    }

    /**
     * Suppression d'une absence.
     */
    public function destroy(
        Absence $absence
    ): RedirectResponse {
        $this->verifierAccesAbsence($absence);

        $absence->delete();

        return redirect()
            ->route('absences.index')
            ->with(
                'success',
                'Absence supprimée avec succès.'
            );
    }

    /**
     * ================================================================
     * VÉRIFICATION D'ACCÈS À UNE ABSENCE
     * ================================================================
     */
    private function verifierAccesAbsence(
        Absence $absence
    ): void {
        $user = auth()->user();

        /*
         * ============================================================
         * SUPERADMIN
         * ============================================================
         */

        if ($user->hasRole('SuperAdmin')) {
            return;
        }

        /*
         * ============================================================
         * CHARGEMENT
         * ============================================================
         */

        $absence->loadMissing([
            'classe',
            'anneeScolaire',
        ]);

        /*
         * ============================================================
         * ÉTABLISSEMENT
         * ============================================================
         */

        if (
            ! $absence->classe
            || (int) $absence->classe->etablissement_id !==
            (int) $user->etablissement_id
        ) {
            abort(
                403,
                'Vous n’êtes pas autorisé à accéder à cette absence.'
            );
        }

        /*
         * ============================================================
         * ÉDUCATEUR
         * ============================================================
         */

        if ($user->hasRole('Educateur')) {

            /*
             * L'éducateur doit posséder un compte éducateur valide.
             */
            if (! $user->educateur_id) {
                abort(
                    403,
                    'Votre compte éducateur n’est pas correctement configuré.'
                );
            }

            /*
             * Vérification de l'affectation
             * classe + année scolaire.
             */
            $affectationExiste = EducateurClasse::query()
                ->where(
                    'educateur_id',
                    $user->educateur_id
                )
                ->where(
                    'classe_id',
                    $absence->classe_id
                )
                ->where(
                    'annee_scolaire_id',
                    $absence->annee_scolaire_id
                )
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->where(
                    'actif',
                    true
                )
                ->exists();

            if (! $affectationExiste) {
                abort(
                    403,
                    'Vous n’êtes pas affecté à la classe concernée pour cette année scolaire.'
                );
            }

            return;
        }

        /*
         * ============================================================
         * ADMINISTRATEUR / DIRECTION
         * ============================================================
         *
         * Leur accès est déjà limité à leur établissement.
         */
    }

    /**
     * ================================================================
     * VÉRIFICATION D'UNE AFFECTATION ÉDUCATEUR
     * ================================================================
     */
    private function verifierAffectationEducateur(
        int $educateurId,
        int $classeId,
        int $anneeScolaireId,
        int $etablissementId
    ): void {
        $affectationExiste = EducateurClasse::query()
            ->where(
                'educateur_id',
                $educateurId
            )
            ->where(
                'classe_id',
                $classeId
            )
            ->where(
                'annee_scolaire_id',
                $anneeScolaireId
            )
            ->where(
                'etablissement_id',
                $etablissementId
            )
            ->where(
                'actif',
                true
            )
            ->exists();

        if (! $affectationExiste) {
            abort(
                403,
                'Vous n’êtes pas affecté à cette classe pour cette année scolaire.'
            );
        }
    }
}
