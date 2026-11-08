<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affectation;
use App\Models\AnneeScolaire;
use App\Models\Niveau;
use App\Models\Classe;
use App\Models\Evaluation;
use App\Models\Matiere;
use App\Models\PeriodeScolaire;
use App\Models\Eleve;
use App\Models\Note;
use App\Models\Enseignant;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileEvaluationController extends Controller
{
    /**
     * Détermine l'établissement concerné.
     * Le SuperAdmin peut préciser un établissement.
     */
    private function etablissementId(Request $request): ?int
    {
        $user = $request->user();

        if ($user->hasRole('SuperAdmin')) {
            return $request->filled('etablissement_id')
                ? (int) $request->etablissement_id
                : null;
        }

        return (int) $user->etablissement_id;
    }

    /**
     * Liste des évaluations accessibles.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'etablissement_id' => ['nullable', 'integer', 'exists:etablissements,id'],
            'annee_scolaire_id' => ['nullable', 'integer', 'exists:annee_scolaires,id'],
            'classe_id' => ['nullable', 'integer', 'exists:classes,id'],
            'matiere_id' => ['nullable', 'integer', 'exists:matieres,id'],
            'periode_scolaire_id' => ['nullable', 'integer', 'exists:periodes_scolaires,id'],
            'statut' => ['nullable', 'string', 'in:programmee,active,terminee,annulee'],
        ]);

        $user = $request->user();
        $etablissementId = $this->etablissementId($request);

        $query = Evaluation::query()
            ->with([
                'anneeScolaire:id,libelle',
                'periodeScolaire:id,libelle',
                'matiere:id,libelle',
                'classe:id,libelle',
                'classes:id,libelle',
            ])
            ->withCount('notes')
            ->orderByDesc('date_evaluation')
            ->orderByDesc('id');

        if ($etablissementId !== null) {
            $query->where('etablissement_id', $etablissementId);
        }

        if ($user->hasRole('Professeur')) {
            abort_unless(
                !empty($user->enseignant_id),
                403,
                'Votre compte professeur n’est pas rattaché à un enseignant.'
            );

            $query->where(function ($q) use ($user) {
                $q->where(function ($own) use ($user) {
                    $own->where('origine', 'professeur')
                        ->where('enseignant_id', $user->enseignant_id);
                })->orWhere(function ($admin) use ($user) {
                    $admin->where('origine', 'administration')
                        ->whereHas('classes', function ($classes) use ($user) {
                            $classes->where(
                                'evaluation_classes.enseignant_id',
                                $user->enseignant_id
                            );
                        });
                });
            });
        }

        if (!empty($validated['annee_scolaire_id'])) {
            $query->where(
                'annee_scolaire_id',
                $validated['annee_scolaire_id']
            );
        }

        if (!empty($validated['classe_id'])) {
            $classeId = (int) $validated['classe_id'];

            if ($user->hasRole('Professeur')) {
                $affecte = Affectation::query()
                    ->where('enseignant_id', $user->enseignant_id)
                    ->where('classe_id', $classeId)
                    ->where('actif', true)
                    ->exists();

                $programmePourClasse = Evaluation::query()
                    ->where('origine', 'administration')
                    ->whereHas('classes', function ($q) use ($classeId, $user) {
                        $q->where('classes.id', $classeId)
                            ->where(
                                'evaluation_classes.enseignant_id',
                                $user->enseignant_id
                            );
                    })
                    ->exists();

                abort_unless(
                    $affecte || $programmePourClasse,
                    403,
                    'Vous n’êtes pas affecté à cette classe.'
                );
            } elseif (!$user->hasRole('SuperAdmin')) {
                abort_unless(
                    Classe::whereKey($classeId)
                        ->where('etablissement_id', $user->etablissement_id)
                        ->exists(),
                    403
                );
            }

            $query->where(function ($q) use ($classeId) {
                $q->where('classe_id', $classeId)
                    ->orWhereHas('classes', function ($classes) use ($classeId) {
                        $classes->whereKey($classeId);
                    });
            });
        }

        if (!empty($validated['matiere_id'])) {
            $query->where('matiere_id', $validated['matiere_id']);
        }

        if (!empty($validated['periode_scolaire_id'])) {
            $query->where(
                'periode_scolaire_id',
                $validated['periode_scolaire_id']
            );
        }

        if (!empty($validated['statut'])) {
            $query->where('statut', $validated['statut']);
        }

        $evaluations = $query->get();

        $data = $evaluations->map(function (Evaluation $evaluation) use ($user) {
            $classes = $evaluation->classes;

            // Pour un professeur, ne montrer que ses classes
            // dans une évaluation programmée par l'administration.
            if (
                $user->hasRole('Professeur') &&
                $evaluation->origine === 'administration'
            ) {
                $classes = $classes->filter(
                    fn($classe) =>
                    (int) $classe->pivot->enseignant_id ===
                        (int) $user->enseignant_id
                )->values();
            }

            return [
                'id' => $evaluation->id,
                'libelle' => $evaluation->libelle,
                'type' => $evaluation->type,
                'origine' => $evaluation->origine,
                'statut' => $evaluation->statut,
                'date_evaluation' => $evaluation->date_evaluation?->format('Y-m-d'),
                'heure_debut' => $evaluation->heure_debut,
                'heure_fin' => $evaluation->heure_fin,
                'bareme' => $evaluation->bareme,
                'coefficient' => $evaluation->coefficient,
                'prise_en_compte_moyenne' => (bool) $evaluation->prise_en_compte_moyenne,
                'publier_eleves' => (bool) $evaluation->publier_eleves,
                'publier_parents' => (bool) $evaluation->publier_parents,

                'annee_scolaire' => $evaluation->anneeScolaire?->libelle,
                'annee_scolaire_id' => $evaluation->annee_scolaire_id,

                'periode' => $evaluation->periodeScolaire?->libelle
                    ?? $evaluation->periode,
                'periode_scolaire_id' => $evaluation->periode_scolaire_id,

                'matiere' => $evaluation->matiere?->libelle,
                'matiere_id' => $evaluation->matiere_id,

                'classe' => $evaluation->classe?->libelle,
                'classe_id' => $evaluation->classe_id,

                'classes' => $classes->map(fn($classe) => [
                    'id' => $classe->id,
                    'libelle' => $classe->libelle,
                ])->values(),

                'notes_count' => $evaluation->notes_count,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'total' => $data->count(),
            ],
        ]);
    }


    /**
     * Afficher le détail d'une évaluation et les élèves d'une classe.
     */
    public function show(Request $request, Evaluation $evaluation): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'classe_id' => ['nullable', 'integer', 'exists:classes,id'],
        ]);

        $classeId = (int) (
            $validated['classe_id'] ?? $evaluation->classe_id
        );

        abort_unless(
            (int) $evaluation->etablissement_id ===
                (int) $user->etablissement_id ||
                $user->hasRole('SuperAdmin'),
            403,
            'Accès non autorisé à cet établissement.'
        );

        if ($user->hasRole('Professeur')) {
            abort_unless(
                !empty($user->enseignant_id),
                403,
                'Compte professeur non rattaché à un enseignant.'
            );

            if ($evaluation->origine === 'administration') {
                abort_unless(
                    $evaluation->statut === 'active' &&
                        $evaluation->classes()
                        ->whereKey($classeId)
                        ->wherePivot('enseignant_id', $user->enseignant_id)
                        ->exists(),
                    403,
                    'Cette évaluation ne vous est pas attribuée.'
                );
            } else {
                abort_unless(
                    (int) $evaluation->enseignant_id ===
                        (int) $user->enseignant_id &&
                        (int) $evaluation->classe_id === $classeId &&
                        Affectation::query()
                        ->where('etablissement_id', $evaluation->etablissement_id)
                        ->where('annee_scolaire_id', $evaluation->annee_scolaire_id)
                        ->where('classe_id', $classeId)
                        ->where('matiere_id', $evaluation->matiere_id)
                        ->where('enseignant_id', $user->enseignant_id)
                        ->where('actif', true)
                        ->exists(),
                    403,
                    'Vous n’êtes pas affecté à cette classe et cette matière.'
                );
            }
        } elseif (!$user->hasRole('SuperAdmin')) {
            abort_unless(
                $evaluation->classe_id === $classeId ||
                    $evaluation->classes()->whereKey($classeId)->exists(),
                403,
                'Cette classe ne fait pas partie de cette évaluation.'
            );
        }

        $classe = Classe::query()
            ->whereKey($classeId)
            ->where('etablissement_id', $evaluation->etablissement_id)
            ->where('annee_scolaire_id', $evaluation->annee_scolaire_id)
            ->firstOrFail();

        $eleves = Eleve::query()
            ->where('etablissement_id', $evaluation->etablissement_id)
            ->where('annee_scolaire_id', $evaluation->annee_scolaire_id)
            ->where('classe_id', $classeId)
            ->where('actif', true)
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get([
                'id',
                'code_eleve',
                'matricule',
                'nom',
                'prenoms',
                'sexe',
            ]);

        $notes = Note::query()
            ->where('evaluation_id', $evaluation->id)
            ->whereIn('eleve_id', $eleves->pluck('id'))
            ->get()
            ->keyBy('eleve_id');

        $eleves = $eleves->map(function ($eleve) use ($notes) {
            $note = $notes->get($eleve->id);

            return [
                'id' => $eleve->id,
                'code_eleve' => $eleve->code_eleve,
                'matricule' => $eleve->matricule,
                'nom' => $eleve->nom,
                'prenoms' => $eleve->prenoms,
                'sexe' => $eleve->sexe,
                'note' => $note?->note,
                'absent' => (bool) ($note?->absent ?? false),
                'appreciation' => $note?->appreciation,
                'observation' => $note?->observation,
            ];
        });

        return response()->json([
            'data' => [
                'evaluation' => [
                    'id' => $evaluation->id,
                    'libelle' => $evaluation->libelle,
                    'matiere' => $evaluation->matiere?->libelle,
                    'date_evaluation' => $evaluation->date_evaluation?->format('Y-m-d'),
                    'bareme' => $evaluation->bareme,
                    'coefficient' => $evaluation->coefficient,
                    'statut' => $evaluation->statut,
                    'origine' => $evaluation->origine,
                ],
                'classe' => [
                    'id' => $classe->id,
                    'libelle' => $classe->libelle,
                ],
                'eleves' => $eleves,
                'total_eleves' => $eleves->count(),
                'notes_saisies' => $eleves->filter(
                    fn($eleve) => $eleve['note'] !== null || $eleve['absent']
                )->count(),
            ],
        ]);
    }

    /**
     * Enregistrer ou modifier les notes d'une évaluation.
     */
    public function storeNotes(Request $request, Evaluation $evaluation): JsonResponse
    {
        $user = $request->user();

        abort_unless(
            $user->hasRole('Professeur'),
            403,
            'Seul un professeur peut saisir les notes.'
        );

        abort_unless(
            !empty($user->enseignant_id),
            403,
            'Compte professeur non rattaché à un enseignant.'
        );

        $validated = $request->validate([
            'classe_id' => ['required', 'integer', 'exists:classes,id'],
            'notes' => ['required', 'array', 'min:1'],
            'notes.*.eleve_id' => [
                'required',
                'integer',
                'distinct',
                'exists:eleves,id',
            ],
            'notes.*.note' => ['nullable', 'numeric', 'min:0'],
            'notes.*.absent' => ['nullable', 'boolean'],
            'notes.*.observation' => ['nullable', 'string', 'max:2000'],
        ]);

        $classeId = (int) $validated['classe_id'];

        // Vérification de l'affectation et de l'accès à l'évaluation.
        if ($evaluation->origine === 'administration') {
            abort_unless(
                $evaluation->statut === 'active' &&
                    (int) $evaluation->etablissement_id ===
                    (int) $user->etablissement_id &&
                    $evaluation->classes()
                    ->whereKey($classeId)
                    ->wherePivot('enseignant_id', $user->enseignant_id)
                    ->exists(),
                403,
                'Vous ne pouvez pas saisir les notes de cette classe.'
            );
        } else {
            abort_unless(
                (int) $evaluation->etablissement_id ===
                    (int) $user->etablissement_id &&
                    (int) $evaluation->enseignant_id ===
                    (int) $user->enseignant_id &&
                    (int) $evaluation->classe_id === $classeId &&
                    Affectation::query()
                    ->where('etablissement_id', $evaluation->etablissement_id)
                    ->where('annee_scolaire_id', $evaluation->annee_scolaire_id)
                    ->where('classe_id', $classeId)
                    ->where('matiere_id', $evaluation->matiere_id)
                    ->where('enseignant_id', $user->enseignant_id)
                    ->where('actif', true)
                    ->exists(),
                403,
                'Vous n’êtes pas affecté à cette classe et cette matière.'
            );
        }

        $elevesIds = Eleve::query()
            ->where('etablissement_id', $evaluation->etablissement_id)
            ->where('annee_scolaire_id', $evaluation->annee_scolaire_id)
            ->where('classe_id', $classeId)
            ->where('actif', true)
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->all();

        foreach ($validated['notes'] as $index => $ligne) {
            $eleveId = (int) $ligne['eleve_id'];
            $absent = (bool) ($ligne['absent'] ?? false);
            $note = $ligne['note'] ?? null;

            abort_unless(
                in_array($eleveId, $elevesIds, true),
                422,
                'Un élève ne fait pas partie de cette classe.'
            );

            if (!$absent && $note !== null) {
                abort_if(
                    (float) $note > (float) $evaluation->bareme,
                    422,
                    "La note de la ligne " . ($index + 1) .
                        " dépasse le barème de {$evaluation->bareme}."
                );
            }
        }

        DB::transaction(function () use ($validated, $evaluation) {
            foreach ($validated['notes'] as $ligne) {
                $absent = (bool) ($ligne['absent'] ?? false);
                $note = $absent ? null : ($ligne['note'] ?? null);

                $appreciation = '';

                if ($absent) {
                    $appreciation = 'Absent';
                } elseif ($note !== null && (float) $evaluation->bareme > 0) {
                    $noteSur20 = ((float) $note / (float) $evaluation->bareme) * 20;

                    $appreciation = match (true) {
                        $noteSur20 >= 18 => 'Excellent',
                        $noteSur20 >= 16 => 'Très bien',
                        $noteSur20 >= 14 => 'Bien',
                        $noteSur20 >= 12 => 'Assez bien',
                        $noteSur20 >= 11 => 'Moyen',
                        $noteSur20 >= 10 => 'Passable',
                        $noteSur20 >= 8 => 'Insuffisant',
                        $noteSur20 >= 5 => 'Très insuffisant',
                        default => 'Faible',
                    };
                }

                Note::updateOrCreate(
                    [
                        'evaluation_id' => $evaluation->id,
                        'eleve_id' => $ligne['eleve_id'],
                    ],
                    [
                        'note' => $note,
                        'absent' => $absent,
                        'appreciation' => $appreciation,
                        'observation' => $ligne['observation'] ?? null,
                    ]
                );
            }
        });

        return response()->json([
            'message' => 'Les notes ont été enregistrées avec succès.',
        ]);
    }


    /**
     * Programmer une évaluation depuis l'application mobile.
     * Réservé à l'administration, à la direction et au SuperAdmin.
     */
    public function programmer(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_unless(
            $user->hasRole([
                'SuperAdmin',
                'Administrateur',
                'Direction',
                'Directeur',
            ]),
            403,
            'Vous n’êtes pas autorisé à programmer une évaluation.'
        );

        $validated = $request->validate([
            'etablissement_id' => ['required', 'integer', 'exists:etablissements,id'],
            'annee_scolaire_id' => ['required', 'integer', 'exists:annee_scolaires,id'],
            'niveau_id' => ['required', 'integer', 'exists:niveaux,id'],
            'classe_ids' => ['required', 'array', 'min:1'],
            'classe_ids.*' => ['required', 'integer', 'distinct', 'exists:classes,id'],
            'matiere_id' => ['required', 'integer', 'exists:matieres,id'],
            'libelle' => ['required', 'string', 'max:255'],
            'type' => [
                'required',
                'in:Devoir de niveau,Composition trimestrielle,Examen blanc,Devoir commun,Évaluation commune,Test diagnostique,Examen,Autre',
            ],
            'numero' => ['nullable', 'integer', 'min:1'],
            'date_evaluation' => ['required', 'date'],
            'heure_debut' => ['nullable', 'date_format:H:i'],
            'heure_fin' => ['nullable', 'date_format:H:i', 'after:heure_debut'],
            'bareme' => ['required', 'numeric', 'min:1'],
            'coefficient' => ['required', 'numeric', 'min:0.1'],
            'periode_scolaire_id' => [
                'required',
                'integer',
                'exists:periodes_scolaires,id',
            ],
            'prise_en_compte_moyenne' => ['sometimes', 'boolean'],
            'notifier_professeurs' => ['sometimes', 'boolean'],
            'publier_eleves' => ['sometimes', 'boolean'],
            'publier_parents' => ['sometimes', 'boolean'],
        ]);

        // Vérifier l'établissement autorisé.
        abort_unless(
            $user->hasRole('SuperAdmin') ||
                (int) $validated['etablissement_id'] === (int) $user->etablissement_id,
            403,
            'Vous ne pouvez pas programmer une évaluation dans cet établissement.'
        );

        // Vérifier la période scolaire.
        $periodeScolaire = PeriodeScolaire::query()
            ->whereKey($validated['periode_scolaire_id'])
            ->where('annee_scolaire_id', $validated['annee_scolaire_id'])
            ->where('actif', true)
            ->first();

        abort_unless(
            $periodeScolaire,
            422,
            'La période sélectionnée ne correspond pas à l’année scolaire ou est inactive.'
        );

        if (
            $validated['date_evaluation'] < $periodeScolaire->date_debut->format('Y-m-d') ||
            $validated['date_evaluation'] > $periodeScolaire->date_fin->format('Y-m-d')
        ) {
            throw ValidationException::withMessages([
                'date_evaluation' => 'La date doit être comprise dans la période scolaire sélectionnée.',
            ]);
        }

        // Vérifier les classes sélectionnées.
        $classeIds = array_map('intval', $validated['classe_ids']);

        $classes = Classe::query()
            ->whereIn('id', $classeIds)
            ->where('etablissement_id', $validated['etablissement_id'])
            ->where('annee_scolaire_id', $validated['annee_scolaire_id'])
            ->get();

        abort_unless(
            $classes->count() === count($classeIds),
            422,
            'Une ou plusieurs classes ne correspondent pas à cet établissement ou à cette année scolaire.'
        );

        abort_unless(
            $classes->every(
                fn($classe) =>
                (int) $classe->niveau_id === (int) $validated['niveau_id']
            ),
            422,
            'Toutes les classes doivent appartenir au niveau sélectionné.'
        );

        // Vérifier que la matière figure dans la maquette de chaque classe.
        $classes->load('maquette.matieres');

        $matiereValide = $classes->every(
            fn($classe) =>
            $classe->maquette?->matieres->contains(
                'id',
                $validated['matiere_id']
            )
        );

        abort_unless(
            $matiereValide,
            422,
            'La matière sélectionnée ne figure pas dans la maquette de chaque classe.'
        );

        // Récupérer les enseignants affectés à chaque classe.
        $affectations = Affectation::query()
            ->where('etablissement_id', $validated['etablissement_id'])
            ->where('annee_scolaire_id', $validated['annee_scolaire_id'])
            ->whereIn('classe_id', $classes->pluck('id'))
            ->where('matiere_id', $validated['matiere_id'])
            ->where('actif', true)
            ->get()
            ->groupBy('classe_id');

        $classesSansProfesseur = $classes->filter(
            fn($classe) => !$affectations->has($classe->id)
        );

        // Vérifier les conflits de programmation sur les classes.
        $conflitQuery = Evaluation::query()
            ->where('etablissement_id', $validated['etablissement_id'])
            ->whereDate('date_evaluation', $validated['date_evaluation'])
            ->whereIn('statut', ['programmee', 'active'])
            ->whereHas('classes', function ($query) use ($classes) {
                $query->whereIn('classes.id', $classes->pluck('id'));
            });

        if (!empty($validated['heure_debut']) && !empty($validated['heure_fin'])) {
            $conflitQuery->whereNotNull('heure_debut')
                ->whereNotNull('heure_fin')
                ->where('heure_debut', '<', $validated['heure_fin'])
                ->where('heure_fin', '>', $validated['heure_debut']);
        }

        abort_if(
            $conflitQuery->exists(),
            422,
            'Une évaluation est déjà programmée sur une classe sélectionnée à ce moment.'
        );

        $premiereAffectation = $affectations->flatten()->first();

        $donneesEvaluation = [
            'etablissement_id' => $validated['etablissement_id'],
            'annee_scolaire_id' => $validated['annee_scolaire_id'],
            'niveau_id' => $validated['niveau_id'],
            'classe_id' => $classes->first()->id,
            'matiere_id' => $validated['matiere_id'],
            'enseignant_id' => $premiereAffectation?->enseignant_id,
            'origine' => 'administration',
            'statut' => 'programmee',
            'cree_par' => $user->id,
            'active' => false,
            'libelle' => $validated['libelle'],
            'type' => $validated['type'],
            'numero' => $validated['numero'] ?? null,
            'date_evaluation' => $validated['date_evaluation'],
            'heure_debut' => $validated['heure_debut'] ?? null,
            'heure_fin' => $validated['heure_fin'] ?? null,
            'bareme' => $validated['bareme'],
            'coefficient' => $validated['coefficient'],
            'prise_en_compte_moyenne' => $validated['prise_en_compte_moyenne'] ?? true,
            'notifier_professeurs' => $validated['notifier_professeurs'] ?? false,
            'publier_eleves' => $validated['publier_eleves'] ?? false,
            'publier_parents' => $validated['publier_parents'] ?? false,
            'periode_scolaire_id' => $periodeScolaire->id,
            'periode' => $periodeScolaire->libelle,
        ];

        // Enregistrer l'évaluation et ses classes dans une transaction.
        $evaluation = DB::transaction(function () use (
            $donneesEvaluation,
            $classes,
            $affectations
        ) {
            $evaluation = Evaluation::create($donneesEvaluation);

            $evaluation->classes()->sync(
                $classes->mapWithKeys(fn($classe) => [
                    $classe->id => [
                        'enseignant_id' => $affectations
                            ->get($classe->id)
                            ?->first()
                            ?->enseignant_id,
                    ],
                ])->all()
            );

            return $evaluation;
        });

        return response()->json([
            'message' => 'Évaluation programmée avec succès.',
            'data' => [
                'id' => $evaluation->id,
                'libelle' => $evaluation->libelle,
                'statut' => $evaluation->statut,
                'date_evaluation' => $evaluation->date_evaluation?->format('Y-m-d'),
                'classes' => $classes->map(fn($classe) => [
                    'id' => $classe->id,
                    'libelle' => $classe->libelle,
                    'enseignant_attribue' => $affectations->has($classe->id),
                ])->values(),
                'classes_sans_professeur' => $classesSansProfesseur
                    ->pluck('libelle')
                    ->values(),
            ],
        ], 201);
    }


    /**
     * Créer une évaluation directement par un professeur.
     * L'évaluation est immédiatement active.
     */
    public function creerParProfesseur(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_unless(
            $user->hasRole('Professeur'),
            403,
            'Seuls les professeurs peuvent utiliser cette fonctionnalité.'
        );

        abort_unless(
            !empty($user->enseignant_id) &&
                !empty($user->etablissement_id),
            403,
            'Votre compte professeur doit être rattaché à un établissement et à un enseignant.'
        );

        $validated = $request->validate([
            'annee_scolaire_id' => ['required', 'integer', 'exists:annee_scolaires,id'],
            'classe_id' => ['required', 'integer', 'exists:classes,id'],
            'matiere_id' => ['required', 'integer', 'exists:matieres,id'],
            'libelle' => ['required', 'string', 'max:255'],
            'type' => [
                'required',
                'in:Devoir de niveau,Composition trimestrielle,Examen blanc,Devoir commun,Évaluation commune,Test diagnostique,Examen,Autre',
            ],
            'numero' => ['nullable', 'integer', 'min:1'],
            'date_evaluation' => ['required', 'date'],
            'heure_debut' => ['nullable', 'date_format:H:i'],
            'heure_fin' => ['nullable', 'date_format:H:i', 'after:heure_debut'],
            'bareme' => ['required', 'numeric', 'min:1'],
            'coefficient' => ['required', 'numeric', 'min:0.1'],
            'periode_scolaire_id' => [
                'required',
                'integer',
                'exists:periodes_scolaires,id',
            ],
            'prise_en_compte_moyenne' => ['sometimes', 'boolean'],
        ]);

        // Vérifier la classe.
        $classe = Classe::query()
            ->whereKey($validated['classe_id'])
            ->where('etablissement_id', $user->etablissement_id)
            ->where('annee_scolaire_id', $validated['annee_scolaire_id'])
            ->where('active', true)
            ->firstOrFail();

        // Vérifier l'affectation réelle du professeur.
        $affectation = Affectation::query()
            ->where('etablissement_id', $user->etablissement_id)
            ->where('annee_scolaire_id', $validated['annee_scolaire_id'])
            ->where('classe_id', $classe->id)
            ->where('matiere_id', $validated['matiere_id'])
            ->where('enseignant_id', $user->enseignant_id)
            ->where('actif', true)
            ->exists();

        abort_unless(
            $affectation,
            403,
            'Vous n’êtes pas affecté à cette classe et à cette matière.'
        );

        // Vérifier la matière dans la maquette de la classe.
        $classe->load('maquette.matieres');

        abort_unless(
            $classe->maquette?->matieres->contains('id', $validated['matiere_id']),
            422,
            'Cette matière ne figure pas dans la maquette de la classe.'
        );

        // Vérifier la période scolaire.
        $periode = PeriodeScolaire::query()
            ->whereKey($validated['periode_scolaire_id'])
            ->where('annee_scolaire_id', $validated['annee_scolaire_id'])
            ->where('actif', true)
            ->first();

        abort_unless(
            $periode,
            422,
            'La période scolaire sélectionnée est invalide ou inactive.'
        );

        if (
            $validated['date_evaluation'] < $periode->date_debut->format('Y-m-d') ||
            $validated['date_evaluation'] > $periode->date_fin->format('Y-m-d')
        ) {
            throw ValidationException::withMessages([
                'date_evaluation' => 'La date doit être comprise dans la période scolaire sélectionnée.',
            ]);
        }

        // Vérifier les conflits horaires dans la classe.
        if (!empty($validated['heure_debut']) && !empty($validated['heure_fin'])) {
            $conflit = Evaluation::query()
                ->where('etablissement_id', $user->etablissement_id)
                ->where('classe_id', $classe->id)
                ->whereDate('date_evaluation', $validated['date_evaluation'])
                ->whereIn('statut', ['programmee', 'active'])
                ->whereNotNull('heure_debut')
                ->whereNotNull('heure_fin')
                ->where('heure_debut', '<', $validated['heure_fin'])
                ->where('heure_fin', '>', $validated['heure_debut'])
                ->exists();

            abort_if(
                $conflit,
                422,
                'Une autre évaluation est déjà prévue dans cette classe à cet horaire.'
            );
        }

        $evaluation = Evaluation::create([
            'etablissement_id' => $user->etablissement_id,
            'annee_scolaire_id' => $validated['annee_scolaire_id'],
            'periode_scolaire_id' => $periode->id,
            'niveau_id' => $classe->niveau_id,
            'classe_id' => $classe->id,
            'matiere_id' => $validated['matiere_id'],
            'enseignant_id' => $user->enseignant_id,
            'origine' => 'professeur',
            'statut' => 'active',
            'cree_par' => $user->id,
            'active' => true,
            'libelle' => $validated['libelle'],
            'type' => $validated['type'],
            'numero' => $validated['numero'] ?? null,
            'date_evaluation' => $validated['date_evaluation'],
            'heure_debut' => $validated['heure_debut'] ?? null,
            'heure_fin' => $validated['heure_fin'] ?? null,
            'bareme' => $validated['bareme'],
            'coefficient' => $validated['coefficient'],
            'prise_en_compte_moyenne' => $validated['prise_en_compte_moyenne'] ?? true,
            'notifier_professeurs' => false,
            'publier_eleves' => false,
            'publier_parents' => false,
            'periode' => $periode->libelle,
        ]);

        return response()->json([
            'message' => 'Votre évaluation a été créée et activée avec succès.',
            'data' => [
                'id' => $evaluation->id,
                'libelle' => $evaluation->libelle,
                'statut' => $evaluation->statut,
                'origine' => $evaluation->origine,
            ],
        ], 201);
    }


    /**
     * Options nécessaires aux filtres et formulaires mobiles.
     */
    public function options(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'etablissement_id' => ['nullable', 'integer', 'exists:etablissements,id'],
            'annee_scolaire_id' => ['nullable', 'integer', 'exists:annee_scolaires,id'],
        ]);

        $user = $request->user();
        $etablissementId = $this->etablissementId($request);

        $annee = !empty($validated['annee_scolaire_id'])
            ? AnneeScolaire::findOrFail($validated['annee_scolaire_id'])
            : AnneeScolaire::orderByDesc('date_debut')->first();

        $anneeId = $annee?->id;

        $classesQuery = Classe::query()
            ->where('active', true)
            ->orderBy('libelle');

        if ($etablissementId !== null) {
            $classesQuery->where('etablissement_id', $etablissementId);
        }

        if ($anneeId !== null) {
            $classesQuery->where('annee_scolaire_id', $anneeId);
        }

        $matieresQuery = Matiere::query()->orderBy('libelle');

        if ($user->hasRole('Professeur')) {
            abort_unless(
                !empty($user->enseignant_id),
                403,
                'Votre compte professeur n’est pas rattaché à un enseignant.'
            );

            $affectations = Affectation::query()
                ->where('enseignant_id', $user->enseignant_id)
                ->where('actif', true)
                ->when(
                    $etablissementId,
                    fn($q) =>
                    $q->where('etablissement_id', $etablissementId)
                )
                ->when(
                    $anneeId,
                    fn($q) =>
                    $q->where('annee_scolaire_id', $anneeId)
                )
                ->get(['classe_id', 'matiere_id']);

            $classesQuery->whereIn(
                'id',
                $affectations->pluck('classe_id')->unique()
            );

            $matieresQuery->whereIn(
                'id',
                $affectations->pluck('matiere_id')->unique()
            );
        }

        $classes = $classesQuery->get([
            'id',
            'libelle',
            'etablissement_id',
            'annee_scolaire_id',
            'niveau_id',
        ]);

        $matieres = $matieresQuery->get(['id', 'libelle']);

        $periodes = $anneeId
            ? PeriodeScolaire::query()
            ->where('annee_scolaire_id', $anneeId)
            ->where('actif', true)
            ->orderBy('ordre')
            ->get([
                'id',
                'libelle',
                'date_debut',
                'date_fin',
            ])
            : collect();

        $niveaux = \App\Models\Niveau::query()
            ->orderBy('ordre')
            ->orderBy('libelle')
            ->get(['id', 'libelle', 'ordre']);

        $etablissements = $user->hasRole('SuperAdmin')
            ? \App\Models\Etablissement::query()
            ->where('actif', true)
            ->orderBy('nom')
            ->get(['id', 'nom'])
            : collect();

        return response()->json([
            'data' => [
                'annee_scolaire' => $annee ? [
                    'id' => $annee->id,
                    'libelle' => $annee->libelle,
                ] : null,
                'annees' => AnneeScolaire::orderByDesc('date_debut')
                    ->get(['id', 'libelle']),
                'classes' => $classes,
                'matieres' => $matieres,
                'periodes' => $periodes,
                'niveaux' => $niveaux,
                'etablissements' => $etablissements
            ],
        ]);
    }


    /**
     * Vérifie les droits d'accès à une classe pour une évaluation.
     */
    private function verifierAccesClasse(
        Request $request,
        Evaluation $evaluation,
        int $classeId
    ): void {
        $user = $request->user();

        // Vérification de l'établissement.
        if (!$user->hasRole('SuperAdmin')) {
            abort_unless(
                (int) $evaluation->etablissement_id ===
                    (int) $user->etablissement_id,
                403,
                'Cette évaluation ne relève pas de votre établissement.'
            );
        }

        // Vérification de l'appartenance de la classe à l'évaluation.
        $classeAutorisee = $evaluation->origine === 'administration'
            ? $evaluation->classes()->whereKey($classeId)->exists()
            : (int) $evaluation->classe_id === $classeId;

        abort_unless(
            $classeAutorisee,
            403,
            'Cette classe ne fait pas partie de cette évaluation.'
        );

        // Contrôle spécifique au professeur.
        if ($user->hasRole('Professeur')) {
            abort_unless(
                !empty($user->enseignant_id),
                403,
                'Votre compte professeur n’est pas rattaché à un enseignant.'
            );

            if ($evaluation->origine === 'administration') {
                abort_unless(
                    $evaluation->statut === 'active',
                    403,
                    'Cette évaluation n’est pas encore ouverte à la saisie.'
                );

                $affectationEvaluation = $evaluation->classes()
                    ->whereKey($classeId)
                    ->wherePivot('enseignant_id', $user->enseignant_id)
                    ->exists();

                abort_unless(
                    $affectationEvaluation,
                    403,
                    'Vous n’êtes pas désigné pour cette classe.'
                );
            } else {
                abort_unless(
                    (int) $evaluation->enseignant_id ===
                        (int) $user->enseignant_id,
                    403,
                    'Cette évaluation ne vous appartient pas.'
                );

                $affectation = Affectation::query()
                    ->where('etablissement_id', $evaluation->etablissement_id)
                    ->where('annee_scolaire_id', $evaluation->annee_scolaire_id)
                    ->where('classe_id', $classeId)
                    ->where('matiere_id', $evaluation->matiere_id)
                    ->where('enseignant_id', $user->enseignant_id)
                    ->where('actif', true)
                    ->exists();

                abort_unless(
                    $affectation,
                    403,
                    'Vous n’êtes plus affecté à cette classe et cette matière.'
                );
            }
        }
    }

    /**
     * Afficher les élèves et les notes d'une classe pour une évaluation.
     */
    public function notes(
        Request $request,
        Evaluation $evaluation
    ): JsonResponse {
        $validated = $request->validate([
            'classe_id' => ['required', 'integer', 'exists:classes,id'],
        ]);

        $classeId = (int) $validated['classe_id'];

        $this->verifierAccesClasse(
            $request,
            $evaluation,
            $classeId
        );

        $eleves = Eleve::query()
            ->where('etablissement_id', $evaluation->etablissement_id)
            ->where('annee_scolaire_id', $evaluation->annee_scolaire_id)
            ->where('classe_id', $classeId)
            ->where('actif', true)
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get([
                'id',
                'code_eleve',
                'matricule',
                'nom',
                'prenoms',
                'sexe',
            ]);

        $notes = Note::query()
            ->where('evaluation_id', $evaluation->id)
            ->whereIn('eleve_id', $eleves->pluck('id'))
            ->get()
            ->keyBy('eleve_id');

        $elevesAvecNotes = $eleves->map(function ($eleve) use ($notes) {
            $note = $notes->get($eleve->id);

            return [
                'id' => $eleve->id,
                'code_eleve' => $eleve->code_eleve,
                'matricule' => $eleve->matricule,
                'nom' => $eleve->nom,
                'prenoms' => $eleve->prenoms,
                'sexe' => $eleve->sexe,
                'note' => $note ? [
                    'id' => $note->id,
                    'note' => $note->note !== null
                        ? (float) $note->note
                        : null,
                    'absent' => (bool) $note->absent,
                    'appreciation' => $note->appreciation,
                    'observation' => $note->observation,
                ] : null,
            ];
        });

        return response()->json([
            'evaluation' => [
                'id' => $evaluation->id,
                'libelle' => $evaluation->libelle,
                'bareme' => (float) $evaluation->bareme,
                'coefficient' => (float) $evaluation->coefficient,
                'date_evaluation' => $evaluation->date_evaluation?->format('Y-m-d'),
                'matiere' => $evaluation->matiere?->libelle,
            ],
            'classe' => $evaluation->classes()
                ->whereKey($classeId)
                ->first(['classes.id', 'classes.libelle'])
                ?? \App\Models\Classe::findOrFail($classeId),
            'eleves' => $elevesAvecNotes,
        ]);
    }

    /**
     * Enregistrer ou modifier les notes des élèves.
     */
    public function enregistrerNotes(
        Request $request,
        Evaluation $evaluation
    ): JsonResponse {
        $validated = $request->validate([
            'classe_id' => ['required', 'integer', 'exists:classes,id'],
            'notes' => ['required', 'array', 'min:1'],
            'notes.*.eleve_id' => [
                'required',
                'integer',
                'distinct',
                'exists:eleves,id',
            ],
            'notes.*.note' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            'notes.*.absent' => [
                'nullable',
                'boolean',
            ],
            'notes.*.appreciation' => [
                'nullable',
                'string',
                'max:255',
            ],
            'notes.*.observation' => [
                'nullable',
                'string',
            ],
        ]);

        $classeId = (int) $validated['classe_id'];

        $this->verifierAccesClasse(
            $request,
            $evaluation,
            $classeId
        );

        // Vérifier que tous les élèves appartiennent réellement à cette classe.
        $elevesAutorises = Eleve::query()
            ->where('etablissement_id', $evaluation->etablissement_id)
            ->where('annee_scolaire_id', $evaluation->annee_scolaire_id)
            ->where('classe_id', $classeId)
            ->where('actif', true)
            ->whereIn(
                'id',
                collect($validated['notes'])->pluck('eleve_id')
            )
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->all();

        abort_unless(
            count($elevesAutorises) === count($validated['notes']),
            422,
            'Un ou plusieurs élèves ne sont pas autorisés pour cette classe.'
        );

        // Vérifier le barème avant tout enregistrement.
        foreach ($validated['notes'] as $ligne) {
            $absent = (bool) ($ligne['absent'] ?? false);
            $note = $ligne['note'] ?? null;

            if (!$absent && $note !== null) {
                abort_if(
                    (float) $note > (float) $evaluation->bareme,
                    422,
                    "Une note dépasse le barème de {$evaluation->bareme}."
                );
            }
        }

        DB::transaction(function () use ($validated, $evaluation) {
            foreach ($validated['notes'] as $ligne) {
                $absent = (bool) ($ligne['absent'] ?? false);
                $note = $absent ? null : ($ligne['note'] ?? null);

                Note::updateOrCreate(
                    [
                        'evaluation_id' => $evaluation->id,
                        'eleve_id' => $ligne['eleve_id'],
                    ],
                    [
                        'note' => $note,
                        'absent' => $absent,
                        'appreciation' => $absent
                            ? 'Absent'
                            : ($ligne['appreciation'] ?? null),
                        'observation' => $ligne['observation'] ?? null,
                    ]
                );
            }
        });

        return response()->json([
            'message' => 'Les notes ont été enregistrées avec succès.',
        ]);
    }
}
