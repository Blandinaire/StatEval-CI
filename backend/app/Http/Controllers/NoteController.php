<?php

namespace App\Http\Controllers;

use App\Models\Eleve;
use App\Models\Evaluation;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NoteController extends Controller
{
    /**
     * Afficher la liste des évaluations pour la saisie des notes.
     */
    public function index()
    {
        $evaluations = Evaluation::with([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
            'notes',
        ])
            ->orderByDesc('date_evaluation')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Notes/Index', [
            'evaluations' => $evaluations,
        ]);
    }
    
    /**
     * Afficher la saisie des notes d'une évaluation.
     */
    public function create(Evaluation $evaluation)
    {
        $evaluation->load([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
        ]);

        /*
    |--------------------------------------------------------------------------
    | Élèves de la classe concernée
    |--------------------------------------------------------------------------
    */

        $eleves = Eleve::where('etablissement_id', $evaluation->etablissement_id)
            ->where('annee_scolaire_id', $evaluation->annee_scolaire_id)
            ->where('classe_id', $evaluation->classe_id)
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
    |
    | On transforme les notes en tableau indexé par eleve_id.
    | Cela permet à React de retrouver directement la note de chaque élève.
    |--------------------------------------------------------------------------
    */

        $notes = Note::where('evaluation_id', $evaluation->id)
            ->get()
            ->mapWithKeys(function ($note) {
                return [
                    $note->eleve_id => [
                        'id' => $note->id,
                        'eleve_id' => $note->eleve_id,
                        'note' => $note->note,
                        'absent' => (bool) $note->absent,
                        'appreciation' => $note->appreciation,
                        'observation' => $note->observation,
                    ],
                ];
            })
            ->toArray();

        return Inertia::render('Notes/Create', [
            'evaluation' => $evaluation,
            'eleves' => $eleves,
            'notes' => $notes,
        ]);
    }

    /**
     * Enregistrer les notes.
     */
    public function store(Request $request, Evaluation $evaluation)
    {
        $validated = $request->validate([
            'notes' => [
                'required',
                'array',
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

        foreach ($validated['notes'] as $index => $noteData) {

            $note = $noteData['note'] ?? null;
            $absent = $noteData['absent'] ?? false;

            if (!$absent && $note !== null) {

                if ((float) $note > (float) $evaluation->bareme) {

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
        | Vérification des élèves
        |--------------------------------------------------------------------------
        */

        $elevesIds = Eleve::where('etablissement_id', $evaluation->etablissement_id)
            ->where('annee_scolaire_id', $evaluation->annee_scolaire_id)
            ->where('classe_id', $evaluation->classe_id)
            ->where('actif', true)
            ->pluck('id')
            ->toArray();

        foreach ($validated['notes'] as $noteData) {

            if (!in_array((int) $noteData['eleve_id'], $elevesIds, true)) {

                return back()
                    ->withErrors([
                        'notes' =>
                        "Un élève sélectionné n'appartient pas à la classe de cette évaluation.",
                    ])
                    ->withInput();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Enregistrement
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use ($validated, $evaluation) {

            foreach ($validated['notes'] as $noteData) {

                $absent = (bool) ($noteData['absent'] ?? false);

                $note = $absent
                    ? null
                    : ($noteData['note'] ?? null);

                /*
        |--------------------------------------------------------------------------
        | Calcul automatique de l'appréciation
        |--------------------------------------------------------------------------
        */

                $appreciation = '';

                if ($absent) {

                    $appreciation = 'Absent';
                } elseif ($note !== null && $note !== '') {

                    $bareme = (float) $evaluation->bareme;

                    if ($bareme > 0) {

                        /*
                | Normalisation de la note sur 20
                */

                        $noteSur20 = ((float) $note / $bareme) * 20;

                        if ($noteSur20 >= 18) {
                            $appreciation = 'Excellent';
                        } elseif ($noteSur20 >= 16) {
                            $appreciation = 'Très bien';
                        } elseif ($noteSur20 >= 14) {
                            $appreciation = 'Bien';
                        } elseif ($noteSur20 >= 12) {
                            $appreciation = 'Assez bien';
                        } elseif ($noteSur20 >= 11) {
                            $appreciation = 'Moyen';
                        } elseif ($noteSur20 >= 10) {
                            $appreciation = 'Passable';
                        } elseif ($noteSur20 >= 8) {
                            $appreciation = 'Insuffisant';
                        } elseif ($noteSur20 >= 5) {
                            $appreciation = 'Très insuffisant';
                        } else {
                            $appreciation = 'Faible';
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
                        'evaluation_id' => $evaluation->id,
                        'eleve_id' => $noteData['eleve_id'],
                    ],
                    [
                        'note' => $note,

                        'absent' => $absent,

                        'appreciation' => $appreciation,

                        'observation' =>
                        $noteData['observation'] ?? null,
                    ]
                );
            }
        });

        return redirect()
            ->route('evaluations.index')
            ->with('success', 'Les notes ont été enregistrées avec succès.');
    }
}
