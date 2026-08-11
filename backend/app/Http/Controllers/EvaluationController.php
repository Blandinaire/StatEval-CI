<?php

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Enseignant;
use App\Models\Etablissement;
use App\Models\Evaluation;
use App\Models\Matiere;
use App\Models\Affectation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    /**
     * Afficher la liste des évaluations.
     */
    public function index()
    {
        $evaluations = Evaluation::with([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
        ])
            ->orderByDesc('date_evaluation')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Evaluations/Index', [
            'evaluations' => $evaluations,
        ]);
    }

    /**
     * Afficher le formulaire de création.
     */
    public function create()
    {
        return Inertia::render('Evaluations/Create', [
            'etablissements' => Etablissement::orderBy('nom')->get(),

            'annees' => AnneeScolaire::orderByDesc('date_debut')->get(),

            'classes' => Classe::with([
                'etablissement',
                'anneeScolaire',
            ])
                ->orderBy('libelle')
                ->get(),

            'matieres' => Matiere::orderBy('libelle')->get(),

            'enseignants' => Enseignant::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'affectations' => Affectation::where('actif', 1)
                ->get([
                    'id',
                    'etablissement_id',
                    'annee_scolaire_id',
                    'classe_id',
                    'matiere_id',
                    'enseignant_id',
                ]),
        ]);
    }

    /**
     * Enregistrer une nouvelle évaluation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
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

            'matiere_id' => [
                'required',
                'exists:matieres,id',
            ],

            'enseignant_id' => [
                'required',
                'exists:enseignants,id',
            ],

            'libelle' => [
                'required',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
                'in:Interrogation,Devoir,Composition,Examen,Autre',
            ],

            'numero' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'date_evaluation' => [
                'required',
                'date',
            ],

            'bareme' => [
                'required',
                'integer',
                'in:10,20,30,40,50,60,70,80,90,100',
            ],

            'coefficient' => [
                'required',
                'numeric',
                'in:0.5,1,1.5,2,2.5,3,3.5,4,4.5,5',
            ],

            'periode' => [
                'required',
                'in:Trimestre 1,Trimestre 2,Trimestre 3',
            ],

            'active' => [
                'nullable',
                'boolean',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Vérification de cohérence
        |--------------------------------------------------------------------------
        */

        $classe = Classe::findOrFail($validated['classe_id']);

        if ((int) $classe->etablissement_id !== (int) $validated['etablissement_id']) {
            return back()
                ->withErrors([
                    'classe_id' =>
                    "La classe sélectionnée n'appartient pas à l'établissement choisi.",
                ])
                ->withInput();
        }

        if (
            isset($classe->annee_scolaire_id) &&
            (int) $classe->annee_scolaire_id !== (int) $validated['annee_scolaire_id']
        ) {
            return back()
                ->withErrors([
                    'classe_id' =>
                    "La classe sélectionnée n'appartient pas à l'année scolaire choisie.",
                ])
                ->withInput();
        }

        $affectation = Affectation::where('etablissement_id', $validated['etablissement_id'])
            ->where('annee_scolaire_id', $validated['annee_scolaire_id'])
            ->where('classe_id', $validated['classe_id'])
            ->where('matiere_id', $validated['matiere_id'])
            ->where('enseignant_id', $validated['enseignant_id'])
            ->where('actif', 1)
            ->first();

        if (!$affectation) {
            return back()
                ->withErrors([
                    'enseignant_id' =>
                    "Cet enseignant n'est pas affecté à cette classe et cette matière pour l'année scolaire sélectionnée.",
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | Création
        |--------------------------------------------------------------------------
        */

        $evaluation = Evaluation::create([
            ...$validated,
            'active' => $validated['active'] ?? true,
        ]);

        return redirect()
            ->route('evaluations.index')
            ->with('success', 'Évaluation enregistrée avec succès.');
    }

    /**
     * Afficher une évaluation.
     */
    public function show(Evaluation $evaluation)
    {
        $evaluation->load([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
            'notes.eleve',
        ]);

        return Inertia::render('Evaluations/Show', [
            'evaluation' => $evaluation,
            'notes' => $evaluation->notes,
        ]);
    }

    /**
     * Afficher le formulaire de modification.
     */
    public function edit(Evaluation $evaluation)
    {
        $evaluation->load([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
        ]);

        return Inertia::render('Evaluations/Edit', [
            'evaluation' => $evaluation,

            'etablissements' => Etablissement::orderBy('nom')->get(),

            'annees' => AnneeScolaire::orderByDesc('date_debut')->get(),

            'classes' => Classe::with([
                'etablissement',
                'anneeScolaire',
            ])
                ->orderBy('libelle')
                ->get(),

            'matieres' => Matiere::orderBy('libelle')->get(),

            'enseignants' => Enseignant::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),
        ]);
    }

    /**
     * Mettre à jour une évaluation.
     */
    public function update(Request $request, Evaluation $evaluation)
    {
        $validated = $request->validate([
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

            'matiere_id' => [
                'required',
                'exists:matieres,id',
            ],

            'enseignant_id' => [
                'required',
                'exists:enseignants,id',
            ],

            'libelle' => [
                'required',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
                'in:Interrogation,Devoir,Composition,Examen,Autre',
            ],

            'numero' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'date_evaluation' => [
                'required',
                'date',
            ],

            'bareme' => [
                'required',
                'integer',
                'in:10,20,30,40,50,60,70,80,90,100',
            ],

            'coefficient' => [
                'required',
                'numeric',
                'in:0.5,1,1.5,2,2.5,3,3.5,4,4.5,5',
            ],

            'periode' => [
                'required',
                'in:Trimestre 1,Trimestre 2,Trimestre 3',
            ],

            'active' => [
                'nullable',
                'boolean',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Vérification de cohérence
        |--------------------------------------------------------------------------
        */

        $classe = Classe::findOrFail($validated['classe_id']);

        if ((int) $classe->etablissement_id !== (int) $validated['etablissement_id']) {
            return back()
                ->withErrors([
                    'classe_id' =>
                    "La classe sélectionnée n'appartient pas à l'établissement choisi.",
                ])
                ->withInput();
        }

        if (
            isset($classe->annee_scolaire_id) &&
            (int) $classe->annee_scolaire_id !== (int) $validated['annee_scolaire_id']
        ) {
            return back()
                ->withErrors([
                    'classe_id' =>
                    "La classe sélectionnée n'appartient pas à l'année scolaire choisie.",
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | Mise à jour
        |--------------------------------------------------------------------------
        */

        $evaluation->update([
            ...$validated,
            'active' => $validated['active'] ?? true,
        ]);

        return redirect()
            ->route('evaluations.index')
            ->with('success', 'Évaluation modifiée avec succès.');
    }

    /**
     * Afficher les statistiques d'une évaluation.
     */
    public function statistiques(Evaluation $evaluation)
    {
        $evaluation->load([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
            'notes.eleve',
        ]);

        $notes = $evaluation->notes;

        /*
    |--------------------------------------------------------------------------
    | Notes valides
    |--------------------------------------------------------------------------
    |
    | On exclut :
    | - les absents ;
    | - les notes nulles.
    |
    */

        $notesSaisies = $notes
            ->filter(function ($note) {
                return !$note->absent && $note->note !== null;
            })
            ->values();

        /*
    |--------------------------------------------------------------------------
    | Absents
    |--------------------------------------------------------------------------
    */

        $absents = $notes
            ->filter(function ($note) {
                return $note->absent;
            })
            ->values();

        /*
    |--------------------------------------------------------------------------
    | Notes non saisies
    |--------------------------------------------------------------------------
    */

        $nonNotes = $notes
            ->filter(function ($note) {
                return !$note->absent && $note->note === null;
            })
            ->values();

        /*
    |--------------------------------------------------------------------------
    | Valeurs numériques
    |--------------------------------------------------------------------------
    */

        $valeurs = $notesSaisies
            ->map(function ($note) {
                return (float) $note->note;
            })
            ->sort()
            ->values();

        $nombreNotes = $valeurs->count();

        /*
    |--------------------------------------------------------------------------
    | Moyenne
    |--------------------------------------------------------------------------
    */

        $moyenne = $nombreNotes > 0
            ? $valeurs->avg()
            : null;

        /*
    |--------------------------------------------------------------------------
    | Médiane
    |--------------------------------------------------------------------------
    */

        $mediane = null;

        if ($nombreNotes > 0) {

            $milieu = intdiv($nombreNotes, 2);

            if ($nombreNotes % 2 === 0) {

                $mediane = (
                    $valeurs[$milieu - 1] +
                    $valeurs[$milieu]
                ) / 2;
            } else {

                $mediane = $valeurs[$milieu];
            }
        }

        /*
    |--------------------------------------------------------------------------
    | Meilleure et plus faible note
    |--------------------------------------------------------------------------
    */

        $meilleureNote = $nombreNotes > 0
            ? $valeurs->max()
            : null;

        $plusFaibleNote = $nombreNotes > 0
            ? $valeurs->min()
            : null;

        /*
    |--------------------------------------------------------------------------
    | Écart-type
    |--------------------------------------------------------------------------
    |
    | Écart-type populationnel :
    |
    | sqrt(Σ(x - moyenne)² / N)
    |
    */

        $ecartType = null;

        if ($nombreNotes > 0 && $moyenne !== null) {

            $sommeCarres = $valeurs->reduce(
                function ($total, $valeur) use ($moyenne) {
                    return $total + pow($valeur - $moyenne, 2);
                },
                0
            );

            $variance = $sommeCarres / $nombreNotes;

            $ecartType = sqrt($variance);
        }

        /*
    |--------------------------------------------------------------------------
    | Normalisation sur 20
    |--------------------------------------------------------------------------
    */

        $bareme = (float) $evaluation->bareme;

        $normaliserSur20 = function ($note) use ($bareme) {

            if ($bareme <= 0) {
                return 0;
            }

            return ((float) $note / $bareme) * 20;
        };

        /*
    |--------------------------------------------------------------------------
    | Taux de réussite
    |--------------------------------------------------------------------------
    |
    | Un élève est considéré comme ayant réussi si sa note
    | normalisée est >= 10/20.
    |
    */

        $reussites = $notesSaisies
            ->filter(function ($note) use ($normaliserSur20) {

                return $normaliserSur20($note->note) >= 10;
            })
            ->count();

        $tauxReussite = $nombreNotes > 0
            ? ($reussites / $nombreNotes) * 100
            : 0;

        /*
    |--------------------------------------------------------------------------
    | Taux d'absence
    |--------------------------------------------------------------------------
    */

        $totalEleves = $notes->count();

        $tauxAbsence = $totalEleves > 0
            ? ($absents->count() / $totalEleves) * 100
            : 0;

        /*
    |--------------------------------------------------------------------------
    | Répartition des appréciations
    |--------------------------------------------------------------------------
    */

        $categories = [
            'Excellent' => 0,
            'Très bien' => 0,
            'Bien' => 0,
            'Assez bien' => 0,
            'Moyen' => 0,
            'Passable' => 0,
            'Insuffisant' => 0,
            'Très insuffisant' => 0,
            'Faible' => 0,
        ];

        foreach ($notesSaisies as $note) {

            $noteSur20 = $normaliserSur20($note->note);

            if ($noteSur20 >= 18) {
                $categories['Excellent']++;
            } elseif ($noteSur20 >= 16) {
                $categories['Très bien']++;
            } elseif ($noteSur20 >= 14) {
                $categories['Bien']++;
            } elseif ($noteSur20 >= 12) {
                $categories['Assez bien']++;
            } elseif ($noteSur20 >= 11) {
                $categories['Moyen']++;
            } elseif ($noteSur20 >= 10) {
                $categories['Passable']++;
            } elseif ($noteSur20 >= 8) {
                $categories['Insuffisant']++;
            } elseif ($noteSur20 >= 5) {
                $categories['Très insuffisant']++;
            } else {
                $categories['Faible']++;
            }
        }

        /*
    |--------------------------------------------------------------------------
    | Répartition détaillée
    |--------------------------------------------------------------------------
    */

        $repartition = collect($categories)
            ->map(function ($nombre, $appreciation) use ($nombreNotes) {

                return [
                    'appreciation' => $appreciation,
                    'nombre' => $nombre,
                    'pourcentage' => $nombreNotes > 0
                        ? ($nombre / $nombreNotes) * 100
                        : 0,
                ];
            })
            ->values();

        /*
    |--------------------------------------------------------------------------
    | Notes normalisées
    |--------------------------------------------------------------------------
    */

        $resultats = $notes
            ->map(function ($note) use ($normaliserSur20) {

                return [
                    'id' => $note->id,
                    'eleve_id' => $note->eleve_id,

                    'eleve' => $note->eleve,

                    'note' => $note->note !== null
                        ? (float) $note->note
                        : null,

                    'note_sur_20' => $note->note !== null
                        ? round($normaliserSur20($note->note), 2)
                        : null,

                    'absent' => (bool) $note->absent,

                    'appreciation' => $note->appreciation,
                    'observation' => $note->observation,
                ];
            })
            ->values();

        return Inertia::render('Evaluations/Statistiques', [
            'evaluation' => $evaluation,

            'statistiques' => [
                'total_eleves' => $totalEleves,
                'notes_saisies' => $nombreNotes,
                'absents' => $absents->count(),
                'non_notes' => $nonNotes->count(),

                'moyenne' => $moyenne !== null
                    ? round($moyenne, 2)
                    : null,

                'mediane' => $mediane !== null
                    ? round($mediane, 2)
                    : null,

                'meilleure_note' => $meilleureNote !== null
                    ? round($meilleureNote, 2)
                    : null,

                'plus_faible_note' => $plusFaibleNote !== null
                    ? round($plusFaibleNote, 2)
                    : null,

                'ecart_type' => $ecartType !== null
                    ? round($ecartType, 2)
                    : null,

                'reussites' => $reussites,

                'echecs' => $nombreNotes - $reussites,

                'taux_reussite' => round($tauxReussite, 2),

                'taux_absence' => round($tauxAbsence, 2),
            ],

            'repartition' => $repartition,

            'resultats' => $resultats,
        ]);
    }

    /**
     * Supprimer une évaluation.
     */
    public function destroy(Evaluation $evaluation)
    {
        $evaluation->delete();

        return redirect()
            ->route('evaluations.index')
            ->with('success', 'Évaluation supprimée avec succès.');
    }
}
