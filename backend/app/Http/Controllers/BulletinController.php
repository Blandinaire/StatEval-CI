<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Affectation;
use App\Models\Classe;
use App\Models\ConfigurationBulletin;
use App\Models\Conduite;
use App\Models\Eleve;
use App\Models\Etablissement;
use App\Models\Evaluation;
use App\Models\Retard;
use App\Services\CalculMoyennesService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BulletinController extends Controller
{
    public function index(Request $request, CalculMoyennesService $calcul)
    {
        $user = Auth::user();
        $estSuperAdmin = $user->hasRole('SuperAdmin');

        $etablissements = $estSuperAdmin
            ? Etablissement::orderBy('nom')->get(['id', 'nom'])
            : collect();

        $etablissementSelectionne = $estSuperAdmin
            ? ($request->integer('etablissement_id') ?: null)
            : $user->etablissement_id;

        $queryClasses = Classe::query()
            ->with(['maquette', 'etablissement', 'anneeScolaire'])
            ->orderBy('libelle');

        if ($estSuperAdmin) {
            if ($etablissementSelectionne) {
                $queryClasses->where(
                    'etablissement_id',
                    $etablissementSelectionne
                );
            }
        } else {
            $queryClasses->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        $classes = $queryClasses->get([
            'id',
            'libelle',
            'etablissement_id',
            'annee_scolaire_id',
            'maquette_id',
        ]);

        $classeId = $request->integer('classe_id');
        $classe = $classeId
            ? $classes->firstWhere('id', $classeId)
            : null;

        $periodes = collect();
        $eleves = collect();
        $bulletin = null;
        $configuration = null;

        if ($classe) {
            $etablissementSelectionne = $classe->etablissement_id;

            $configuration = ConfigurationBulletin::firstOrCreate(
                ['etablissement_id' => $classe->etablissement_id],
                [
                    'format' => 'a4',
                    'afficher_appreciations' => true,
                    'afficher_professeurs' => true,
                    'afficher_rang' => true,
                    'afficher_absences_retards' => true,
                    'afficher_conduite' => true,
                    'afficher_observations' => true,
                    'afficher_directeur' => true,
                    'afficher_signatures' => true,
                ]
            );

            $periodes = Evaluation::query()
                ->where('etablissement_id', $classe->etablissement_id)
                ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                ->where(function ($query) use ($classe) {
                    $query->where('classe_id', $classe->id)
                        ->orWhereHas('classes', function ($q) use ($classe) {
                            $q->where('classes.id', $classe->id);
                        });
                })
                ->whereNotNull('periode')
                ->distinct()
                ->orderBy('periode')
                ->pluck('periode')
                ->values();

            $eleves = Eleve::query()
                ->where('etablissement_id', $classe->etablissement_id)
                ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                ->where('classe_id', $classe->id)
                ->where('actif', true)
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'matricule',
                    'nom',
                    'prenoms',
                    'classe_id',
                    'etablissement_id',
                    'annee_scolaire_id',
                ]);

            $eleveId = $request->integer('eleve_id');
            $eleve = $eleveId
                ? $eleves->firstWhere('id', $eleveId)
                : null;

            $periode = $request->input('periode');

            if ($eleve && $periode && $classe->maquette) {
                $evaluations = Evaluation::query()
                    ->where('etablissement_id', $classe->etablissement_id)
                    ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                    ->where(function ($query) use ($classe) {
                        $query->where('classe_id', $classe->id)
                            ->orWhereHas('classes', function ($q) use ($classe) {
                                $q->where('classes.id', $classe->id);
                            });
                    })
                    ->where('periode', $periode)
                    ->with(['notes'])
                    ->get();

                $lignesMaquette = $classe->maquette
                    ->lignes()
                    ->with('matiere')
                    ->get();

                $notesEleve = $evaluations
                    ->flatMap(function ($evaluation) use ($eleve) {
                        return $evaluation->notes
                            ->filter(
                                fn($note) =>
                                (int) $note->eleve_id === (int) $eleve->id
                            )
                            ->map(function ($note) use ($evaluation) {
                                $note->setRelation('evaluation', $evaluation);
                                return $note;
                            });
                    });

                $moyennes = $calcul->calculerMoyennesEleve(
                    $notesEleve,
                    $lignesMaquette
                );

                // Enseignants affectés à la classe et à l'année scolaire.
                $affectations = Affectation::query()
                    ->with('enseignant')
                    ->where('etablissement_id', $classe->etablissement_id)
                    ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                    ->where('classe_id', $classe->id)
                    ->where('actif', true)
                    ->get()
                    ->keyBy('matiere_id');

                $matieres = [];

                foreach ($lignesMaquette as $ligne) {
                    $matiereId = (int) $ligne->matiere_id;

                    $notesMatiere = $notesEleve->filter(
                        fn($note) =>
                        (int) $note->evaluation?->matiere_id === $matiereId
                    );

                    $appreciations = $notesMatiere
                        ->pluck('appreciation')
                        ->filter(
                            fn($valeur) =>
                            is_string($valeur) && trim($valeur) !== ''
                        )
                        ->unique()
                        ->values()
                        ->all();

                    $enseignant = $affectations->get($matiereId)?->enseignant;

                    $matieres[] = [
                        'matiere_id' => $matiereId,
                        'matiere' => $ligne->matiere?->libelle ?? 'Matière',
                        'coefficient' => (float) $ligne->coefficient,
                        'moyenne' => $moyennes['moyennes_matieres'][$matiereId] ?? null,
                        'active' => (bool) $ligne->active,
                        'prise_en_compte_moyenne' => (bool) $ligne->prise_en_compte_moyenne,
                        'appreciation' => implode(' ; ', $appreciations),
                        'professeur' => $enseignant
                            ? trim($enseignant->nom . ' ' . $enseignant->prenoms)
                            : '',
                    ];
                }

                // Rang de l'élève : classement par moyenne générale décroissante.
                $classements = [];

                foreach ($eleves as $eleveClasse) {
                    $notesClasse = $evaluations
                        ->flatMap(function ($evaluation) use ($eleveClasse) {
                            return $evaluation->notes
                                ->filter(
                                    fn($note) =>
                                    (int) $note->eleve_id === (int) $eleveClasse->id
                                )
                                ->map(function ($note) use ($evaluation) {
                                    $note->setRelation('evaluation', $evaluation);
                                    return $note;
                                });
                        });

                    $resultatClasse = $calcul->calculerMoyennesEleve(
                        $notesClasse,
                        $lignesMaquette
                    );

                    $classements[] = [
                        'eleve_id' => $eleveClasse->id,
                        'moyenne' => $resultatClasse['moyenne_generale'],
                    ];
                }

                usort($classements, function ($a, $b) {
                    return ($b['moyenne'] ?? -1) <=> ($a['moyenne'] ?? -1);
                });

                $rang = null;
                $position = 0;
                $rangPrecedent = null;

                foreach ($classements as $index => $resultat) {
                    if ($resultat['moyenne'] === null) {
                        continue;
                    }

                    if (
                        $rangPrecedent === null
                        || (float) $resultat['moyenne'] !== (float) $rangPrecedent
                    ) {
                        $position = $index + 1;
                        $rangPrecedent = $resultat['moyenne'];
                    }

                    if ((int) $resultat['eleve_id'] === (int) $eleve->id) {
                        $rang = $position;
                        break;
                    }
                }

                // Absences et retards de l'année scolaire sélectionnée.
                $absences = Absence::query()
                    ->where('eleve_id', $eleve->id)
                    ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                    ->get(['duree_heures', 'justifiee']);

                $retards = Retard::query()
                    ->where('eleve_id', $eleve->id)
                    ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                    ->get(['duree_minutes']);

                $conduite = Conduite::query()
                    ->where('eleve_id', $eleve->id)
                    ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                    ->where('classe_id', $classe->id)
                    ->where('periode', $periode)
                    ->first();

                $bulletin = [
                    'eleve' => [
                        'id' => $eleve->id,
                        'matricule' => $eleve->matricule,
                        'nom' => $eleve->nom,
                        'prenoms' => $eleve->prenoms,
                    ],
                    'classe' => $classe->libelle,
                    'periode' => $periode,
                    'etablissement' => [
                        'nom' => $classe->etablissement?->nom ?? '',
                        'sigle' => $classe->etablissement?->sigle ?? '',
                        'adresse' => $classe->etablissement?->adresse ?? '',
                        'ville' => $classe->etablissement?->ville ?? '',
                        'telephone' => $classe->etablissement?->telephone ?? '',
                        'directeur' => $classe->etablissement?->directeur ?? '',
                        'logo' => $classe->etablissement?->logo ?? null,
                    ],
                    'annee_scolaire' => $classe->anneeScolaire?->libelle ?? '',
                    'matieres' => $matieres,
                    'moyenne_generale' => $moyennes['moyenne_generale'],
                    'rang' => $rang,
                    'effectif_classe' => $eleves->count(),
                    'absences' => [
                        'nombre' => $absences->count(),
                        'heures' => (float) $absences->sum('duree_heures'),
                        'justifiees' => $absences->where('justifiee', true)->count(),
                    ],
                    'retards' => [
                        'nombre' => $retards->count(),
                        'minutes' => (int) $retards->sum('duree_minutes'),
                    ],
                    'conduite' => $conduite?->note,
                    'observation_conduite' => $conduite?->observation,
                ];
            }
        }

        return Inertia::render('Bulletins/Index', [
            'etablissements' => $etablissements,
            'etablissementSelectionne' => $etablissementSelectionne,
            'isSuperAdmin' => $estSuperAdmin,
            'classes' => $classes,
            'classeSelectionnee' => $classeId ?: null,
            'periodes' => $periodes,
            'periodeSelectionnee' => $request->input('periode'),
            'eleves' => $eleves,
            'eleveSelectionne' => $request->integer('eleve_id') ?: null,
            'bulletin' => $bulletin,
            'configuration' => $configuration,
        ]);
    }
}
