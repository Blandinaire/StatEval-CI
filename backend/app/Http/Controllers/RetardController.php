<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRetardRequest;
use App\Http\Requests\UpdateRetardRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Educateur;
use App\Models\Eleve;
use App\Models\Etablissement;
use App\Models\Retard;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class RetardController extends Controller
{
    /**
     * Liste des retards.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');
        $isEducateur = $user->hasRole('Educateur');

        /*
        |--------------------------------------------------------------------------
        | Filtres
        |--------------------------------------------------------------------------
        */

        $filters = [
            'etablissement_id' => $request->input('etablissement_id', ''),
            'classe_id'       => $request->input('classe_id', ''),
            'periode'         => $request->input('periode', ''),
            'recherche'       => $request->input('recherche', ''),
        ];

        /*
        |--------------------------------------------------------------------------
        | Requête principale
        |--------------------------------------------------------------------------
        */

        $query = Retard::with([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Périmètre d'accès
        |--------------------------------------------------------------------------
        */

        if ($isSuperAdmin) {

            /*
            |--------------------------------------------------------------------------
            | SuperAdmin
            |--------------------------------------------------------------------------
            | Accès à tous les établissements.
            */

            if (filled($filters['etablissement_id'])) {
                $query->whereHas('classe', function ($q) use ($filters) {
                    $q->where(
                        'etablissement_id',
                        (int) $filters['etablissement_id']
                    );
                });
            }
        } elseif ($isEducateur) {

            /*
            |--------------------------------------------------------------------------
            | Éducateur
            |--------------------------------------------------------------------------
            | Pour le moment, l'éducateur voit uniquement les retards
            | enregistrés sous son propre compte.
            */

            $query->where(
                'educateur_id',
                $user->educateur_id
            );

            $query->whereHas('classe', function ($q) use ($user) {
                $q->where(
                    'etablissement_id',
                    $user->etablissement_id
                );
            });
        } else {

            /*
            |--------------------------------------------------------------------------
            | Autres profils
            |--------------------------------------------------------------------------
            | Limitation à leur établissement.
            */

            $query->whereHas('classe', function ($q) use ($user) {
                $q->where(
                    'etablissement_id',
                    $user->etablissement_id
                );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filtre classe
        |--------------------------------------------------------------------------
        */

        if (filled($filters['classe_id'])) {
            $query->where(
                'classe_id',
                (int) $filters['classe_id']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Filtre période
        |--------------------------------------------------------------------------
        |
        | La colonne "periode" n'est utilisée que si elle existe réellement
        | dans la table retards.
        |
        */

        if (
            filled($filters['periode'])
            && Schema::hasColumn('retards', 'periode')
        ) {
            $query->where(
                'periode',
                $filters['periode']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Recherche élève
        |--------------------------------------------------------------------------
        */

        if (filled($filters['recherche'])) {
            $recherche = trim($filters['recherche']);

            $query->whereHas('eleve', function ($q) use ($recherche) {
                $q->where('nom', 'like', "%{$recherche}%")
                    ->orWhere('prenoms', 'like', "%{$recherche}%")
                    ->orWhere('matricule', 'like', "%{$recherche}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Résultats
        |--------------------------------------------------------------------------
        */

        $retards = $query
            ->orderByDesc('date_retard')
            ->orderByDesc('id')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Établissements disponibles
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Classes disponibles
        |--------------------------------------------------------------------------
        */

        $classesQuery = Classe::query();

        if (!$isSuperAdmin) {
            $classesQuery->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        if (
            $isSuperAdmin
            && filled($filters['etablissement_id'])
        ) {
            $classesQuery->where(
                'etablissement_id',
                (int) $filters['etablissement_id']
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
        |--------------------------------------------------------------------------
        | Présence ou non de la colonne période
        |--------------------------------------------------------------------------
        */

        $hasPeriode = Schema::hasColumn(
            'retards',
            'periode'
        );

        /*
        |--------------------------------------------------------------------------
        | Réponse Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render('Retards/Index', [
            'retards'        => $retards,
            'etablissements' => $etablissements,
            'classes'        => $classes,
            'filters'        => $filters,
            'isSuperAdmin'   => $isSuperAdmin,
            'hasPeriode'     => $hasPeriode,
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create(): Response
    {
        $user = auth()->user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');

        /*
        |--------------------------------------------------------------------------
        | Établissements accessibles
        |--------------------------------------------------------------------------
        */

        $etablissements = $isSuperAdmin
            ? Etablissement::query()
            ->orderBy('nom')
            ->get([
                'id',
                'nom',
            ])
            : Etablissement::query()
            ->where(
                'id',
                $user->etablissement_id
            )
            ->get([
                'id',
                'nom',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Établissement imposé
        |--------------------------------------------------------------------------
        */

        $etablissementId = $isSuperAdmin
            ? null
            : $user->etablissement_id;

        /*
        |--------------------------------------------------------------------------
        | Élèves
        |--------------------------------------------------------------------------
        */

        $elevesQuery = Eleve::with('classe')
            ->orderBy('nom')
            ->orderBy('prenoms');

        /*
        |--------------------------------------------------------------------------
        | Classes
        |--------------------------------------------------------------------------
        */

        $classesQuery = Classe::query()
            ->orderBy('libelle');

        /*
        |--------------------------------------------------------------------------
        | Éducateurs
        |--------------------------------------------------------------------------
        */

        $educateursQuery = Educateur::query()
            ->orderBy('nom')
            ->orderBy('prenoms');

        /*
        |--------------------------------------------------------------------------
        | Restriction établissement
        |--------------------------------------------------------------------------
        */

        if ($etablissementId) {
            $elevesQuery->where(
                'etablissement_id',
                $etablissementId
            );

            $classesQuery->where(
                'etablissement_id',
                $etablissementId
            );

            $educateursQuery->where(
                'etablissement_id',
                $etablissementId
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Éducateur connecté
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Educateur')) {
            $educateursQuery->where(
                'id',
                $user->educateur_id
            );
        }

        return Inertia::render('Retards/Create', [
            'eleves' => $elevesQuery->get(),

            'educateurs' => $educateursQuery->get(),

            'anneesScolaires' => AnneeScolaire::query()
                ->orderByDesc('id')
                ->get(),

            'classes' => $classesQuery->get(),

            'etablissements' => $etablissements,

            'isSuperAdmin' => $isSuperAdmin,

            'etablissementId' => $etablissementId,
        ]);
    }

    /**
     * Enregistrement d'un retard.
     */
    public function store(
        StoreRetardRequest $request
    ): RedirectResponse {
        $user = auth()->user();

        $retard = DB::transaction(function () use ($request, $user) {

            $data = $request->validated();

            /*
            |--------------------------------------------------------------------------
            | Élève
            |--------------------------------------------------------------------------
            */

            $eleve = Eleve::with('classe')
                ->findOrFail($data['eleve_id']);

            /*
            |--------------------------------------------------------------------------
            | Vérification établissement
            |--------------------------------------------------------------------------
            */

            if (
                !$user->hasRole('SuperAdmin')
                && (int) $eleve->etablissement_id
                !== (int) $user->etablissement_id
            ) {
                abort(
                    403,
                    'Accès interdit à cet élève.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Classe
            |--------------------------------------------------------------------------
            | La classe enregistrée est toujours celle de l'élève.
            */

            if ($eleve->classe_id) {
                $classe = Classe::findOrFail(
                    $eleve->classe_id
                );

                $data['classe_id'] = $classe->id;
            } else {
                abort(
                    422,
                    'Cet élève n’est associé à aucune classe.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Vérification classe / établissement
            |--------------------------------------------------------------------------
            */

            if (
                !$user->hasRole('SuperAdmin')
                && (int) $classe->etablissement_id
                !== (int) $user->etablissement_id
            ) {
                abort(
                    403,
                    'Cette classe n’appartient pas à votre établissement.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Éducateur
            |--------------------------------------------------------------------------
            */

            if ($user->hasRole('Educateur')) {

                if (!$user->educateur_id) {
                    abort(
                        403,
                        'Votre compte n’est associé à aucun éducateur.'
                    );
                }

                $data['educateur_id'] = $user->educateur_id;
            }

            /*
            |--------------------------------------------------------------------------
            | Vérification de l'éducateur sélectionné
            |--------------------------------------------------------------------------
            */

            if (
                !$user->hasRole('SuperAdmin')
                && isset($data['educateur_id'])
                && $data['educateur_id'] !== ''
            ) {
                $educateur = Educateur::findOrFail(
                    $data['educateur_id']
                );

                if (
                    (int) $educateur->etablissement_id
                    !== (int) $user->etablissement_id
                ) {
                    abort(
                        403,
                        'Cet éducateur n’appartient pas à votre établissement.'
                    );
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Calcul de la durée
            |--------------------------------------------------------------------------
            */

            $data['duree_minutes'] = $this->calculerDureeRetard(
                $data['heure_prevue'] ?? null,
                $data['heure_arrivee'] ?? null
            );

            /*
            |--------------------------------------------------------------------------
            | Création
            |--------------------------------------------------------------------------
            */

            $retard = Retard::create($data);

            /*
            |--------------------------------------------------------------------------
            | Génération du numéro du billet
            |--------------------------------------------------------------------------
            |
            | Exemple : RET-2026-0001
            |
            */

            $retard->numero_billet =
                'RET-' .
                Carbon::parse(
                    $retard->date_retard
                )->format('Y') .
                '-' .
                str_pad(
                    (string) $retard->id,
                    4,
                    '0',
                    STR_PAD_LEFT
                );

            $retard->billet_edite = false;
            $retard->billet_edite_le = null;

            $retard->save();

            return $retard;
        });

        return redirect()
            ->route('retards.index')
            ->with(
                'success',
                "Retard enregistré avec succès. Billet {$retard->numero_billet}."
            );
    }

    /**
     * Affichage d'un retard.
     */
    public function show(
        Retard $retard
    ): Response {
        $this->verifierAccesRetard($retard);

        $retard->load([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
        ]);

        return Inertia::render('Retards/Show', [
            'retard' => $retard,
        ]);
    }

    /**
     * Formulaire de modification.
     */
    public function edit(
        Retard $retard
    ): Response {
        $this->verifierAccesRetard($retard);

        $user = auth()->user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');

        $retard->load([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Établissements
        |--------------------------------------------------------------------------
        */

        $etablissements = $isSuperAdmin
            ? Etablissement::query()
            ->orderBy('nom')
            ->get([
                'id',
                'nom',
            ])
            : Etablissement::query()
            ->where(
                'id',
                $user->etablissement_id
            )
            ->get([
                'id',
                'nom',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Élèves
        |--------------------------------------------------------------------------
        */

        $elevesQuery = Eleve::with('classe')
            ->orderBy('nom')
            ->orderBy('prenoms');

        /*
        |--------------------------------------------------------------------------
        | Classes
        |--------------------------------------------------------------------------
        */

        $classesQuery = Classe::query()
            ->orderBy('libelle');

        /*
        |--------------------------------------------------------------------------
        | Éducateurs
        |--------------------------------------------------------------------------
        */

        $educateursQuery = Educateur::query()
            ->orderBy('nom')
            ->orderBy('prenoms');

        if (!$isSuperAdmin) {
            $elevesQuery->where(
                'etablissement_id',
                $user->etablissement_id
            );

            $classesQuery->where(
                'etablissement_id',
                $user->etablissement_id
            );

            $educateursQuery->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        if ($user->hasRole('Educateur')) {
            $educateursQuery->where(
                'id',
                $user->educateur_id
            );
        }

        return Inertia::render('Retards/Edit', [
            'retard' => $retard,

            'eleves' => $elevesQuery->get(),

            'educateurs' => $educateursQuery->get(),

            'anneesScolaires' => AnneeScolaire::query()
                ->orderByDesc('id')
                ->get(),

            'classes' => $classesQuery->get(),

            'etablissements' => $etablissements,

            'isSuperAdmin' => $isSuperAdmin,

            'etablissementId' => $isSuperAdmin
                ? $retard->classe?->etablissement_id
                : $user->etablissement_id,
        ]);
    }

    /**
     * Mise à jour d'un retard.
     */
    public function update(
        UpdateRetardRequest $request,
        Retard $retard
    ): RedirectResponse {
        $this->verifierAccesRetard($retard);

        $user = auth()->user();

        $data = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | Élève
        |--------------------------------------------------------------------------
        */

        $eleve = Eleve::with('classe')
            ->findOrFail($data['eleve_id']);

        if (
            !$user->hasRole('SuperAdmin')
            && (int) $eleve->etablissement_id
            !== (int) $user->etablissement_id
        ) {
            abort(
                403,
                'Accès interdit à cet élève.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Classe automatiquement liée à l'élève
        |--------------------------------------------------------------------------
        */

        if ($eleve->classe_id) {
            $classe = Classe::findOrFail(
                $eleve->classe_id
            );

            $data['classe_id'] = $classe->id;
        } else {
            abort(
                422,
                'Cet élève n’est associé à aucune classe.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Vérification établissement de la classe
        |--------------------------------------------------------------------------
        */

        if (
            !$user->hasRole('SuperAdmin')
            && (int) $classe->etablissement_id
            !== (int) $user->etablissement_id
        ) {
            abort(
                403,
                'Cette classe n’appartient pas à votre établissement.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Éducateur
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Educateur')) {
            $data['educateur_id'] = $user->educateur_id;
        }

        /*
        |--------------------------------------------------------------------------
        | Vérification éducateur
        |--------------------------------------------------------------------------
        */

        if (
            !$user->hasRole('SuperAdmin')
            && isset($data['educateur_id'])
            && $data['educateur_id'] !== ''
        ) {
            $educateur = Educateur::findOrFail(
                $data['educateur_id']
            );

            if (
                (int) $educateur->etablissement_id
                !== (int) $user->etablissement_id
            ) {
                abort(
                    403,
                    'Cet éducateur n’appartient pas à votre établissement.'
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Calcul durée
        |--------------------------------------------------------------------------
        */

        $data['duree_minutes'] = $this->calculerDureeRetard(
            $data['heure_prevue'] ?? null,
            $data['heure_arrivee'] ?? null
        );

        /*
        |--------------------------------------------------------------------------
        | Champs système protégés
        |--------------------------------------------------------------------------
        */

        unset(
            $data['numero_billet'],
            $data['billet_edite'],
            $data['billet_edite_le']
        );

        $retard->update($data);

        return redirect()
            ->route('retards.index')
            ->with(
                'success',
                'Retard modifié avec succès.'
            );
    }

    /**
     * Suppression d'un retard.
     */
    public function destroy(
        Retard $retard
    ): RedirectResponse {
        $this->verifierAccesRetard($retard);

        $retard->delete();

        return redirect()
            ->route('retards.index')
            ->with(
                'success',
                'Retard supprimé avec succès.'
            );
    }

    /**
     * Génération du billet PDF.
     */
    public function billetPdf(
        Retard $retard
    ) {
        $this->verifierAccesRetard($retard);

        $retard->load([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Le billet devient édité uniquement lors de sa génération.
        |--------------------------------------------------------------------------
        */

        $retard->billet_edite = true;
        $retard->billet_edite_le = now();
        $retard->save();

        $pdf = Pdf::loadView(
            'retards.billet',
            [
                'retard' => $retard,
            ]
        );

        $pdf->setPaper(
            'A4',
            'portrait'
        );

        return $pdf->download(
            'billet-retard-' .
                $retard->numero_billet .
                '.pdf'
        );
    }

    /**
     * Calcul automatique de la durée du retard.
     */
    private function calculerDureeRetard(
        ?string $heurePrevue,
        ?string $heureArrivee
    ): int {
        if (
            !$heurePrevue
            || !$heureArrivee
        ) {
            return 0;
        }

        $prevue = Carbon::createFromFormat(
            'H:i',
            substr($heurePrevue, 0, 5)
        );

        $arrivee = Carbon::createFromFormat(
            'H:i',
            substr($heureArrivee, 0, 5)
        );

        if (
            $arrivee->lessThanOrEqualTo($prevue)
        ) {
            return 0;
        }

        return $prevue->diffInMinutes(
            $arrivee
        );
    }

    /**
     * Vérifie qu'un utilisateur peut accéder à un retard.
     */
    private function verifierAccesRetard(
        Retard $retard
    ): void {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | SuperAdmin
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('SuperAdmin')) {
            return;
        }

        $retard->loadMissing([
            'classe',
            'educateur',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Vérification établissement
        |--------------------------------------------------------------------------
        */

        if (
            !$retard->classe
            || (int) $retard->classe->etablissement_id
            !== (int) $user->etablissement_id
        ) {
            abort(
                403,
                'Vous n’êtes pas autorisé à accéder à ce retard.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Éducateur
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Educateur')) {

            if (
                !$user->educateur_id
                || (int) $retard->educateur_id
                !== (int) $user->educateur_id
            ) {
                abort(
                    403,
                    'Vous n’êtes pas autorisé à accéder à ce retard.'
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Autres profils
        |--------------------------------------------------------------------------
        |
        | Ils sont déjà limités par établissement.
        |--------------------------------------------------------------------------
        */
    }
}
