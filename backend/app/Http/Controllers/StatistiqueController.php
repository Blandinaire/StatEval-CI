<?php

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Etablissement;
use App\Models\Evaluation;
use App\Models\Matiere;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatistiqueController extends Controller
{
    /**
     * Tableau de bord global des statistiques scolaires.
     */
    public function index(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | Filtres
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'etablissement_id' => [
                'nullable',
                'integer',
                'exists:etablissements,id',
            ],

            'annee_scolaire_id' => [
                'nullable',
                'integer',
                'exists:annee_scolaires,id',
            ],

            'classe_id' => [
                'nullable',
                'integer',
                'exists:classes,id',
            ],

            'matiere_id' => [
                'nullable',
                'integer',
                'exists:matieres,id',
            ],
        ]);

        $filtres = [
            'etablissement_id' => $validated['etablissement_id'] ?? '',
            'annee_scolaire_id' => $validated['annee_scolaire_id'] ?? '',
            'classe_id' => $validated['classe_id'] ?? '',
            'matiere_id' => $validated['matiere_id'] ?? '',
        ];

        /*
        |--------------------------------------------------------------------------
        | Requête des évaluations
        |--------------------------------------------------------------------------
        */

        $query = Evaluation::query()
            ->with([
                'etablissement',
                'anneeScolaire',
                'classe',
                'matiere',
                'enseignant',
                'notes.eleve',
            ])
            ->orderByDesc('date_evaluation')
            ->orderByDesc('id');

        /*
        |--------------------------------------------------------------------------
        | Application des filtres
        |--------------------------------------------------------------------------
        */

        if (!empty($filtres['etablissement_id'])) {
            $query->where(
                'etablissement_id',
                $filtres['etablissement_id']
            );
        }

        if (!empty($filtres['annee_scolaire_id'])) {
            $query->where(
                'annee_scolaire_id',
                $filtres['annee_scolaire_id']
            );
        }

        if (!empty($filtres['classe_id'])) {
            $query->where(
                'classe_id',
                $filtres['classe_id']
            );
        }

        if (!empty($filtres['matiere_id'])) {
            $query->where(
                'matiere_id',
                $filtres['matiere_id']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Évaluations sélectionnées
        |--------------------------------------------------------------------------
        */

        $evaluations = $query->get();

        /*
        |--------------------------------------------------------------------------
        | Toutes les notes
        |--------------------------------------------------------------------------
        */

        $notes = $evaluations
            ->flatMap(function ($evaluation) {
                return $evaluation->notes->map(function ($note) use ($evaluation) {

                    /*
                    | On conserve l'évaluation sur chaque note.
                    | Cela permet notamment de connaître son barème.
                    */

                    $note->evaluation_reference = $evaluation;

                    return $note;
                });
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Notes saisies
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
                return (bool) $note->absent;
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Non notés
        |--------------------------------------------------------------------------
        */

        $nonNotes = $notes
            ->filter(function ($note) {
                return !$note->absent && $note->note === null;
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Normalisation des notes sur 20
        |--------------------------------------------------------------------------
        */

        $normaliserSur20 = function ($note, $evaluation) {

            $bareme = (float) $evaluation->bareme;

            if ($bareme <= 0 || $note === null) {
                return null;
            }

            return ((float) $note / $bareme) * 20;
        };

        /*
        |--------------------------------------------------------------------------
        | Valeurs numériques normalisées
        |--------------------------------------------------------------------------
        */

        $valeurs = $notesSaisies
            ->map(function ($note) use ($normaliserSur20) {

                return $normaliserSur20(
                    $note->note,
                    $note->evaluation_reference
                );
            })
            ->filter(function ($value) {
                return $value !== null;
            })
            ->sort()
            ->values();

        $nombreNotes = $valeurs->count();

        /*
        |--------------------------------------------------------------------------
        | Moyenne générale
        |--------------------------------------------------------------------------
        */

        $moyenneGenerale = $nombreNotes > 0
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
        | Meilleure note
        |--------------------------------------------------------------------------
        */

        $meilleureNote = $nombreNotes > 0
            ? $valeurs->max()
            : null;

        /*
        |--------------------------------------------------------------------------
        | Plus faible note
        |--------------------------------------------------------------------------
        */

        $plusFaibleNote = $nombreNotes > 0
            ? $valeurs->min()
            : null;

        /*
        |--------------------------------------------------------------------------
        | Écart-type populationnel
        |--------------------------------------------------------------------------
        */

        $ecartType = null;

        if ($nombreNotes > 0 && $moyenneGenerale !== null) {

            $sommeCarres = $valeurs->reduce(
                function ($total, $valeur) use ($moyenneGenerale) {

                    return $total +
                        pow(
                            $valeur - $moyenneGenerale,
                            2
                        );
                },
                0
            );

            $variance = $sommeCarres / $nombreNotes;

            $ecartType = sqrt($variance);
        }

        /*
|--------------------------------------------------------------------------
| Analyse statistique avancée
|--------------------------------------------------------------------------
|
| Les calculs sont effectués sur les notes normalisées sur 20.
|
*/

        $analyseAvancee = [
            'q1' => null,
            'q2' => $mediane,
            'q3' => null,
            'ecart_interquartile' => null,
            'variance' => null,
            'etendue' => null,
            'coefficient_variation' => null,
            'borne_inferieure' => null,
            'borne_superieure' => null,
            'valeurs_atypiques' => 0,
        ];

        /*
|--------------------------------------------------------------------------
| Fonction de calcul d'un quantile
|--------------------------------------------------------------------------
|
| Méthode d'interpolation linéaire.
|
*/

        $calculerQuantile = function ($valeurs, $p) {

            $n = $valeurs->count();

            if ($n === 0) {
                return null;
            }

            if ($n === 1) {
                return (float) $valeurs->first();
            }

            $position = ($n - 1) * $p;

            $inferieur = floor($position);
            $superieur = ceil($position);

            if ($inferieur === $superieur) {
                return (float) $valeurs[$inferieur];
            }

            $fraction = $position - $inferieur;

            return
                $valeurs[$inferieur]
                +
                (
                    $valeurs[$superieur]
                    - $valeurs[$inferieur]
                ) * $fraction;
        };

        /*
|--------------------------------------------------------------------------
| Quartiles
|--------------------------------------------------------------------------
*/

        if ($nombreNotes > 0) {

            $q1 = $calculerQuantile(
                $valeurs,
                0.25
            );

            $q3 = $calculerQuantile(
                $valeurs,
                0.75
            );

            $analyseAvancee['q1'] =
                $q1 !== null
                ? round($q1, 2)
                : null;

            $analyseAvancee['q3'] =
                $q3 !== null
                ? round($q3, 2)
                : null;

            /*
    |--------------------------------------------------------------------------
    | Écart interquartile
    |--------------------------------------------------------------------------
    */

            if (
                $q1 !== null &&
                $q3 !== null
            ) {

                $iqr = $q3 - $q1;

                $analyseAvancee['ecart_interquartile'] =
                    round($iqr, 2);

                /*
        |--------------------------------------------------------------------------
        | Bornes de détection des valeurs atypiques
        |--------------------------------------------------------------------------
        */

                $borneInferieure =
                    $q1 - (1.5 * $iqr);

                $borneSuperieure =
                    $q3 + (1.5 * $iqr);

                $analyseAvancee['borne_inferieure'] =
                    round($borneInferieure, 2);

                $analyseAvancee['borne_superieure'] =
                    round($borneSuperieure, 2);

                /*
        |--------------------------------------------------------------------------
        | Nombre de valeurs atypiques
        |--------------------------------------------------------------------------
        */

                $analyseAvancee['valeurs_atypiques'] =
                    $valeurs
                    ->filter(function ($valeur) use (
                        $borneInferieure,
                        $borneSuperieure
                    ) {

                        return
                            $valeur < $borneInferieure ||
                            $valeur > $borneSuperieure;
                    })
                    ->count();
            }

            /*
    |--------------------------------------------------------------------------
    | Variance
    |--------------------------------------------------------------------------
    */

            if ($moyenneGenerale !== null) {

                $variance =
                    $valeurs
                    ->map(function ($valeur) use (
                        $moyenneGenerale
                    ) {

                        return pow(
                            $valeur - $moyenneGenerale,
                            2
                        );
                    })
                    ->avg();

                $analyseAvancee['variance'] =
                    round($variance, 2);
            }

            /*
    |--------------------------------------------------------------------------
    | Étendue
    |--------------------------------------------------------------------------
    */

            if (
                $meilleureNote !== null &&
                $plusFaibleNote !== null
            ) {

                $analyseAvancee['etendue'] =
                    round(
                        $meilleureNote -
                            $plusFaibleNote,
                        2
                    );
            }

            /*
    |--------------------------------------------------------------------------
    | Coefficient de variation
    |--------------------------------------------------------------------------
    |
    | CV = écart-type / moyenne × 100
    |
    */

            if (
                $ecartType !== null &&
                $moyenneGenerale !== null &&
                $moyenneGenerale != 0
            ) {

                $analyseAvancee['coefficient_variation'] =
                    round(
                        (
                            $ecartType /
                            $moyenneGenerale
                        ) * 100,
                        2
                    );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Réussites / échecs
        |--------------------------------------------------------------------------
        |
        | Réussite = note >= 10/20
        |
        */

        $reussites = $notesSaisies
            ->filter(function ($note) use ($normaliserSur20) {

                $noteSur20 = $normaliserSur20(
                    $note->note,
                    $note->evaluation_reference
                );

                return $noteSur20 !== null &&
                    $noteSur20 >= 10;
            })
            ->count();

        $echecs = $nombreNotes - $reussites;

        $tauxReussite = $nombreNotes > 0
            ? ($reussites / $nombreNotes) * 100
            : 0;

        $tauxEchec = $nombreNotes > 0
            ? ($echecs / $nombreNotes) * 100
            : 0;

        /*
        |--------------------------------------------------------------------------
        | Taux d'absence
        |--------------------------------------------------------------------------
        */

        $totalEleves = $notes
            ->pluck('eleve_id')
            ->filter()
            ->unique()
            ->count();

        $nombreAbsents = $absents
            ->pluck('eleve_id')
            ->filter()
            ->unique()
            ->count();

        $tauxAbsence = $totalEleves > 0
            ? ($nombreAbsents / $totalEleves) * 100
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

            $noteSur20 = $normaliserSur20(
                $note->note,
                $note->evaluation_reference
            );

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
        | Pourcentages des appréciations
        |--------------------------------------------------------------------------
        */

        $repartition = collect($categories)
            ->map(function ($nombre, $appreciation) use ($nombreNotes) {

                return [
                    'appreciation' => $appreciation,

                    'nombre' => $nombre,

                    'pourcentage' => $nombreNotes > 0
                        ? round(
                            ($nombre / $nombreNotes) * 100,
                            2
                        )
                        : 0,
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Résultats par matière
        |--------------------------------------------------------------------------
        */

        $resultatsParMatiere = $notesSaisies
            ->groupBy(function ($note) {

                return $note->evaluation_reference->matiere_id;
            })
            ->map(function ($notesMatiere) use ($normaliserSur20) {

                $valeursMatiere = $notesMatiere
                    ->map(function ($note) use ($normaliserSur20) {

                        return $normaliserSur20(
                            $note->note,
                            $note->evaluation_reference
                        );
                    })
                    ->filter()
                    ->values();

                if ($valeursMatiere->count() === 0) {
                    return null;
                }

                $matiere = $notesMatiere
                    ->first()
                    ->evaluation_reference
                    ->matiere;

                return [
                    'matiere' => $matiere
                        ? $matiere->libelle
                        : 'Matière inconnue',

                    'nombre' => $valeursMatiere->count(),

                    'moyenne' => round(
                        $valeursMatiere->avg(),
                        2
                    ),

                    'meilleure' => round(
                        $valeursMatiere->max(),
                        2
                    ),

                    'plus_faible' => round(
                        $valeursMatiere->min(),
                        2
                    ),
                ];
            })
            ->filter()
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Résultats par classe
        |--------------------------------------------------------------------------
        */

        $resultatsParClasse = $notesSaisies
            ->groupBy(function ($note) {

                return $note->evaluation_reference->classe_id;
            })
            ->map(function ($notesClasse) use ($normaliserSur20) {

                $valeursClasse = $notesClasse
                    ->map(function ($note) use ($normaliserSur20) {

                        return $normaliserSur20(
                            $note->note,
                            $note->evaluation_reference
                        );
                    })
                    ->filter()
                    ->values();

                if ($valeursClasse->count() === 0) {
                    return null;
                }

                $classe = $notesClasse
                    ->first()
                    ->evaluation_reference
                    ->classe;

                $reussitesClasse = $valeursClasse
                    ->filter(function ($note) {
                        return $note >= 10;
                    })
                    ->count();

                $tauxReussiteClasse =
                    $valeursClasse->count() > 0
                    ? (
                        $reussitesClasse /
                        $valeursClasse->count()
                    ) * 100
                    : 0;

                return [
                    'classe' => $classe
                        ? $classe->libelle
                        : 'Classe inconnue',

                    'nombre' => $valeursClasse->count(),

                    'moyenne' => round(
                        $valeursClasse->avg(),
                        2
                    ),

                    'taux_reussite' => round(
                        $tauxReussiteClasse,
                        2
                    ),
                ];
            })
            ->filter()
            ->values();

        /*
|--------------------------------------------------------------------------
| Distribution des notes
|--------------------------------------------------------------------------
*/

        $distributionNotes = [
            [
                'intervalle' => '0–4,99',
                'nombre' => 0,
            ],
            [
                'intervalle' => '5–7,99',
                'nombre' => 0,
            ],
            [
                'intervalle' => '8–9,99',
                'nombre' => 0,
            ],
            [
                'intervalle' => '10–11,99',
                'nombre' => 0,
            ],
            [
                'intervalle' => '12–13,99',
                'nombre' => 0,
            ],
            [
                'intervalle' => '14–15,99',
                'nombre' => 0,
            ],
            [
                'intervalle' => '16–17,99',
                'nombre' => 0,
            ],
            [
                'intervalle' => '18–20',
                'nombre' => 0,
            ],
        ];

        foreach ($valeurs as $valeur) {

            if ($valeur < 5) {
                $distributionNotes[0]['nombre']++;
            } elseif ($valeur < 8) {
                $distributionNotes[1]['nombre']++;
            } elseif ($valeur < 10) {
                $distributionNotes[2]['nombre']++;
            } elseif ($valeur < 12) {
                $distributionNotes[3]['nombre']++;
            } elseif ($valeur < 14) {
                $distributionNotes[4]['nombre']++;
            } elseif ($valeur < 16) {
                $distributionNotes[5]['nombre']++;
            } elseif ($valeur < 18) {
                $distributionNotes[6]['nombre']++;
            } else {
                $distributionNotes[7]['nombre']++;
            }
        }

        /*
|--------------------------------------------------------------------------
| Pourcentage de chaque intervalle
|--------------------------------------------------------------------------
*/

        foreach ($distributionNotes as &$distribution) {

            $distribution['pourcentage'] = $nombreNotes > 0
                ? round(
                    ($distribution['nombre'] / $nombreNotes) * 100,
                    2
                )
                : 0;
        }

        unset($distribution);

        /*
        |--------------------------------------------------------------------------
        | Statistiques globales
        |--------------------------------------------------------------------------
        */

        $statistiques = [

            'evaluations' => $evaluations->count(),

            'eleves' => $totalEleves,

            'notes_saisies' => $nombreNotes,

            'moyenne_generale' => $moyenneGenerale !== null
                ? round($moyenneGenerale, 2)
                : null,

            'meilleure_note' => $meilleureNote !== null
                ? round($meilleureNote, 2)
                : null,

            'plus_faible_note' => $plusFaibleNote !== null
                ? round($plusFaibleNote, 2)
                : null,

            'mediane' => $mediane !== null
                ? round($mediane, 2)
                : null,

            'ecart_type' => $ecartType !== null
                ? round($ecartType, 2)
                : null,

            'reussites' => $reussites,

            'echecs' => $echecs,

            'taux_reussite' => round(
                $tauxReussite,
                2
            ),

            'taux_echec' => round(
                $tauxEchec,
                2
            ),

            'absents' => $nombreAbsents,

            'taux_absence' => round(
                $tauxAbsence,
                2
            ),

            'non_notes' => $nonNotes
                ->pluck('eleve_id')
                ->filter()
                ->unique()
                ->count(),

            'analyse_avancee' => $analyseAvancee,
        ];

        /*
        |--------------------------------------------------------------------------
        | Données nécessaires aux filtres
        |--------------------------------------------------------------------------
        */

        $etablissements = Etablissement::query()
            ->orderBy('nom')
            ->get();

        $annees = AnneeScolaire::query()
            ->orderByDesc('date_debut')
            ->get();

        $classes = Classe::query()
            ->orderBy('libelle')
            ->get([
                'id',
                'etablissement_id',
                'annee_scolaire_id',
                'libelle',
            ]);

        $matieres = Matiere::query()
            ->orderBy('libelle')
            ->get([
                'id',
                'libelle',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Réponse Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render('Statistiques/Index', [

            'filtres' => $filtres,

            'etablissements' => $etablissements,

            'annees' => $annees,

            'classes' => $classes,

            'matieres' => $matieres,

            'statistiques' => $statistiques,

            'repartition' => $repartition,

            'resultatsParMatiere' => $resultatsParMatiere,

            'resultatsParClasse' => $resultatsParClasse,

            'distributionNotes' => $distributionNotes,

            'analyseAvancee' => $analyseAvancee,
        ]);
    }
}
