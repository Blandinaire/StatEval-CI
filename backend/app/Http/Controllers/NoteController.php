<?php

namespace App\Http\Controllers;

use App\Models\Eleve;
use App\Models\Evaluation;
use App\Models\Note;
use App\Models\Affectation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NoteController extends Controller
{
    /**
     * Vérifie si l'utilisateur est SuperAdmin.
     */
    private function estSuperAdmin($user): bool
    {
        return $user->hasRole('SuperAdmin');
    }

    /**
     * Vérifie si l'utilisateur est professeur.
     */
    private function estProfesseur($user): bool
    {
        return $user->hasRole('Professeur');
    }

    /**
     * Vérifie qu'un professeur possède un enseignant_id.
     */
    private function verifierCompteProfesseur($user): void
    {
        if ($this->estProfesseur($user)) {

            abort_unless(
                !empty($user->enseignant_id),
                403,
                'Votre compte professeur n\'est pas correctement rattaché à votre profil enseignant.'
            );
        }
    }

    /**
     * Vérifie qu'une évaluation est accessible
     * par l'utilisateur connecté.
     */
    private function verifierAccesEvaluation(
        $user,
        Evaluation $evaluation,
        ?int $classeId = null
    ): void {
        $classeId ??= (int) $evaluation->classe_id;

        /*
        |--------------------------------------------------------------------------
        | SuperAdmin
        |--------------------------------------------------------------------------
        */

        if ($this->estSuperAdmin($user)) {
            return;
        }

        if ($evaluation->origine === 'administration') {
            if ($this->estProfesseur($user)) {
                $this->verifierCompteProfesseur($user);
                abort_unless(
                    (int) $evaluation->etablissement_id === (int) $user->etablissement_id &&
                        $evaluation->classes()
                        ->whereKey($classeId)
                        ->wherePivot('enseignant_id', $user->enseignant_id)
                        ->exists(),
                    403
                );

                abort_unless($evaluation->statut === 'active', 403);

                return;
            }

            abort_unless($evaluation->statut === 'active', 403);
            abort_unless(
                $evaluation->classes()->whereKey($classeId)->exists(),
                403
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Professeur
        |--------------------------------------------------------------------------
        */

        if ($this->estProfesseur($user)) {

            $this->verifierCompteProfesseur($user);

            /*
            | Établissement
            */

            abort_unless(
                (int) $evaluation->etablissement_id ===
                    (int) $user->etablissement_id,
                403
            );

            /*
            | Enseignant
            */

            abort_unless(
                (int) $evaluation->enseignant_id ===
                    (int) $user->enseignant_id,
                403
            );

            /*
            |--------------------------------------------------------------------------
            | Affectation
            |--------------------------------------------------------------------------
            */

            $affectationExiste =
                Affectation::query()
                ->where(
                    'etablissement_id',
                    $evaluation->etablissement_id
                )
                ->where(
                    'annee_scolaire_id',
                    $evaluation->annee_scolaire_id
                )
                ->where(
                    'classe_id',
                    $classeId
                )
                ->where(
                    'matiere_id',
                    $evaluation->matiere_id
                )
                ->where(
                    'enseignant_id',
                    $user->enseignant_id
                )
                ->where('actif', true)
                ->exists();

            abort_unless(
                $affectationExiste,
                403
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Autres utilisateurs
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $user->etablissement_id &&
                (int) $evaluation->etablissement_id ===
                (int) $user->etablissement_id,
            403
        );
    }

    /**
     * Afficher les évaluations disponibles pour la saisie.
     */
    public function index()
    {
        $user = auth()->user();

        $query = Evaluation::with([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
            'notes',
        ]);

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR
        |--------------------------------------------------------------------------
        */

        if ($this->estProfesseur($user)) {

            $this->verifierCompteProfesseur($user);

            $query
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->where(function ($query) use ($user) {
                    $query->where('enseignant_id', $user->enseignant_id)
                        ->orWhereHas('classes', function ($classesQuery) use ($user) {
                            $classesQuery->where('evaluation_classes.enseignant_id', $user->enseignant_id);
                        });
                });
        }

        /*
        |--------------------------------------------------------------------------
        | AUTRES UTILISATEURS
        |--------------------------------------------------------------------------
        */ elseif (!$this->estSuperAdmin($user)) {

            $query->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        $evaluations = $query
            ->orderByDesc('date_evaluation')
            ->orderByDesc('id')
            ->get();

        return Inertia::render(
            'Notes/Index',
            [
                'evaluations' =>
                $evaluations,
            ]
        );
    }

    /**
     * Afficher la saisie des notes.
     */
    public function create(
        Evaluation $evaluation
    ) {
        $user = auth()->user();
        $classeId = (int) request('classe_id', $evaluation->classe_id);

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ
        |--------------------------------------------------------------------------
        */

        $this->verifierAccesEvaluation(
            $user,
            $evaluation,
            $classeId
        );

        /*
        |--------------------------------------------------------------------------
        | Chargement de l'évaluation
        |--------------------------------------------------------------------------
        */

        $evaluation->load([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
            'classes',
        ]);

        $classesEvaluation = $evaluation->classes;

        if ($this->estProfesseur($user)) {
            $classesEvaluation = $classesEvaluation
                ->filter(
                    fn($classe) =>
                    (int) $classe->pivot->enseignant_id === (int) $user->enseignant_id
                )
                ->values();
        }

        abort_unless(
            $classesEvaluation->contains('id', $classeId),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Élèves de la classe
        |--------------------------------------------------------------------------
        */

        $eleves = Eleve::query()
            ->where(
                'etablissement_id',
                $evaluation->etablissement_id
            )
            ->where(
                'annee_scolaire_id',
                $evaluation->annee_scolaire_id
            )
            ->where(
                'classe_id',
                $classeId
            )
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

        /*
        |--------------------------------------------------------------------------
        | Notes déjà enregistrées
        |--------------------------------------------------------------------------
        */

        $notes = Note::where(
            'evaluation_id',
            $evaluation->id
        )
            ->get()
            ->mapWithKeys(
                function ($note) {

                    return [
                        $note->eleve_id => [

                            'id' =>
                            $note->id,

                            'eleve_id' =>
                            $note->eleve_id,

                            'note' =>
                            $note->note,

                            'absent' =>
                            (bool) $note->absent,

                            'appreciation' =>
                            $note->appreciation,

                            'observation' =>
                            $note->observation,
                        ],
                    ];
                }
            )
            ->toArray();

        return Inertia::render(
            'Notes/Create',
            [

                'evaluation' =>
                $evaluation,

                'eleves' =>
                $eleves,

                'notes' =>
                $notes,

                'classesEvaluation' => $classesEvaluation,
                'selectedClasseId' => $classeId,
            ]
        );
    }

    /**
     * Enregistrer les notes.
     */
    public function store(
        Request $request,
        Evaluation $evaluation
    ) {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ
        |--------------------------------------------------------------------------
        |
        | Impossible pour un professeur de saisir les notes
        | d'une autre classe ou d'un autre professeur.
        |
        */

        $this->verifierAccesEvaluation(
            $user,
            $evaluation,
            (int) $request->input('classe_id', $evaluation->classe_id)
        );

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([

            'notes' => [
                'required',
                'array',
            ],

            'classe_id' => [
                'nullable',
                'integer',
                'exists:classes,id',
            ],

            'notes.*.eleve_id' => [
                'required',
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

        /*
        |--------------------------------------------------------------------------
        | Vérification du barème
        |--------------------------------------------------------------------------
        */

        foreach (
            $validated['notes']
            as $index => $noteData
        ) {

            $note =
                $noteData['note'] ?? null;

            $absent =
                $noteData['absent'] ?? false;

            if (
                !$absent &&
                $note !== null
            ) {

                if (
                    (float) $note >
                    (float) $evaluation->bareme
                ) {

                    return back()
                        ->withErrors([
                            "notes.$index.note" =>
                            "La note ne peut pas être supérieure au barème de {$evaluation->bareme}.",
                        ])
                        ->withInput();
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Élèves réellement présents dans la classe
        |--------------------------------------------------------------------------
        */

        $classeId = (int) $request->input('classe_id', $evaluation->classe_id);

        $elevesIds =
            Eleve::query()
            ->where(
                'etablissement_id',
                $evaluation->etablissement_id
            )
            ->where(
                'annee_scolaire_id',
                $evaluation->annee_scolaire_id
            )
            ->where(
                'classe_id',
                $classeId
            )
            ->where('actif', true)
            ->pluck('id')
            ->toArray();

        /*
        |--------------------------------------------------------------------------
        | Vérification de chaque élève
        |--------------------------------------------------------------------------
        */

        foreach (
            $validated['notes']
            as $noteData
        ) {

            if (
                !in_array(
                    (int) $noteData['eleve_id'],
                    $elevesIds,
                    true
                )
            ) {

                return back()
                    ->withErrors([
                        'notes' =>
                        'Un élève sélectionné n\'appartient pas à la classe de cette évaluation.',
                    ])
                    ->withInput();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Enregistrement transactionnel
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $validated,
                $evaluation
            ) {

                foreach (
                    $validated['notes']
                    as $noteData
                ) {

                    $absent =
                        (bool) (
                            $noteData['absent']
                            ?? false
                        );

                    $note =
                        $absent
                        ? null
                        : (
                            $noteData['note']
                            ?? null
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Appréciation automatique
                    |--------------------------------------------------------------------------
                    */

                    $appreciation = '';

                    if ($absent) {

                        $appreciation =
                            'Absent';
                    } elseif (
                        $note !== null &&
                        $note !== ''
                    ) {

                        $bareme =
                            (float)
                            $evaluation->bareme;

                        if ($bareme > 0) {

                            $noteSur20 =
                                (
                                    (float) $note /
                                    $bareme
                                ) * 20;

                            if (
                                $noteSur20 >= 18
                            ) {

                                $appreciation =
                                    'Excellent';
                            } elseif (
                                $noteSur20 >= 16
                            ) {

                                $appreciation =
                                    'Très bien';
                            } elseif (
                                $noteSur20 >= 14
                            ) {

                                $appreciation =
                                    'Bien';
                            } elseif (
                                $noteSur20 >= 12
                            ) {

                                $appreciation =
                                    'Assez bien';
                            } elseif (
                                $noteSur20 >= 11
                            ) {

                                $appreciation =
                                    'Moyen';
                            } elseif (
                                $noteSur20 >= 10
                            ) {

                                $appreciation =
                                    'Passable';
                            } elseif (
                                $noteSur20 >= 8
                            ) {

                                $appreciation =
                                    'Insuffisant';
                            } elseif (
                                $noteSur20 >= 5
                            ) {

                                $appreciation =
                                    'Très insuffisant';
                            } else {

                                $appreciation =
                                    'Faible';
                            }
                        }
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Enregistrement
                    |--------------------------------------------------------------------------
                    */

                    Note::updateOrCreate(
                        [
                            'evaluation_id' =>
                            $evaluation->id,

                            'eleve_id' =>
                            $noteData['eleve_id'],
                        ],
                        [
                            'note' =>
                            $note,

                            'absent' =>
                            $absent,

                            'appreciation' =>
                            $appreciation,

                            'observation' =>
                            $noteData['observation']
                                ?? null,
                        ]
                    );
                }
            }
        );

        return redirect()
            ->route('notes.index')
            ->with(
                'success',
                'Les notes ont été enregistrées avec succès.'
            );
    }
}
