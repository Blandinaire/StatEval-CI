<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAffectationRequest;
use App\Models\Affectation;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Etablissement;
use App\Models\Enseignant;
use App\Models\Evaluation;
use App\Models\Matiere;
use App\Models\Niveau;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class AffectationController extends Controller
{
    /**
     * Vérifie que l'utilisateur peut gérer les affectations.
     */
    private function ensureCanManageAffectations(): void
    {
        $user = auth()->user();

        abort_unless(
            $user &&
                $user->hasAnyRole([
                    'SuperAdmin',
                    'Administrateur',
                    'Direction',
                ]),
            403
        );
    }

    /**
     * Synchronise les enseignants des évaluations
     * programmées par l'administration.
     */
    private function synchroniserEvaluationsProgrammees(
        Affectation $affectation
    ): void {
        $evaluations = Evaluation::query()
            ->where('origine', 'administration')
            ->where(
                'etablissement_id',
                $affectation->etablissement_id
            )
            ->where(
                'annee_scolaire_id',
                $affectation->annee_scolaire_id
            )
            ->where(
                'matiere_id',
                $affectation->matiere_id
            )
            ->whereHas('classes', function ($query) use ($affectation) {
                $query->where(
                    'classes.id',
                    $affectation->classe_id
                );
            })
            ->get();

        foreach ($evaluations as $evaluation) {
            $enseignantId = $affectation->actif
                ? $affectation->enseignant_id
                : null;

            $evaluation->classes()->updateExistingPivot(
                $affectation->classe_id,
                [
                    'enseignant_id' => $enseignantId,
                ]
            );

            if (
                (int) $evaluation->classe_id ===
                (int) $affectation->classe_id
            ) {
                $evaluation->update([
                    'enseignant_id' => $enseignantId,
                ]);
            }
        }
    }

    /**
     * Restriction automatique à l'établissement courant
     * lorsque la table possède réellement cette colonne.
     */
    private function restrictToCurrentEtablissement(
        Builder $query,
        string $modelClass
    ): Builder {
        if ($this->isSuperAdmin()) {
            return $query;
        }

        $etablissementId =
            $this->currentEtablissementId();

        $model = new $modelClass;

        $table = $model->getTable();

        if (
            $etablissementId &&
            Schema::hasColumn(
                $table,
                'etablissement_id'
            )
        ) {
            $query->where(
                $table . '.etablissement_id',
                $etablissementId
            );
        }

        return $query;
    }

    /**
     * Vérifie qu'une affectation appartient
     * à l'établissement accessible.
     */
    private function ensureCanAccessAffectation(
        Affectation $affectation
    ): void {
        $this->ensureCanManageAffectations();

        if ($this->isSuperAdmin()) {
            return;
        }

        $etablissementId =
            $this->currentEtablissementId();

        abort_unless(
            (int) $affectation->etablissement_id ===
                (int) $etablissementId,
            403
        );
    }

    /**
     * Liste des affectations.
     */
    public function index(Request $request)
    {
        $this->ensureCanManageAffectations();

        $isSuperAdmin =
            $this->isSuperAdmin();

        $etablissementId =
            $this->currentEtablissementId();

        /*
        |--------------------------------------------------------------------------
        | QUERY PRINCIPALE
        |--------------------------------------------------------------------------
        */

        $query = Affectation::query()
            ->with([
                'etablissement',
                'anneeScolaire',
                'classe.niveau',
                'matiere',
                'enseignant',
            ]);

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (! $isSuperAdmin) {
            $query->where(
                'etablissement_id',
                $etablissementId
            );
        } elseif ($request->filled('etablissement_id')) {
            $query->where(
                'etablissement_id',
                $request->integer('etablissement_id')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ANNÉE SCOLAIRE
        |--------------------------------------------------------------------------
        */

        if ($request->filled('annee_scolaire_id')) {
            $query->where(
                'annee_scolaire_id',
                $request->integer('annee_scolaire_id')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | NIVEAU
        |--------------------------------------------------------------------------
        */

        if ($request->filled('niveau_id')) {
            $query->whereHas(
                'classe',
                function ($q) use ($request) {
                    $q->where(
                        'niveau_id',
                        $request->integer('niveau_id')
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | CLASSE
        |--------------------------------------------------------------------------
        */

        if ($request->filled('classe_id')) {
            $query->where(
                'classe_id',
                $request->integer('classe_id')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | MATIÈRE
        |--------------------------------------------------------------------------
        */

        if ($request->filled('matiere_id')) {
            $query->where(
                'matiere_id',
                $request->integer('matiere_id')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ENSEIGNANT
        |--------------------------------------------------------------------------
        */

        if ($request->filled('enseignant_id')) {
            $query->where(
                'enseignant_id',
                $request->integer('enseignant_id')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | STATUT
        |--------------------------------------------------------------------------
        */

        if (
            $request->has('actif') &&
            $request->input('actif') !== ''
        ) {
            $query->where(
                'actif',
                $request->input('actif') === '1'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | RÉSULTATS
        |--------------------------------------------------------------------------
        */

        $affectations = $query
            ->orderByDesc('id')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | DONNÉES POUR LES FILTRES
        |--------------------------------------------------------------------------
        */

        /*
        | Établissements
        */

        $etablissementsQuery =
            Etablissement::query();

        if (! $isSuperAdmin) {
            $etablissementsQuery->where(
                'id',
                $etablissementId
            );
        }

        $etablissements =
            $etablissementsQuery
            ->orderBy('nom')
            ->get();

        /*
        | Années scolaires
        */

        $annees = AnneeScolaire::query()
            ->orderByDesc('date_debut')
            ->get();

        /*
        | Niveaux
        */

        $niveaux = Niveau::query()
            ->orderBy('ordre')
            ->get();

        /*
        | Classes
        */

        $classesQuery = Classe::query()
            ->with('niveau');

        if (! $isSuperAdmin) {
            $classesQuery->where(
                'etablissement_id',
                $etablissementId
            );
        }

        $classes = $classesQuery
            ->orderBy('libelle')
            ->get();

        /*
        | Matières
        */

        $matieres =
            $this->restrictToCurrentEtablissement(
                Matiere::query(),
                Matiere::class
            )
            ->orderBy('libelle')
            ->get();

        /*
        | Enseignants
        */

        $enseignantsQuery = Enseignant::query()
            ->where('actif', true);

        if (! $isSuperAdmin) {
            $enseignantsQuery->where(
                'etablissement_id',
                $etablissementId
            );
        }

        $enseignants = $enseignantsQuery
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | RÉPONSE INERTIA
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Affectations/Index',
            [
                'affectations' =>
                $affectations,

                'filtres' => [
                    'etablissement_id' =>
                    $request->input(
                        'etablissement_id',
                        ''
                    ),

                    'annee_scolaire_id' =>
                    $request->input(
                        'annee_scolaire_id',
                        ''
                    ),

                    'niveau_id' =>
                    $request->input(
                        'niveau_id',
                        ''
                    ),

                    'classe_id' =>
                    $request->input(
                        'classe_id',
                        ''
                    ),

                    'matiere_id' =>
                    $request->input(
                        'matiere_id',
                        ''
                    ),

                    'enseignant_id' =>
                    $request->input(
                        'enseignant_id',
                        ''
                    ),

                    'actif' =>
                    $request->input(
                        'actif',
                        '1'
                    ),
                ],

                'etablissements' =>
                $etablissements,

                'annees' =>
                $annees,

                'niveaux' =>
                $niveaux,

                'classes' =>
                $classes,

                'matieres' =>
                $matieres,

                'enseignants' =>
                $enseignants,

                'isSuperAdmin' =>
                $isSuperAdmin,

                'canManage' =>
                true,
            ]
        );
    }

    /**
     * Formulaire de création.
     */
    public function create()
    {
        $this->ensureCanManageAffectations();

        $isSuperAdmin =
            $this->isSuperAdmin();

        $etablissementId =
            $this->currentEtablissementId();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENTS
        |--------------------------------------------------------------------------
        */

        $etablissementsQuery =
            Etablissement::query();

        if (! $isSuperAdmin) {
            $etablissementsQuery->where(
                'id',
                $etablissementId
            );
        }

        $etablissements =
            $etablissementsQuery
            ->orderBy('nom')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | ANNÉES
        |--------------------------------------------------------------------------
        */

        $annees =
            AnneeScolaire::query()
            ->orderByDesc('date_debut')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | CLASSES + MAQUETTES
        |--------------------------------------------------------------------------
        */

        $classesQuery =
            Classe::query()
            ->with([
                'maquette.lignes.matiere.enfants',
            ]);

        if (! $isSuperAdmin) {
            $classesQuery->where(
                'etablissement_id',
                $etablissementId
            );
        }

        $classes =
            $classesQuery
            ->orderBy('libelle')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | MATIÈRES
        |--------------------------------------------------------------------------
        */

        $matieres =
            $this->restrictToCurrentEtablissement(
                Matiere::query(),
                Matiere::class
            )
            ->orderBy('libelle')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | ENSEIGNANTS
        |--------------------------------------------------------------------------
        */

        $enseignantsQuery =
            Enseignant::query()
            ->where('actif', true);

        if (! $isSuperAdmin) {
            $enseignantsQuery->where(
                'etablissement_id',
                $etablissementId
            );
        }

        $enseignants =
            $enseignantsQuery
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | AFFECTATIONS EXISTANTES
        |--------------------------------------------------------------------------
        */

        $affectationsExistantesQuery =
            Affectation::query()
            ->with('enseignant')
            ->whereIn(
                'classe_id',
                $classes->pluck('id')
            );

        if (! $isSuperAdmin) {
            $affectationsExistantesQuery->where(
                'etablissement_id',
                $etablissementId
            );
        }

        $affectationsExistantes =
            $affectationsExistantesQuery
            ->get([
                'id',
                'etablissement_id',
                'annee_scolaire_id',
                'classe_id',
                'matiere_id',
                'enseignant_id',
                'coefficient',
                'volume_horaire',
                'actif',
            ]);

        return Inertia::render(
            'Affectations/Create',
            [
                'etablissements' =>
                $etablissements,

                'annees' =>
                $annees,

                'classes' =>
                $classes,

                'matieres' =>
                $matieres,

                'enseignants' =>
                $enseignants,

                'affectationsExistantes' =>
                $affectationsExistantes,

                'isSuperAdmin' =>
                $isSuperAdmin,

                'etablissementId' =>
                $isSuperAdmin
                    ? null
                    : $etablissementId,
            ]
        );
    }

    /**
     * Enregistrement groupé des affectations
     * pour une même classe.
     */
    public function storeBulk(Request $request)
    {
        $this->ensureCanManageAffectations();

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        |
        | IMPORTANT :
        | Le coefficient et le volume horaire ne viennent plus
        | du navigateur. Ils sont récupérés depuis la maquette.
        |
        */

        $data = $request->validate([
            'etablissement_id' => [
                'required',
                'exists:etablissements,id',
            ],

            'annee_scolaire_id' => [
                'required',
                'exists:annee_scolaires,id',
            ],

            'classe_id' => [
                'required',
                'exists:classes,id',
            ],

            'affectations' => [
                'required',
                'array',
                'min:1',
            ],

            'affectations.*.matiere_id' => [
                'required',
                'exists:matieres,id',
            ],

            'affectations.*.enseignant_id' => [
                'required',
                'exists:enseignants,id',
            ],

            'affectations.*.actif' => [
                'nullable',
                'boolean',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (! $this->isSuperAdmin()) {
            $data['etablissement_id'] =
                $this->currentEtablissementId();
        }

        /*
        |--------------------------------------------------------------------------
        | CLASSE
        |--------------------------------------------------------------------------
        */

        $classe = Classe::query()
            ->with([
                'maquette.lignes',
            ])
            ->where(
                'id',
                $data['classe_id']
            )
            ->where(
                'etablissement_id',
                $data['etablissement_id']
            )
            ->where(
                'annee_scolaire_id',
                $data['annee_scolaire_id']
            )
            ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | MAQUETTE
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $classe->maquette,
            422,
            'Cette classe ne possède aucune maquette pédagogique.'
        );

        $lignesMaquette =
            $classe->maquette
            ->lignes
            ->where('active', true)
            ->keyBy('matiere_id');

        abort_unless(
            $lignesMaquette->count() > 0,
            422,
            'La maquette de cette classe ne contient aucune matière active.'
        );

        /*
        |--------------------------------------------------------------------------
        | MATIÈRES ENVOYÉES
        |--------------------------------------------------------------------------
        */

        $matieresEnvoyees =
            collect($data['affectations'])
            ->pluck('matiere_id')
            ->map(
                fn($id) => (int) $id
            );

        /*
        | Pas de doublons
        */

        abort_unless(
            $matieresEnvoyees->unique()->count() ===
                $matieresEnvoyees->count(),
            422,
            'Une même matière ne peut pas être affectée plusieurs fois à cette classe.'
        );

        /*
        | Toutes les matières de la maquette doivent être présentes.
        */

        $matieresMaquette =
            $lignesMaquette
            ->keys()
            ->map(
                fn($id) => (int) $id
            );

        abort_unless(
            $matieresMaquette
                ->diff($matieresEnvoyees)
                ->isEmpty(),
            422,
            'Toutes les matières actives de la maquette doivent être affectées.'
        );

        /*
        |--------------------------------------------------------------------------
        | VÉRIFICATION ENSEIGNANTS
        |--------------------------------------------------------------------------
        */

        foreach ($data['affectations'] as $ligne) {
            $matiereId =
                (int) $ligne['matiere_id'];

            $enseignantId =
                (int) $ligne['enseignant_id'];

            abort_unless(
                $lignesMaquette->has($matiereId),
                422,
                'Une matière sélectionnée ne correspond pas à la maquette de la classe.'
            );

            $matiere = Matiere::findOrFail($matiereId);

            $matiereParentId = $matiere->matiere_parent_id;

            $enseignantExiste = Enseignant::query()
                ->whereKey($enseignantId)
                ->where('etablissement_id', $data['etablissement_id'])
                ->where('actif', true)
                ->where(function ($query) use (
                    $matiereId,
                    $matiereParentId
                ) {
                    $query
                        ->where('matiere_principale_id', $matiereId)
                        ->orWhere('matiere_secondaire_id', $matiereId);

                    if ($matiereParentId) {
                        $query
                            ->orWhere(
                                'matiere_principale_id',
                                $matiereParentId
                            )
                            ->orWhere(
                                'matiere_secondaire_id',
                                $matiereParentId
                            );
                    }
                })
                ->exists();

            abort_unless(
                $enseignantExiste,
                422,
                'L’enseignant sélectionné n’est pas habilité à enseigner cette matière ou sa matière principale.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ENREGISTREMENT TRANSACTIONNEL
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use (
            $data,
            $lignesMaquette
        ) {
            foreach (
                $data['affectations']
                as $ligne
            ) {
                $matiereId =
                    (int) $ligne['matiere_id'];

                $ligneMaquette =
                    $lignesMaquette->get(
                        $matiereId
                    );

                /*
                | Le coefficient et le volume
                | viennent EXCLUSIVEMENT de la maquette.
                */

                $affectation =
                    Affectation::updateOrCreate(
                        [
                            'etablissement_id' =>
                            $data['etablissement_id'],

                            'annee_scolaire_id' =>
                            $data['annee_scolaire_id'],

                            'classe_id' =>
                            $data['classe_id'],

                            'matiere_id' =>
                            $matiereId,
                        ],
                        [
                            'enseignant_id' =>
                            $ligne['enseignant_id'],

                            'coefficient' =>
                            $ligneMaquette->coefficient,

                            'volume_horaire' =>
                            $ligneMaquette->volume_horaire,

                            'actif' =>
                            $ligne['actif'] ?? true,
                        ]
                    );

                /*
                | Synchronisation avec les évaluations
                | institutionnelles déjà programmées.
                */

                $this->synchroniserEvaluationsProgrammees(
                    $affectation
                );
            }
        });

        return redirect()
            ->route('affectations.index')
            ->with(
                'success',
                'Les affectations de la classe ont été enregistrées avec succès.'
            );
    }

    /**
     * Enregistrement d'une affectation individuelle.
     */
    public function store(
        StoreAffectationRequest $request
    ) {
        $this->ensureCanManageAffectations();

        $data = $request->validated();

        if (! $this->isSuperAdmin()) {
            $data['etablissement_id'] =
                $this->currentEtablissementId();
        }

        $affectation =
            Affectation::create($data);

        $this->synchroniserEvaluationsProgrammees(
            $affectation
        );

        return redirect()
            ->route('affectations.index')
            ->with(
                'success',
                'Affectation créée avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(
        Affectation $affectation
    ) {
        $this->ensureCanAccessAffectation(
            $affectation
        );

        $isSuperAdmin =
            $this->isSuperAdmin();

        $etablissementId =
            $this->currentEtablissementId();

        $etablissementsQuery =
            Etablissement::query();

        if (! $isSuperAdmin) {
            $etablissementsQuery->where(
                'id',
                $etablissementId
            );
        }

        $etablissements =
            $etablissementsQuery
            ->orderBy('nom')
            ->get();

        $annees =
            AnneeScolaire::query()
            ->orderByDesc('date_debut')
            ->get();

        $classes =
            $this->restrictToCurrentEtablissement(
                Classe::query(),
                Classe::class
            )
            ->with('maquette.lignes.matiere')
            ->orderBy('libelle')
            ->get();

        $matieres =
            $this->restrictToCurrentEtablissement(
                Matiere::query(),
                Matiere::class
            )
            ->orderBy('libelle')
            ->get();

        $enseignantsQuery =
            Enseignant::query()
            ->where('actif', true);

        if (! $isSuperAdmin) {
            $enseignantsQuery->where(
                'etablissement_id',
                $etablissementId
            );
        }

        $enseignants =
            $enseignantsQuery
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get();

        return Inertia::render(
            'Affectations/Edit',
            [
                'affectation' =>
                $affectation,

                'etablissements' =>
                $etablissements,

                'annees' =>
                $annees,

                'classes' =>
                $classes,

                'matieres' =>
                $matieres,

                'enseignants' =>
                $enseignants,

                'isSuperAdmin' =>
                $isSuperAdmin,

                'etablissementId' =>
                $isSuperAdmin
                    ? null
                    : $etablissementId,
            ]
        );
    }

    /**
     * Mise à jour.
     */
    public function update(
        StoreAffectationRequest $request,
        Affectation $affectation
    ) {
        $this->ensureCanAccessAffectation(
            $affectation
        );

        $data =
            $request->validated();

        if (! $this->isSuperAdmin()) {
            $data['etablissement_id'] =
                $this->currentEtablissementId();
        }

        $affectation->update($data);

        $this->synchroniserEvaluationsProgrammees(
            $affectation->fresh()
        );

        return redirect()
            ->route('affectations.index')
            ->with(
                'success',
                'Affectation modifiée avec succès.'
            );
    }

    /**
     * Suppression.
     */
    public function destroy(
        Affectation $affectation
    ) {
        $this->ensureCanAccessAffectation(
            $affectation
        );

        $affectation->delete();

        return redirect()
            ->route('affectations.index')
            ->with(
                'success',
                'Affectation supprimée avec succès.'
            );
    }

    /**
     * Enseignants correspondant à une matière.
     */
    public function enseignantsParMatiere(
        Request $request,
        $matiereId
    ) {
        $this->ensureCanManageAffectations();

        $query =
            Enseignant::query()
            ->where(
                'actif',
                true
            )
            ->where(function ($query) use (
                $matiereId
            ) {
                $query
                    ->where(
                        'matiere_principale_id',
                        $matiereId
                    )
                    ->orWhere(
                        'matiere_secondaire_id',
                        $matiereId
                    );
            });

        if (! $this->isSuperAdmin()) {
            $query->where(
                'etablissement_id',
                $this->currentEtablissementId()
            );
        } elseif (
            $request->filled(
                'etablissement_id'
            )
        ) {
            $query->where(
                'etablissement_id',
                $request->integer(
                    'etablissement_id'
                )
            );
        }

        $enseignants =
            $query
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get([
                'id',
                'nom',
                'prenoms',
                'etablissement_id',
                'matiere_principale_id',
                'matiere_secondaire_id',
            ]);

        return response()->json(
            $enseignants
        );
    }
}
