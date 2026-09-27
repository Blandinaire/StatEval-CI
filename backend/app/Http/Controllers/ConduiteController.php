<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateConduiteRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Conduite;
use App\Models\Educateur;
use App\Models\EducateurClasse;
use App\Models\Eleve;
use App\Models\Etablissement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConduiteController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | OUTILS D'AUTORISATION
    |--------------------------------------------------------------------------
    */

    /**
     * Vérifie qu'un utilisateur peut accéder à une classe.
     *
     * Règles :
     *
     * SuperAdmin
     *      → toutes les classes
     *
     * Administrateur / Direction
     *      → classes de leur établissement
     *
     * Educateur
     *      → uniquement les classes qui lui sont affectées
     */
    private function checkClasseAccess(Classe $classe): void
    {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('SuperAdmin')) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | VÉRIFICATION DE L'ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (
            ! $user->etablissement_id ||
            (int) $classe->etablissement_id !==
            (int) $user->etablissement_id
        ) {
            abort(
                403,
                'Vous n’êtes pas autorisé à accéder à cette classe.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ÉDUCATEUR
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Educateur')) {

            if (! $user->educateur_id) {
                abort(
                    403,
                    'Votre compte n’est associé à aucun éducateur.'
                );
            }

            $autorise = EducateurClasse::query()
                ->where('educateur_id', $user->educateur_id)
                ->where('classe_id', $classe->id)
                ->where(
                    'annee_scolaire_id',
                    $classe->annee_scolaire_id
                )
                ->where(
                    'etablissement_id',
                    $classe->etablissement_id
                )
                ->where('actif', true)
                ->exists();

            if (! $autorise) {
                abort(
                    403,
                    'Cette classe ne vous est pas affectée.'
                );
            }
        }
    }

    /**
     * Vérifie qu'un éducateur appartient à l'établissement.
     */
    private function checkEducateurAccess(
        int $educateurId,
        int $etablissementId
    ): Educateur {

        $educateur = Educateur::query()
            ->where('id', $educateurId)
            ->where('actif', true)
            ->first();

        if (! $educateur) {
            abort(
                403,
                'L’éducateur sélectionné est invalide ou inactif.'
            );
        }

        if (
            ! $this->isSuperAdmin() &&
            (int) $educateur->etablissement_id !==
            (int) $etablissementId
        ) {
            abort(
                403,
                'Cet éducateur n’appartient pas à votre établissement.'
            );
        }

        return $educateur;
    }

    /**
     * Vérifie l'affectation d'un éducateur à une classe.
     */
    private function checkEducateurClasseAccess(
        int $educateurId,
        Classe $classe
    ): void {

        $autorise = EducateurClasse::query()
            ->where('educateur_id', $educateurId)
            ->where('classe_id', $classe->id)
            ->where(
                'annee_scolaire_id',
                $classe->annee_scolaire_id
            )
            ->where(
                'etablissement_id',
                $classe->etablissement_id
            )
            ->where('actif', true)
            ->exists();

        if (! $autorise) {
            abort(
                403,
                'Cet éducateur n’est pas affecté à cette classe.'
            );
        }
    }

    /**
     * Vérifie qu'un élève appartient réellement à la classe,
     * à l'établissement et à l'année scolaire concernés.
     */
    private function getEleveForClasse(
        int $eleveId,
        Classe $classe
    ): Eleve {

        $eleve = Eleve::query()
            ->where('id', $eleveId)
            ->where('classe_id', $classe->id)
            ->where(
                'etablissement_id',
                $classe->etablissement_id
            )
            ->where(
                'annee_scolaire_id',
                $classe->annee_scolaire_id
            )
            ->where('actif', true)
            ->first();

        if (! $eleve) {
            abort(
                422,
                'L’élève sélectionné n’appartient pas à la classe concernée.'
            );
        }

        return $eleve;
    }

    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
    */

    /**
     * Liste des notes de conduite.
     *
     * IMPORTANT :
     * L'établissement de l'élève est la référence principale
     * pour l'isolation des données.
     *
     * Cela permet notamment qu'un élève transféré vers un autre
     * établissement ne continue pas à apparaître dans les conduites
     * de son ancien établissement.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');
        $isEducateur = $user->hasRole('Educateur');

        /*
        |--------------------------------------------------------------------------
        | REQUÊTE PRINCIPALE
        |--------------------------------------------------------------------------
        */

        $query = Conduite::query()
            ->with([
                'eleve',
                'educateur',
                'anneeScolaire',
                'classe',
            ]);

        /*
        |--------------------------------------------------------------------------
        | RESTRICTION DES DONNÉES
        |--------------------------------------------------------------------------
        |
        | RÈGLE CENTRALE :
        |
        | On filtre directement sur l'établissement ACTUEL de l'élève.
        |
        | Il ne faut pas se baser uniquement sur conduites.classe_id
        | ou classes.etablissement_id car la classe peut représenter
        | une ancienne situation scolaire de l'élève après transfert.
        |
        */

        if ($isEducateur) {

            if (! $user->educateur_id) {

                $query->whereRaw('1 = 0');
            } else {

                $query
                    ->where(
                        'educateur_id',
                        $user->educateur_id
                    )

                    /*
                    |--------------------------------------------------------------------------
                    | ÉTABLISSEMENT ACTUEL DE L'ÉLÈVE
                    |--------------------------------------------------------------------------
                    */

                    ->whereHas(
                        'eleve',
                        function ($q) use ($user) {

                            $q->where(
                                'etablissement_id',
                                $user->etablissement_id
                            )
                                ->where(
                                    'actif',
                                    true
                                );
                        }
                    )

                    /*
                    |--------------------------------------------------------------------------
                    | CLASSE ACTUELLE / AFFECTATION ÉDUCATEUR
                    |--------------------------------------------------------------------------
                    */

                    ->whereHas(
                        'classe.affectationsEducateurs',
                        function ($q) use ($user) {

                            $q->where(
                                'educateur_id',
                                $user->educateur_id
                            )
                                ->where(
                                    'actif',
                                    true
                                )
                                ->whereColumn(
                                    'educateur_classes.annee_scolaire_id',
                                    'conduites.annee_scolaire_id'
                                )
                                ->whereColumn(
                                    'educateur_classes.classe_id',
                                    'conduites.classe_id'
                                )
                                ->whereColumn(
                                    'educateur_classes.etablissement_id',
                                    'classes.etablissement_id'
                                );
                        }
                    );
            }
        } elseif (! $isSuperAdmin) {

            /*
            |--------------------------------------------------------------------------
            | ADMINISTRATEUR / DIRECTION
            |--------------------------------------------------------------------------
            |
            | L'établissement actuel de l'élève est déterminant.
            |--------------------------------------------------------------------------
            */

            if (! $user->etablissement_id) {

                $query->whereRaw('1 = 0');
            } else {

                $query->whereHas(
                    'eleve',
                    function ($q) use ($user) {

                        $q->where(
                            'etablissement_id',
                            $user->etablissement_id
                        )
                            ->where(
                                'actif',
                                true
                            );
                    }
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | FILTRE ÉTABLISSEMENT - SUPERADMIN
        |--------------------------------------------------------------------------
        |
        | Le SuperAdmin peut sélectionner un établissement.
        |
        | Le filtre porte sur l'établissement ACTUEL de l'élève.
        |--------------------------------------------------------------------------
        */

        if (
            $isSuperAdmin &&
            $request->filled('etablissement_id')
        ) {

            $query->whereHas(
                'eleve',
                function ($q) use ($request) {

                    $q->where(
                        'etablissement_id',
                        $request->etablissement_id
                    )
                        ->where(
                            'actif',
                            true
                        );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FILTRE CLASSE
        |--------------------------------------------------------------------------
        */

        if ($request->filled('classe_id')) {

            $classeId = (int) $request->classe_id;

            $query->where(
                'classe_id',
                $classeId
            );

            /*
            |--------------------------------------------------------------------------
            | SÉCURITÉ SUPPLÉMENTAIRE
            |--------------------------------------------------------------------------
            |
            | On vérifie que l'élève actuellement lié à la conduite
            | appartient bien à la classe sélectionnée.
            |--------------------------------------------------------------------------
            */

            $query->whereHas(
                'eleve',
                function ($q) use ($classeId) {

                    $q->where(
                        'classe_id',
                        $classeId
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FILTRE PÉRIODE
        |--------------------------------------------------------------------------
        */

        if ($request->filled('periode')) {

            $query->where(
                'periode',
                $request->periode
            );
        }

        /*
        |--------------------------------------------------------------------------
        | RECHERCHE ÉLÈVE
        |--------------------------------------------------------------------------
        */

        if ($request->filled('recherche')) {

            $recherche = trim(
                $request->recherche
            );

            $query->whereHas(
                'eleve',
                function ($q) use ($recherche) {

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
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | RÉSULTATS
        |--------------------------------------------------------------------------
        */

        $conduites = $query
            ->orderByDesc('id')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENTS DISPONIBLES
        |--------------------------------------------------------------------------
        */

        if ($isSuperAdmin) {

            $etablissements = Etablissement::query()
                ->where('actif', true)
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
                ->where('actif', true)
                ->get([
                    'id',
                    'nom',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | CLASSES DISPONIBLES
        |--------------------------------------------------------------------------
        */

        $classesQuery = Classe::query()
            ->where('active', true)
            ->orderBy('libelle');

        if ($isSuperAdmin) {

            if ($request->filled('etablissement_id')) {

                $classesQuery->where(
                    'etablissement_id',
                    $request->etablissement_id
                );
            }
        } elseif ($isEducateur) {

            if ($user->educateur_id) {

                $classesQuery
                    ->where(
                        'etablissement_id',
                        $user->etablissement_id
                    )
                    ->whereHas(
                        'affectationsEducateurs',
                        function ($q) use ($user) {

                            $q->where(
                                'educateur_id',
                                $user->educateur_id
                            )
                                ->where(
                                    'etablissement_id',
                                    $user->etablissement_id
                                )
                                ->where(
                                    'actif',
                                    true
                                );
                        }
                    );
            } else {

                $classesQuery->whereRaw('1 = 0');
            }
        } else {

            $classesQuery->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        $classes = $classesQuery->get([
            'id',
            'libelle',
            'etablissement_id',
            'annee_scolaire_id',
        ]);

        /*
        |--------------------------------------------------------------------------
        | RETOUR INERTIA
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Conduites/Index',
            [

                'conduites' =>
                $conduites,

                'etablissements' =>
                $etablissements,

                'classes' =>
                $classes,

                'filters' => [

                    'etablissement_id' =>
                    $request->etablissement_id ?? '',

                    'classe_id' =>
                    $request->classe_id ?? '',

                    'periode' =>
                    $request->periode ?? '',

                    'recherche' =>
                    $request->recherche ?? '',
                ],

                'isSuperAdmin' =>
                $isSuperAdmin,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    /**
     * Formulaire de saisie groupée.
     */
    public function create(): Response
    {
        $user = auth()->user();

        $isSuperAdmin =
            $user->hasRole('SuperAdmin');

        $isEducateur =
            $user->hasRole('Educateur');

        $etablissementId =
            $user->etablissement_id;

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENTS
        |--------------------------------------------------------------------------
        */

        $etablissements = $isSuperAdmin
            ? Etablissement::query()
            ->where('actif', true)
            ->orderBy('nom')
            ->get()
            : Etablissement::query()
            ->where(
                'id',
                $etablissementId
            )
            ->where('actif', true)
            ->orderBy('nom')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | ANNÉES SCOLAIRES
        |--------------------------------------------------------------------------
        */

        $anneesScolaires = AnneeScolaire::query()
            ->orderByDesc('date_debut')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | ÉDUCATEURS
        |--------------------------------------------------------------------------
        */

        if ($isEducateur) {

            $educateurs = Educateur::query()
                ->where(
                    'id',
                    $user->educateur_id
                )
                ->where('actif', true)
                ->get([
                    'id',
                    'nom',
                    'prenoms',
                    'etablissement_id',
                ]);
        } else {

            $educateursQuery = Educateur::query()
                ->where('actif', true);

            if (! $isSuperAdmin) {

                $educateursQuery->where(
                    'etablissement_id',
                    $etablissementId
                );
            }

            $educateurs = $educateursQuery
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'nom',
                    'prenoms',
                    'etablissement_id',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | RETOUR
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Conduites/Create',
            [

                'etablissements' =>
                $etablissements,

                'anneesScolaires' =>
                $anneesScolaires,

                'educateurs' =>
                $educateurs,

                'isSuperAdmin' =>
                $isSuperAdmin,

                'etablissementId' =>
                $isSuperAdmin
                    ? null
                    : $etablissementId,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CLASSES API
    |--------------------------------------------------------------------------
    */

    /**
     * Retourne les classes accessibles pour
     * un établissement et une année scolaire.
     */
    public function classes(
        Request $request
    ): JsonResponse {

        $request->validate([

            'annee_scolaire_id' => [
                'required',
                'integer',
                'exists:annee_scolaires,id',
            ],

            'etablissement_id' => [
                'nullable',
                'integer',
                'exists:etablissements,id',
            ],

        ]);

        $user = auth()->user();

        $isSuperAdmin =
            $user->hasRole('SuperAdmin');

        $isEducateur =
            $user->hasRole('Educateur');

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if ($isSuperAdmin) {

            $etablissementId =
                $request->etablissement_id;

            if (! $etablissementId) {

                return response()->json([]);
            }
        } else {

            $etablissementId =
                $user->etablissement_id;
        }

        /*
        |--------------------------------------------------------------------------
        | REQUÊTE
        |--------------------------------------------------------------------------
        */

        $classesQuery = Classe::query()
            ->where(
                'etablissement_id',
                $etablissementId
            )
            ->where(
                'annee_scolaire_id',
                $request->annee_scolaire_id
            )
            ->where(
                'active',
                true
            );

        /*
        |--------------------------------------------------------------------------
        | ÉDUCATEUR
        |--------------------------------------------------------------------------
        */

        if ($isEducateur) {

            if (! $user->educateur_id) {

                return response()->json([]);
            }

            $classesQuery->whereHas(
                'affectationsEducateurs',
                function ($q) use (
                    $user,
                    $request
                ) {

                    $q->where(
                        'educateur_id',
                        $user->educateur_id
                    )
                        ->where(
                            'annee_scolaire_id',
                            $request->annee_scolaire_id
                        )
                        ->where(
                            'etablissement_id',
                            $user->etablissement_id
                        )
                        ->where(
                            'actif',
                            true
                        );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | RÉSULTAT
        |--------------------------------------------------------------------------
        */

        $classes = $classesQuery
            ->orderBy('libelle')
            ->get([
                'id',
                'libelle',
                'etablissement_id',
                'annee_scolaire_id',
            ]);

        return response()->json(
            $classes
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ÉLÈVES API
    |--------------------------------------------------------------------------
    */

    /**
     * Retourne les élèves d'une classe accessible.
     */
    public function elevesParClasse(
        Classe $classe
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ CLASSE
        |--------------------------------------------------------------------------
        */

        $this->checkClasseAccess(
            $classe
        );

        /*
        |--------------------------------------------------------------------------
        | ÉLÈVES
        |--------------------------------------------------------------------------
        */

        $eleves = Eleve::query()
            ->where(
                'classe_id',
                $classe->id
            )
            ->where(
                'etablissement_id',
                $classe->etablissement_id
            )
            ->where(
                'annee_scolaire_id',
                $classe->annee_scolaire_id
            )
            ->where(
                'actif',
                true
            )
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get([
                'id',
                'nom',
                'prenoms',
                'matricule',
                'classe_id',
                'etablissement_id',
                'annee_scolaire_id',
            ]);

        return response()->json(
            $eleves
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ENREGISTREMENT GROUPÉ
    |--------------------------------------------------------------------------
    */

    /**
     * Enregistre les notes de conduite d'une classe.
     */
    public function storeGroupe(
        Request $request
    ): RedirectResponse {

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([

            'etablissement_id' => [
                'nullable',
                'integer',
                'exists:etablissements,id',
            ],

            'annee_scolaire_id' => [
                'required',
                'integer',
                'exists:annee_scolaires,id',
            ],

            'classe_id' => [
                'required',
                'integer',
                'exists:classes,id',
            ],

            'educateur_id' => [
                'nullable',
                'integer',
                'exists:educateurs,id',
            ],

            'periode' => [
                'required',
                'string',
                'in:Trimestre 1,Trimestre 2,Trimestre 3,Semestre 1,Semestre 2',
            ],

            'notes' => [
                'required',
                'array',
                'min:1',
            ],

            'notes.*.eleve_id' => [
                'required',
                'integer',
                'exists:eleves,id',
            ],

            'notes.*.note' => [
                'nullable',
                'numeric',
                'min:0',
                'max:20',
            ],

            'notes.*.observation' => [
                'nullable',
                'string',
                'max:2000',
            ],

        ]);

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('SuperAdmin')) {

            if (
                empty($validated['etablissement_id'])
            ) {

                return back()
                    ->withErrors([
                        'etablissement_id' =>
                        'Veuillez sélectionner un établissement.',
                    ])
                    ->withInput();
            }

            $etablissementId =
                (int) $validated['etablissement_id'];
        } else {

            if (! $user->etablissement_id) {

                abort(
                    403,
                    'Votre compte n’est associé à aucun établissement.'
                );
            }

            $etablissementId =
                (int) $user->etablissement_id;
        }

        /*
        |--------------------------------------------------------------------------
        | CLASSE
        |--------------------------------------------------------------------------
        */

        $classe = Classe::query()
            ->where(
                'id',
                $validated['classe_id']
            )
            ->where(
                'etablissement_id',
                $etablissementId
            )
            ->where(
                'annee_scolaire_id',
                $validated['annee_scolaire_id']
            )
            ->where(
                'active',
                true
            )
            ->first();

        if (! $classe) {

            return back()
                ->withErrors([
                    'classe_id' =>
                    'La classe sélectionnée est invalide ou ne correspond pas à l’année scolaire et à l’établissement.',
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | DROITS SUR LA CLASSE
        |--------------------------------------------------------------------------
        */

        $this->checkClasseAccess(
            $classe
        );

        /*
        |--------------------------------------------------------------------------
        | ÉDUCATEUR RESPONSABLE
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Educateur')) {

            if (! $user->educateur_id) {

                abort(
                    403,
                    'Votre compte n’est associé à aucun éducateur.'
                );
            }

            /*
            | L'éducateur connecté est toujours
            | responsable de la saisie.
            */

            $educateurId =
                (int) $user->educateur_id;

            /*
            | Vérification supplémentaire.
            */

            $this->checkEducateurClasseAccess(
                $educateurId,
                $classe
            );
        } else {

            /*
            | SuperAdmin / Administrateur / Direction
            */

            if (
                empty($validated['educateur_id'])
            ) {

                return back()
                    ->withErrors([
                        'educateur_id' =>
                        'Veuillez sélectionner un éducateur responsable.',
                    ])
                    ->withInput();
            }

            $educateurId =
                (int) $validated['educateur_id'];

            /*
            | Vérification établissement
            */

            $this->checkEducateurAccess(
                $educateurId,
                $etablissementId
            );

            /*
            | Pour les utilisateurs autres que SuperAdmin,
            | l'éducateur doit être affecté à la classe.
            */

            if (! $user->hasRole('SuperAdmin')) {

                $this->checkEducateurClasseAccess(
                    $educateurId,
                    $classe
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ENREGISTREMENT TRANSACTIONNEL
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $validated,
                $classe,
                $educateurId
            ) {

                foreach (
                    $validated['notes']
                    as $ligne
                ) {

                    /*
                    |--------------------------------------------------------------------------
                    | NOTE VIDE
                    |--------------------------------------------------------------------------
                    |
                    | Une ligne sans note n'est pas enregistrée.
                    |
                    */

                    if (
                        ! isset($ligne['note']) ||
                        $ligne['note'] === '' ||
                        $ligne['note'] === null
                    ) {
                        continue;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | ÉLÈVE
                    |--------------------------------------------------------------------------
                    */

                    $eleve =
                        $this->getEleveForClasse(
                            (int) $ligne['eleve_id'],
                            $classe
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | CRÉATION / MISE À JOUR
                    |--------------------------------------------------------------------------
                    |
                    | Une seule conduite par :
                    |
                    | élève + année + classe + période
                    |
                    */

                    Conduite::updateOrCreate(

                        [
                            'eleve_id' =>
                            $eleve->id,

                            'annee_scolaire_id' =>
                            $classe->annee_scolaire_id,

                            'classe_id' =>
                            $classe->id,

                            'periode' =>
                            $validated['periode'],
                        ],

                        [
                            'educateur_id' =>
                            $educateurId,

                            'note' =>
                            $ligne['note'],

                            'observation' =>
                            $ligne['observation']
                                ?? null,
                        ]
                    );
                }
            }
        );

        /*
        |--------------------------------------------------------------------------
        | REDIRECTION
        |--------------------------------------------------------------------------
        */

        return redirect()
            ->route('conduites.index')
            ->with(
                'success',
                'Les notes de conduite ont été enregistrées avec succès.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | EDIT
    |--------------------------------------------------------------------------
    */

    /**
     * Formulaire de modification d'une note.
     */
    public function edit(
        Conduite $conduite
    ): Response {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | CLASSE
        |--------------------------------------------------------------------------
        */

        $classe = $conduite->classe;

        if (! $classe) {

            abort(
                404,
                'La classe associée à cette note est introuvable.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ
        |--------------------------------------------------------------------------
        */

        $this->checkClasseAccess(
            $classe
        );

        /*
        |--------------------------------------------------------------------------
        | VÉRIFICATION DE L'ÉLÈVE
        |--------------------------------------------------------------------------
        |
        | Une conduite historique ne doit pas permettre de contourner
        | l'isolation par établissement.
        |--------------------------------------------------------------------------
        */

        $eleve = $conduite->eleve;

        if (! $eleve) {

            abort(
                404,
                'L’élève associé à cette note est introuvable.'
            );
        }

        if (
            ! $user->hasRole('SuperAdmin') &&
            (int) $eleve->etablissement_id !==
            (int) $user->etablissement_id
        ) {

            abort(
                403,
                'Vous n’êtes pas autorisé à accéder à cette note de conduite.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ SUPPLÉMENTAIRE POUR L'ÉDUCATEUR
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Educateur')) {

            if (
                ! $user->educateur_id ||
                (int) $conduite->educateur_id !==
                (int) $user->educateur_id
            ) {

                abort(
                    403,
                    'Vous n’êtes pas autorisé à modifier cette note de conduite.'
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | RETOUR
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Conduites/Edit',
            [

                'conduite' =>
                $conduite->load([
                    'eleve',
                    'classe',
                    'educateur',
                    'anneeScolaire',
                ]),

            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    /**
     * Modification d'une note.
     *
     * Seuls note et observation peuvent être modifiés.
     */
    public function update(
        UpdateConduiteRequest $request,
        Conduite $conduite
    ): RedirectResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | CLASSE
        |--------------------------------------------------------------------------
        */

        $classe = $conduite->classe;

        if (! $classe) {

            abort(
                404,
                'La classe associée à cette note est introuvable.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ CLASSE
        |--------------------------------------------------------------------------
        */

        $this->checkClasseAccess(
            $classe
        );

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉLÈVE
        |--------------------------------------------------------------------------
        |
        | Important après un transfert :
        | on vérifie l'établissement actuel de l'élève.
        |--------------------------------------------------------------------------
        */

        $eleve = $conduite->eleve;

        if (! $eleve) {

            abort(
                404,
                'L’élève associé à cette note est introuvable.'
            );
        }

        if (
            ! $user->hasRole('SuperAdmin') &&
            (int) $eleve->etablissement_id !==
            (int) $user->etablissement_id
        ) {

            abort(
                403,
                'Vous n’êtes pas autorisé à modifier cette note de conduite.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉDUCATEUR
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Educateur')) {

            if (
                ! $user->educateur_id ||
                (int) $conduite->educateur_id !==
                (int) $user->educateur_id
            ) {

                abort(
                    403,
                    'Vous n’êtes pas autorisé à modifier cette note.'
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | MISE À JOUR
        |--------------------------------------------------------------------------
        */

        $conduite->update(
            $request->validated()
        );

        /*
        |--------------------------------------------------------------------------
        | REDIRECTION
        |--------------------------------------------------------------------------
        */

        return redirect()
            ->route('conduites.index')
            ->with(
                'success',
                'Note de conduite modifiée avec succès.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | DESTROY
    |--------------------------------------------------------------------------
    */

    /**
     * Suppression d'une note de conduite.
     */
    public function destroy(
        Conduite $conduite
    ): RedirectResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | CLASSE
        |--------------------------------------------------------------------------
        */

        $classe = $conduite->classe;

        if (! $classe) {

            abort(
                404,
                'La classe associée à cette note est introuvable.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ CLASSE
        |--------------------------------------------------------------------------
        */

        $this->checkClasseAccess(
            $classe
        );

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉLÈVE
        |--------------------------------------------------------------------------
        */

        $eleve = $conduite->eleve;

        if (! $eleve) {

            abort(
                404,
                'L’élève associé à cette note est introuvable.'
            );
        }

        if (
            ! $user->hasRole('SuperAdmin') &&
            (int) $eleve->etablissement_id !==
            (int) $user->etablissement_id
        ) {

            abort(
                403,
                'Vous n’êtes pas autorisé à supprimer cette note de conduite.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉDUCATEUR
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Educateur')) {

            if (
                ! $user->educateur_id ||
                (int) $conduite->educateur_id !==
                (int) $user->educateur_id
            ) {

                abort(
                    403,
                    'Vous n’êtes pas autorisé à supprimer cette note.'
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | SUPPRESSION
        |--------------------------------------------------------------------------
        */

        $conduite->delete();

        /*
        |--------------------------------------------------------------------------
        | REDIRECTION
        |--------------------------------------------------------------------------
        */

        return redirect()
            ->route('conduites.index')
            ->with(
                'success',
                'Note de conduite supprimée avec succès.'
            );
    }
}
