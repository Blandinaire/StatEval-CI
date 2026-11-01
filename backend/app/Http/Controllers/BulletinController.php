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
use App\Models\PeriodeScolaire;
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
            ->with([
                'maquette',
                'etablissement',
                'anneeScolaire',
                'professeurPrincipal',
            ])
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
            'professeur_principal_id',
        ]);

        $classeId = $request->integer('classe_id');
        $classe = $classeId
            ? $classes->firstWhere('id', $classeId)
            : null;

        $periodes = collect();
        $eleves = collect();
        $bulletin = null;
        $bulletins = [];
        $configuration = null;
        $modeClasse = $request->boolean('toute_classe');

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

            $periodes = PeriodeScolaire::query()
                ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                ->where('actif', true)
                ->orderBy('ordre')
                ->get([
                    'id',
                    'libelle',
                    'date_debut',
                    'date_fin',
                ]);

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
                    'sexe',
                    'date_naissance',
                    'lieu_naissance',
                    'nationalite',
                    'photo',
                    'redoublant',
                    'regime',
                    'classe_id',
                    'etablissement_id',
                    'annee_scolaire_id',
                ]);

            $eleveId = $request->integer('eleve_id');
            $eleve = $eleveId
                ? $eleves->firstWhere('id', $eleveId)
                : null;

            $periodeId = $request->integer('periode_id');

            $periode = $periodes->firstWhere('id', $periodeId);
            $elevesAProduire = $modeClasse
                ? $eleves
                : collect([$eleve])->filter();

            if ($elevesAProduire->isNotEmpty() && $periode && $classe->maquette) {
                $evaluations = Evaluation::query()
                    ->where('etablissement_id', $classe->etablissement_id)
                    ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                    ->where(function ($query) use ($classe) {
                        $query->where('classe_id', $classe->id)
                            ->orWhereHas('classes', function ($q) use ($classe) {
                                $q->where('classes.id', $classe->id);
                            });
                    })
                    ->where('periode_scolaire_id', $periode->id)
                    ->with(['notes'])
                    ->get();

                $lignesMaquette = $classe->maquette
                    ->lignes()
                    ->with('matiere.parent')
                    ->get();

                // Enseignants affectés à la classe et à l'année scolaire.
                $affectations = Affectation::query()
                    ->with('enseignant')
                    ->where('etablissement_id', $classe->etablissement_id)
                    ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                    ->where('classe_id', $classe->id)
                    ->where('actif', true)
                    ->get()
                    ->keyBy('matiere_id');

                $notesParEleve = $evaluations
                    ->flatMap(function ($evaluation) {
                        return $evaluation->notes->map(function ($note) use ($evaluation) {
                            $note->setRelation('evaluation', $evaluation);

                            return $note;
                        });
                    })
                    ->groupBy('eleve_id');

                $classements = [];
                $moyennesParEleve = [];

                foreach ($eleves as $eleveClasse) {
                    $notesClasse = $notesParEleve->get(
                        $eleveClasse->id,
                        collect()
                    );

                    $resultatClasse = $calcul->calculerMoyennesEleve(
                        $notesClasse,
                        $lignesMaquette
                    );

                    $moyennesParEleve[(int) $eleveClasse->id] =
                        $resultatClasse['moyennes_matieres'];

                    $classements[] = [
                        'eleve_id' => $eleveClasse->id,
                        'moyenne' => $resultatClasse['moyenne_generale'],
                    ];
                }

                usort($classements, function ($a, $b) {
                    return ($b['moyenne'] ?? -1) <=> ($a['moyenne'] ?? -1);
                });

                $rangsGeneraux = [];
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

                    $rangsGeneraux[$resultat['eleve_id']] = $position;
                }

                $rangsParMatiere = [];

                foreach ($lignesMaquette as $ligne) {
                    $matiereId = (int) $ligne->matiere_id;
                    $classementMatiere = [];

                    foreach ($moyennesParEleve as $eleveClasseId => $moyennesClasse) {
                        $moyenneMatiere = $moyennesClasse[$matiereId] ?? null;

                        if ($moyenneMatiere !== null) {
                            $classementMatiere[] = [
                                'eleve_id' => $eleveClasseId,
                                'moyenne' => (float) $moyenneMatiere,
                            ];
                        }
                    }

                    usort(
                        $classementMatiere,
                        fn ($a, $b) => $b['moyenne'] <=> $a['moyenne']
                    );

                    $position = 0;
                    $rangPrecedent = null;

                    foreach ($classementMatiere as $index => $resultat) {
                        if (
                            $rangPrecedent === null ||
                            $resultat['moyenne'] !== $rangPrecedent
                        ) {
                            $position = $index + 1;
                            $rangPrecedent = $resultat['moyenne'];
                        }

                        $rangsParMatiere[$matiereId][$resultat['eleve_id']] =
                            $position;
                    }
                }

                $moyennesClasse = collect($classements)
                    ->pluck('moyenne')
                    ->filter(fn ($moyenne) => $moyenne !== null);

                foreach ($elevesAProduire as $eleve) {
                    $notesEleve = $notesParEleve->get(
                        $eleve->id,
                        collect()
                    );
                    $moyennes = $calcul->calculerMoyennesEleve(
                        $notesEleve,
                        $lignesMaquette
                    );
                    $matieres = [];

                    foreach ($lignesMaquette as $ligne) {
                        $matiereId = (int) $ligne->matiere_id;
                        $notesMatiere = $notesEleve->filter(
                            fn ($note) =>
                                (int) $note->evaluation?->matiere_id === $matiereId
                        );
                        $appreciations = $notesMatiere
                            ->pluck('appreciation')
                            ->filter(
                                fn ($valeur) =>
                                    is_string($valeur) && trim($valeur) !== ''
                            )
                            ->unique()
                            ->values()
                            ->all();
                        $enseignant = $affectations->get($matiereId)?->enseignant;

                        $matieres[] = [
                            'matiere_id' => $matiereId,
                            'matiere' => $ligne->matiere?->libelle ?? 'Matière',
                            'groupe' => $ligne->matiere?->parent?->libelle,
                            'coefficient' => (float) $ligne->coefficient,
                            'moyenne' => $moyennes['moyennes_matieres'][$matiereId] ?? null,
                            'moyenne_ponderee' => (
                                (bool) $ligne->active &&
                                (bool) $ligne->prise_en_compte_moyenne &&
                                isset($moyennes['moyennes_matieres'][$matiereId])
                            )
                                ? round(
                                    (float) $moyennes['moyennes_matieres'][$matiereId]
                                        * (float) $ligne->coefficient,
                                    2
                                )
                                : null,
                            'active' => (bool) $ligne->active,
                            'prise_en_compte_moyenne' => (bool) $ligne->prise_en_compte_moyenne,
                            'appreciation' => implode(' ; ', $appreciations),
                            'professeur' => $enseignant
                                ? trim($enseignant->nom . ' ' . $enseignant->prenoms)
                                : '',
                            'rang' => $rangsParMatiere[$matiereId][$eleve->id] ?? null,
                        ];
                    }

                    $rang = $rangsGeneraux[$eleve->id] ?? null;
                    $lignesComptabilisees = collect($matieres)
                        ->filter(
                            fn ($matiere) =>
                                $matiere['active'] &&
                                $matiere['prise_en_compte_moyenne'] &&
                                $matiere['moyenne'] !== null
                        );

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
                        ->where('periode', $periode->libelle)
                        ->first();

                    $bulletins[] = [
                        'eleve' => [
                        'id' => $eleve->id,
                        'matricule' => $eleve->matricule,
                        'nom' => $eleve->nom,
                        'prenoms' => $eleve->prenoms,
                        'sexe' => $eleve->sexe,
                        'date_naissance' => $eleve->date_naissance?->format('Y-m-d'),
                        'lieu_naissance' => $eleve->lieu_naissance,
                        'nationalite' => $eleve->nationalite,
                        'photo' => $eleve->photo,
                        'redoublant' => (bool) $eleve->redoublant,
                        'regime' => $eleve->regime,
                        ],
                        'classe' => $classe->libelle,
                    'periode' => $periode->libelle,
                    'etablissement' => [
                        'nom' => $classe->etablissement?->nom ?? '',
                        'sigle' => $classe->etablissement?->sigle ?? '',
                        'adresse' => $classe->etablissement?->adresse ?? '',
                        'ville' => $classe->etablissement?->ville ?? '',
                        'telephone' => $classe->etablissement?->telephone ?? '',
                        'email' => $classe->etablissement?->email ?? '',
                        'code' => $classe->etablissement?->code ?? '',
                        'type' => $classe->etablissement?->type ?? '',
                        'direction_regionale' => $classe->etablissement?->direction_regionale ?? '',
                        'directeur' => $classe->etablissement?->directeur ?? '',
                        'logo' => $classe->etablissement?->logo ?? null,
                    ],
                    'annee_scolaire' => $classe->anneeScolaire?->libelle ?? '',
                    'professeur_principal' => $classe->professeurPrincipal
                        ? trim(
                            $classe->professeurPrincipal->nom . ' ' .
                                $classe->professeurPrincipal->prenoms
                        )
                        : null,
                    'matieres' => $matieres,
                    'moyenne_generale' => $moyennes['moyenne_generale'],
                    'moyenne_classe' => $moyennesClasse->avg(),
                    'moyenne_minimale' => $moyennesClasse->min(),
                    'moyenne_maximale' => $moyennesClasse->max(),
                    'rang' => $rang,
                    'effectif_classe' => $eleves->count(),
                    'total_coefficients' => $lignesComptabilisees->sum('coefficient'),
                    'total_points' => $lignesComptabilisees->sum('moyenne_ponderee'),
                    'absences' => [
                        'nombre' => $absences->count(),
                        'heures' => (float) $absences->sum('duree_heures'),
                        'justifiees' => $absences->where('justifiee', true)->count(),
                        'non_justifiees' => $absences->where('justifiee', false)->count(),
                    ],
                    'retards' => [
                        'nombre' => $retards->count(),
                        'minutes' => (int) $retards->sum('duree_minutes'),
                    ],
                    'conduite' => $conduite?->note,
                    'observation_conduite' => $conduite?->observation,
                    ];
                }

                $bulletin = $bulletins[0] ?? null;
            }
        }

        return Inertia::render('Bulletins/Index', [
            'etablissements' => $etablissements,
            'etablissementSelectionne' => $etablissementSelectionne,
            'isSuperAdmin' => $estSuperAdmin,
            'classes' => $classes,
            'classeSelectionnee' => $classeId ?: null,
            'periodes' => $periodes,
            'periodeSelectionnee' => $request->integer('periode_id') ?: null,
            'eleves' => $eleves,
            'eleveSelectionne' => $request->integer('eleve_id') ?: null,
            'bulletin' => $bulletin,
            'bulletins' => $bulletins,
            'modeClasse' => $modeClasse,
            'configuration' => $configuration,
        ]);
    }
}
