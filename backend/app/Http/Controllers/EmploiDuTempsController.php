<?php

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Affectation;
use App\Models\Classe;
use App\Models\CreneauHoraire;
use App\Models\EmploiDuTemps;
use App\Models\EmploiDuTempsLigne;
use App\Models\Enseignant;
use App\Models\EducateurClasse;
use App\Models\Etablissement;
use App\Models\Matiere;
use App\Models\MaquetteMatiere;
use App\Models\Salle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class EmploiDuTempsController extends Controller
{
    /**
     * Affichage de la grille de l'emploi du temps.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $isSuperAdmin = $user->hasRole('SuperAdmin');
        $isProfesseur = $user->hasRole('Professeur');
        $isEducateur = $user->hasRole('Educateur');
        $consultationSeule = $isProfesseur || $isEducateur;

        abort_unless(
            $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Directeur',
                'Direction',
                'Professeur',
                'Educateur',
            ]),
            403
        );

        $etablissements = $isSuperAdmin
            ? Etablissement::query()->orderBy('nom')->get(['id', 'nom'])
            : collect();

        $etablissementId = $isSuperAdmin
            ? $request->integer('etablissement_id')
            : (int) $user->etablissement_id;

        $annees = AnneeScolaire::orderByDesc('id')->get();
        $anneeId = $request->integer(
            'annee_scolaire_id',
            $annees->first()?->id
        );

        $classes = collect();
        $enseignants = collect();
        $creneaux = collect();
        $emploi = null;
        $educateursParClasse = collect();
        $salles = Salle::query()
            ->where('etablissement_id', $etablissementId)
            ->where('active', true)
            ->orderBy('nom')
            ->get([
                'id',
                'nom',
                'type',
                'capacite',
            ]);

        if ($etablissementId && $anneeId) {
            $classes = Classe::query()
                ->where('etablissement_id', $etablissementId)
                ->where('annee_scolaire_id', $anneeId)
                ->with('niveau:id,libelle', 'salle:id,nom,type,capacite')
                ->orderBy('libelle')
                ->get(['id', 'libelle', 'niveau_id', 'maquette_id', 'salle_par_defaut', 'salle_id']);

            $enseignants = Enseignant::query()
                ->where('etablissement_id', $etablissementId)
                ->when(
                    !$isProfesseur,
                    fn($query) => $query->where('actif', true)
                )
                ->when(
                    $isProfesseur,
                    fn($query) => $query->where('id', $user->enseignant_id ?? 0)
                )
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get(['id', 'nom', 'prenoms']);


            $matieresParClasse = $classes->mapWithKeys(function (Classe $classe) {
                $matieres = Matiere::query()
                    ->whereNull('matiere_parent_id')
                    ->where(function ($query) use ($classe) {
                        $query
                            ->whereHas('maquettes', function ($query) use ($classe) {
                                $query->where('maquettes.id', $classe->maquette_id)
                                    ->where('maquette_matieres.active', true);
                            })
                            ->orWhereHas('enfants.maquettes', function ($query) use ($classe) {
                                $query->where('maquettes.id', $classe->maquette_id)
                                    ->where('maquette_matieres.active', true);
                            });
                    })
                    ->orderBy('libelle')
                    ->get(['matieres.id', 'matieres.libelle', 'matieres.code', 'matieres.couleur']);

                $volumes = MaquetteMatiere::query()
                    ->join('matieres as m', 'm.id', '=', 'maquette_matieres.matiere_id')
                    ->where('maquette_matieres.maquette_id', $classe->maquette_id)
                    ->where('maquette_matieres.active', true)
                    ->where(function ($query) use ($matieres) {
                        $ids = $matieres->pluck('id');
                        $query->whereIn('m.id', $ids)
                            ->orWhereIn('m.matiere_parent_id', $ids);
                    })
                    ->selectRaw('COALESCE(m.matiere_parent_id, m.id) as matiere_principale_id, SUM(maquette_matieres.volume_horaire) as volume_horaire')
                    ->groupBy('matiere_principale_id')
                    ->pluck('volume_horaire', 'matiere_principale_id');

                $matieres->each(fn($matiere) => $matiere->setAttribute(
                    'volume_horaire',
                    (float) ($volumes[$matiere->id] ?? 0)
                ));

                return [$classe->id => $matieres];
            });

            $affectations = Affectation::query()
                ->where('etablissement_id', $etablissementId)
                ->where('annee_scolaire_id', $anneeId)
                ->whereIn('classe_id', $classes->pluck('id'))
                ->where('actif', true)
                ->with([
                    'enseignant:id,nom,prenoms',
                    'matiere:id,matiere_parent_id',
                ])
                ->get(['id', 'classe_id', 'matiere_id', 'enseignant_id'])
                ->groupBy('classe_id')
                ->map(fn($byClass) => $byClass
                    ->groupBy(
                        fn($row) => $row->matiere?->matiere_parent_id
                            ?? $row->matiere_id
                    )
                    ->map(fn($rows) => $rows
                        ->unique('enseignant_id')
                        ->map(fn($row) => [
                            'id' => $row->enseignant->id,
                            'nom' => $row->enseignant->nom,
                            'prenoms' => $row->enseignant->prenoms,
                        ])->values()
                    )
                );

            $educateursParClasse = EducateurClasse::query()
                ->where('etablissement_id', $etablissementId)
                ->where('annee_scolaire_id', $anneeId)
                ->whereIn('classe_id', $classes->pluck('id'))
                ->where('actif', true)
                ->whereHas('educateur', fn($query) => $query->where('actif', true))
                ->with('educateur:id,nom,prenoms')
                ->get(['classe_id', 'educateur_id'])
                ->groupBy('classe_id')
                ->map(fn($rows) => $rows->unique('educateur_id')->map(fn($row) => [
                    'id' => $row->educateur->id,
                    'nom' => $row->educateur->nom,
                    'prenoms' => $row->educateur->prenoms,
                ])->values());

            $creneaux = CreneauHoraire::query()
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)
                ->orderBy('ordre')
                ->orderBy('heure_debut')
                ->get();

            $emploi = EmploiDuTemps::query()
                ->where('etablissement_id', $etablissementId)
                ->where('annee_scolaire_id', $anneeId)
                ->with([
                    'etablissement:id,nom',
                    'anneeScolaire:id,libelle',
                    'lignes' => function ($query) use ($classes, $user, $isProfesseur) {
                        $query
                            ->select([
                                'id',
                                'emploi_du_temps_id',
                                'creneau_horaire_id',
                                'classe_id',
                                'groupe',
                                'matiere_id',
                                'activite',
                                'enseignant_id',
                                'educateur_id',
                                'regroupement_id',
                                'bloc_id',
                                'jour',
                                'salle_id',
                                'salle',
                            ])
                            ->whereIn(
                                'classe_id',
                                $classes->pluck('id')
                            )
                            ->when(
                                $isProfesseur,
                                fn($query) => $query->where(
                                    'enseignant_id',
                                    $user->enseignant_id ?? 0
                                )
                            )
                            ->with([
                                'classe:id,libelle',
                                'matiere:id,libelle,code,couleur,matiere_parent_id',
                                'matiere.parent:id,libelle,code,couleur',
                                'enseignant:id,nom,prenoms',
                                'educateur:id,nom,prenoms',
                                'salleAssociee:id,nom,type,capacite',
                                'creneau',
                            ]);
                    },
                ])
                ->first();

            if ($emploi?->ordre_classes) {
                $positions = array_flip(array_map('intval', $emploi->ordre_classes));
                $classes = $classes->sortBy(
                    fn(Classe $classe) => $positions[$classe->id] ?? PHP_INT_MAX
                )->values();
            }
        } else {
            $matieresParClasse = collect();
            $affectations = collect();
        }

        return Inertia::render('EmploiDuTemps/Index', [
            'annees' => $annees,
            'classes' => $classes,
            'enseignants' => $enseignants,
            'consultationSeule' => $consultationSeule,
            'modeConsultation' => $isProfesseur
                ? 'enseignant'
                : ($isEducateur ? 'toutes-classes' : null),
            'creneaux' => $creneaux,
            'emploi' => $emploi,
            'salles' => $salles,
            'matieresParClasse' => $matieresParClasse,
            'enseignantsParClasseMatiere' => $affectations,
            'educateursParClasse' => $educateursParClasse,
            'isSuperAdmin' => $isSuperAdmin,
            'etablissements' => $etablissements,
            'etablissement' => $etablissementId
                ? Etablissement::query()->find($etablissementId, ['id', 'nom'])
                : null,

            'filtres' => [
                'etablissement_id' => $etablissementId,
                'annee_scolaire_id' => $anneeId,
            ],
        ]);
    }

    /**
     * Créer l'emploi du temps de l'établissement
     * pour une année scolaire.
     */
    public function creer(Request $request)
    {
        $user = $request->user();
        $this->autoriserGestion($user);

        $validated = $request->validate([
            'etablissement_id' => ['nullable', 'integer', 'exists:etablissements,id'],
            'annee_scolaire_id' => [
                'required',
                'exists:annee_scolaires,id',
            ],
        ]);

        $etablissementId = $this->etablissementAutorise($user, $validated['etablissement_id'] ?? null);

        $emploi = EmploiDuTemps::firstOrCreate(
            [
                'etablissement_id' => $etablissementId,
                'annee_scolaire_id' => $validated['annee_scolaire_id'],
            ],
            [
                'nom' => 'Emploi du temps',
                'statut' => 'brouillon',
            ]
        );

        return redirect()->route(
            'emplois-du-temps.index',
            [
                'annee_scolaire_id' =>
                $validated['annee_scolaire_id'],
                'etablissement_id' => $etablissementId,
            ]
        );
    }

    /**
     * Enregistrer une ou plusieurs lignes de l'emploi du temps.
     *
     * Plusieurs classes peuvent être regroupées pour un même cours.
     */
    public function enregistrerLigne(Request $request)
    {
        $user = $request->user();
        $this->autoriserGestion($user);

        $validated = $request->validate([
            'emploi_du_temps_id' => [
                'required',
                'exists:emplois_du_temps,id',
            ],

            'creneau_horaire_id' => [
                'required',
                'exists:creneaux_horaires,id',
            ],

            'classe_id' => [
                'nullable',
                'exists:classes,id',
            ],

            'classe_ids' => [
                'nullable',
                'array',
                'min:1',
            ],

            'classe_ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:classes,id',
            ],

            'matiere_id' => [
                'required_without:activite',
                'nullable',
                'integer',
                'exists:matieres,id',
            ],

            'activite' => ['nullable', 'in:HE,CDI,DN', 'required_without:matiere_id'],

            'enseignant_id' => [
                'nullable',
                'exists:enseignants,id',
            ],

            'educateur_id' => ['nullable', 'integer', 'exists:educateurs,id'],
            'double_creneau' => ['nullable', 'boolean'],
            'ligne_id' => ['nullable', 'integer', 'exists:emploi_du_temps_lignes,id'],
            'groupe' => ['nullable', 'string', 'max:50'],

            'jour' => [
                'required',
                'in:lundi,mardi,mercredi,jeudi,vendredi,samedi',
            ],

            'salle_id' => [
                'nullable',
                'integer',
                'exists:salles,id',
            ],
        ]);



        $emploi = EmploiDuTemps::query()
            ->whereKey($validated['emploi_du_temps_id'])
            ->firstOrFail();

        $this->verifierEmploiDuTempsModifiable($emploi);

        $etablissementId = $this->etablissementAutorise(
            $user,
            $emploi->etablissement_id
        );

        /*
    |--------------------------------------------------------------------------
    | Déterminer les classes concernées
    |--------------------------------------------------------------------------
    */

        $classeIds = collect($validated['classe_ids'] ?? []);

        if (
            $classeIds->isEmpty() &&
            !empty($validated['classe_id'])
        ) {
            $classeIds = collect([
                $validated['classe_id'],
            ]);
        }

        if ($classeIds->isEmpty()) {
            throw ValidationException::withMessages([
                'classe_id' => 'Sélectionnez au moins une classe.',
            ]);
        }

        $classeIds = $classeIds
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values();
        $groupe = trim($validated['groupe'] ?? '');

        /*
    |--------------------------------------------------------------------------
    | Vérifier les classes
    |--------------------------------------------------------------------------
    */

        $classes = Classe::query()
            ->whereIn('id', $classeIds)
            ->where(
                'etablissement_id',
                $etablissementId
            )
            ->where(
                'annee_scolaire_id',
                $emploi->annee_scolaire_id
            )
            ->get();

        if ($classes->count() !== $classeIds->count()) {
            throw ValidationException::withMessages([
                'classe_ids' =>
                'Une ou plusieurs classes ne correspondent pas à cet emploi du temps.',
            ]);
        }

        /*
    |--------------------------------------------------------------------------
    | Vérifier la matière dans chaque maquette
    |--------------------------------------------------------------------------
    */

        foreach ($classes as $classe) {
            if (!empty($validated['activite'])) {
                continue;
            }

            $matiereAutorisee = Matiere::query()
                ->whereKey($validated['matiere_id'])
                ->whereNull('matiere_parent_id')
                ->where(function ($query) use ($classe) {
                    $query
                        ->whereHas('maquettes', function ($query) use ($classe) {
                            $query
                                ->where('maquettes.id', $classe->maquette_id)
                                ->where('maquette_matieres.active', true);
                        })
                        ->orWhereHas('enfants.maquettes', function ($query) use ($classe) {
                            $query
                                ->where('maquettes.id', $classe->maquette_id)
                                ->where('maquette_matieres.active', true);
                        });
                })
                ->exists();

            if (!$matiereAutorisee) {
                throw ValidationException::withMessages([
                    'matiere_id' =>
                    "La matière sélectionnée ne figure pas dans la maquette de la classe {$classe->libelle}.",
                ]);
            }
        }

        if (!empty($validated['double_creneau'])) {
            $matiereIds = Matiere::query()
                ->where('id', $validated['matiere_id'])
                ->orWhere('matiere_parent_id', $validated['matiere_id'])
                ->pluck('id');

            foreach ($classes as $classe) {
                $volumeHoraire = MaquetteMatiere::query()
                    ->where('maquette_id', $classe->maquette_id)
                    ->whereIn('matiere_id', $matiereIds)
                    ->where('active', true)
                    ->sum('volume_horaire');

                if ($volumeHoraire < 2) {
                    throw ValidationException::withMessages([
                        'double_creneau' => "La maquette de la classe {$classe->libelle} ne prévoit pas deux heures pour cette matière.",
                    ]);
                }
            }
        }

        /*
    |--------------------------------------------------------------------------
    | Vérifier le créneau
    |--------------------------------------------------------------------------
    */

        $creneau = CreneauHoraire::query()
            ->whereKey($validated['creneau_horaire_id'])
            ->where(
                'etablissement_id',
                $etablissementId
            )
            ->first();

        if (!$creneau) {
            throw ValidationException::withMessages([
                'creneau_horaire_id' =>
                'Le créneau est invalide pour cet établissement.',
            ]);
        }

        if (
            $creneau->type === 'pause' ||
            preg_match(
                '/pause|récré|recre/i',
                $creneau->libelle
            )
        ) {
            throw ValidationException::withMessages([
                'creneau_horaire_id' =>
                'Aucun cours ne peut être ajouté pendant une pause.',
            ]);
        }

        $creneauxCours = collect([$creneau]);
        if (!empty($validated['double_creneau'])) {
            if (!empty($validated['activite'])) {
                throw ValidationException::withMessages([
                    'double_creneau' => 'La durée de deux créneaux est réservée aux matières.',
                ]);
            }

            $creneauSuivant = CreneauHoraire::query()
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)
                ->where('heure_debut', $creneau->heure_fin)
                ->where('type', '!=', 'pause')
                ->orderBy('ordre')
                ->first();

            if (!$creneauSuivant || preg_match('/pause|récré|recre/i', $creneauSuivant->libelle)) {
                throw ValidationException::withMessages([
                    'double_creneau' => 'Aucun créneau de cours consécutif n’est disponible après celui sélectionné.',
                ]);
            }

            $creneauxCours->push($creneauSuivant);
        }

        /*
|--------------------------------------------------------------------------
| Vérifier la salle
|--------------------------------------------------------------------------
*/

        $salle = null;

        if (!empty($validated['salle_id'])) {
            $salle = Salle::query()
                ->whereKey($validated['salle_id'])
                ->where('etablissement_id', $etablissementId)
                ->where('active', true)
                ->first();

            if (!$salle) {
                throw ValidationException::withMessages([
                    'salle_id' =>
                    'La salle sélectionnée est invalide pour cet établissement.',
                ]);
            }
        }

        /*
    |--------------------------------------------------------------------------
    | Rechercher les lignes existantes correspondant à la cellule
    |--------------------------------------------------------------------------
    */

        $lignesExistantes = EmploiDuTempsLigne::query()
            ->where(
                'emploi_du_temps_id',
                $emploi->id
            )
            ->where(
                'jour',
                $validated['jour']
            )
            ->where(
                'creneau_horaire_id',
                $validated['creneau_horaire_id']
            )
            ->whereIn(
                'classe_id',
                $classeIds
            )
            ->get();

        if (!empty($validated['ligne_id'])) {
            $ligneCible = EmploiDuTempsLigne::query()
                ->whereKey($validated['ligne_id'])
                ->where('emploi_du_temps_id', $emploi->id)
                ->firstOrFail();

            if (
                $ligneCible->jour !== $validated['jour'] ||
                (int) $ligneCible->creneau_horaire_id !== (int) $validated['creneau_horaire_id'] ||
                !$classeIds->contains((int) $ligneCible->classe_id)
            ) {
                throw ValidationException::withMessages([
                    'ligne_id' => 'Le cours modifié ne correspond pas aux classes et au créneau sélectionnés.',
                ]);
            }

            $ligneAssociees = collect([$ligneCible]);
            if ($ligneCible->bloc_id) {
                $ligneAssociees = EmploiDuTempsLigne::query()
                    ->where('emploi_du_temps_id', $emploi->id)
                    ->where('bloc_id', $ligneCible->bloc_id)
                    ->get();
            } elseif ($ligneCible->regroupement_id) {
                $ligneAssociees = EmploiDuTempsLigne::query()
                    ->where('emploi_du_temps_id', $emploi->id)
                    ->where('regroupement_id', $ligneCible->regroupement_id)
                    ->get();
            }
            $lignesExistantes = $ligneAssociees;
        } else {
            $lignesExistantes = $lignesExistantes
                ->where('groupe', $groupe)
                ->values();

            if ($lignesExistantes->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'groupe' => 'Un cours existe déjà pour ce groupe sur ce créneau. Modifiez ce cours ou choisissez un groupe d’élèves différent pour ajouter un cours parallèle.',
                ]);
            }
        }

        $blocsExistants = $lignesExistantes->pluck('bloc_id')->filter()->unique();
        if ($blocsExistants->count() > 1) {
            throw ValidationException::withMessages([
                'classe_ids' => 'Les classes sélectionnées appartiennent à plusieurs blocs de cours.',
            ]);
        }
        $ancienBlocId = $blocsExistants->first();
        $lignesAExclure = $lignesExistantes;
        if ($ancienBlocId) {
            $lignesAExclure = EmploiDuTempsLigne::query()
                ->where('emploi_du_temps_id', $emploi->id)
                ->where('bloc_id', $ancienBlocId)
                ->get();
        } elseif ($lignesExistantes->pluck('regroupement_id')->filter()->isNotEmpty()) {
            $lignesAExclure = EmploiDuTempsLigne::query()
                ->where('emploi_du_temps_id', $emploi->id)
                ->where('regroupement_id', $lignesExistantes->pluck('regroupement_id')->filter()->first())
                ->get();
        }
        $idsAExclure = $lignesAExclure->pluck('id');
        $idsAExclure = $idsAExclure->merge(
            $lignesExistantes->pluck('id')
        )->unique()->values();

        /*
    |--------------------------------------------------------------------------
    | Déterminer si nous sommes en train de modifier un regroupement
    |--------------------------------------------------------------------------
    */

        $regroupementsExistants = $lignesExistantes
            ->pluck('regroupement_id')
            ->filter()
            ->unique()
            ->values();

        if ($regroupementsExistants->count() > 1) {
            throw ValidationException::withMessages([
                'classe_ids' =>
                'Les classes sélectionnées appartiennent à plusieurs regroupements différents.',
            ]);
        }

        $ancienRegroupementId =
            $regroupementsExistants->first();

        /*
    |--------------------------------------------------------------------------
    | Si une seule ligne individuelle existe, elle constitue la cible
    | de modification.
    |--------------------------------------------------------------------------
    */

        $ligneIndividuelleExistante = $lignesExistantes
            ->first(
                fn($ligne) =>
                empty($ligne->regroupement_id)
            );

        /*
    |--------------------------------------------------------------------------
    | Déterminer le regroupement final
    |--------------------------------------------------------------------------
    */

        $regroupementId = null;

        if ($ancienRegroupementId) {
            /*
         * On conserve l'identifiant du groupe lors de sa modification.
         */
            $regroupementId = $ancienRegroupementId;
        } elseif ($classeIds->count() > 1) {
            /*
         * Nouveau regroupement.
         */
            $regroupementId = (string) Str::uuid();
        }

        /*
    |--------------------------------------------------------------------------
    | Vérifier l'affectation de l'enseignant
    |--------------------------------------------------------------------------
    */

        $educateurId = $validated['educateur_id'] ?? null;
        if (!empty($validated['activite'])) {
            if (!$educateurId) {
                throw ValidationException::withMessages([
                    'educateur_id' => 'Sélectionnez un éducateur pour cette activité.',
                ]);
            }

            $affectationsEducateur = EducateurClasse::query()
                ->where('etablissement_id', $etablissementId)
                ->where('annee_scolaire_id', $emploi->annee_scolaire_id)
                ->whereIn('classe_id', $classeIds)
                ->where('educateur_id', $educateurId)
                ->where('actif', true)
                ->whereHas('educateur', fn($query) => $query->where('actif', true))
                ->pluck('classe_id')
                ->map(fn($id) => (int) $id)
                ->unique();

            if ($affectationsEducateur->sort()->values()->all() !== $classeIds->sort()->values()->all()) {
                throw ValidationException::withMessages([
                    'educateur_id' => 'Cet éducateur doit être affecté à toutes les classes sélectionnées.',
                ]);
            }
        }

        if (empty($validated['activite']) && !empty($validated['enseignant_id'])) {
        $matieresAffectables = Matiere::query()
            ->where('matiere_parent_id', $validated['matiere_id'])
            ->pluck('id')
            ->push((int) $validated['matiere_id']);

        foreach ($classes as $classe) {
            $enseignantAffecte = Affectation::query()
                ->where(
                        'etablissement_id',
                        $etablissementId
                    )
                    ->where(
                        'annee_scolaire_id',
                        $emploi->annee_scolaire_id
                    )
                    ->where(
                        'classe_id',
                        $classe->id
                    )
                    ->whereIn('matiere_id', $matieresAffectables)
                    ->where(
                        'enseignant_id',
                        $validated['enseignant_id']
                    )
                    ->where(
                        'actif',
                        true
                    )
                    ->exists();

                if (!$enseignantAffecte) {
                    throw ValidationException::withMessages([
                        'enseignant_id' =>
                        "Cet enseignant n’est pas affecté à la matière sélectionnée dans la classe {$classe->libelle}.",
                    ]);
                }
            }
        }

        $conflitClasse = EmploiDuTempsLigne::query()
            ->where('emploi_du_temps_id', $emploi->id)
            ->where('jour', $validated['jour'])
            ->whereIn('classe_id', $classeIds)
            ->where(function ($query) use ($groupe) {
                $query->where('groupe', '')
                    ->orWhere('groupe', $groupe);
                if ($groupe === '') {
                    $query->orWhereNotNull('groupe');
                }
            })
            ->whereHas('creneau', function ($query) use ($creneau, $creneauxCours) {
                $query->where('heure_debut', '<', $creneauxCours->last()->heure_fin)
                    ->where('heure_fin', '>', $creneau->heure_debut);
            })
            ->when($idsAExclure->isNotEmpty(), fn($query) => $query->whereNotIn('id', $idsAExclure))
            ->exists();

        if ($conflitClasse) {
            throw ValidationException::withMessages([
                'creneau_horaire_id' => 'Une des classes sélectionnées a déjà un cours pendant cette durée.',
            ]);
        }

        /*
    |--------------------------------------------------------------------------
    | Conflit enseignant
    |--------------------------------------------------------------------------
    */

        if (empty($validated['activite']) && !empty($validated['enseignant_id'])) {
            $conflitEnseignant = EmploiDuTempsLigne::query()
                ->where(
                    'emploi_du_temps_id',
                    $emploi->id
                )
                ->where(
                    'jour',
                    $validated['jour']
                )
                ->where(
                    'enseignant_id',
                    $validated['enseignant_id']
                )
                ->whereHas(
                    'creneau',
                    function ($query) use ($creneau, $creneauxCours) {
                        $query
                            ->where(
                                'heure_debut',
                                '<',
                                $creneauxCours->last()->heure_fin
                            )
                            ->where(
                                'heure_fin',
                                '>',
                                $creneau->heure_debut
                            );
                    }
                )
                ->when($idsAExclure->isNotEmpty(), fn($query) => $query->whereNotIn('id', $idsAExclure))
                ->exists();

            if ($conflitEnseignant) {
                throw ValidationException::withMessages([
                    'enseignant_id' =>
                    'Cet enseignant a déjà un autre cours sur ce créneau.',
                ]);
            }
        }

        if ($educateurId) {
            $conflitEducateur = EmploiDuTempsLigne::query()
                ->where('emploi_du_temps_id', $emploi->id)
                ->where('jour', $validated['jour'])
                ->where('educateur_id', $educateurId)
                ->whereHas('creneau', function ($query) use ($creneau, $creneauxCours) {
                    $query->where('heure_debut', '<', $creneauxCours->last()->heure_fin)
                        ->where('heure_fin', '>', $creneau->heure_debut);
                })
                ->when($idsAExclure->isNotEmpty(), fn($query) => $query->whereNotIn('id', $idsAExclure))
                ->exists();

            if ($conflitEducateur) {
                throw ValidationException::withMessages([
                    'educateur_id' => 'Cet éducateur est déjà occupé sur ce créneau.',
                ]);
            }
        }

        /*
|--------------------------------------------------------------------------
| Conflit salle
|--------------------------------------------------------------------------
*/

        if (!empty($validated['salle_id'])) {
            $conflitSalle = EmploiDuTempsLigne::query()
                ->where(
                    'emploi_du_temps_id',
                    $emploi->id
                )
                ->where(
                    'jour',
                    $validated['jour']
                )
                ->where(
                    'salle_id',
                    $validated['salle_id']
                )
                ->whereHas(
                    'creneau',
                    function ($query) use ($creneau, $creneauxCours) {
                        $query
                            ->where(
                                'heure_debut',
                                '<',
                                $creneauxCours->last()->heure_fin
                            )
                            ->where(
                                'heure_fin',
                                '>',
                                $creneau->heure_debut
                            );
                    }
                )
                ->when($idsAExclure->isNotEmpty(), fn($query) => $query->whereNotIn('id', $idsAExclure))
                ->exists();

            if ($conflitSalle) {
                throw ValidationException::withMessages([
                    'salle_id' =>
                    'Cette salle est déjà réservée par un autre cours sur ce créneau.',
                ]);
            }
        }

        /*
    |--------------------------------------------------------------------------
    | Enregistrer le cours
    |--------------------------------------------------------------------------
    */

        \DB::transaction(function () use (
            $emploi,
            $validated,
            $classeIds,
            $creneauxCours,
            $regroupementId,
            $ancienRegroupementId,
            $ancienBlocId,
            $idsAExclure,
            $salle,
            $groupe
        ) {
            /*
         * Si nous modifions un regroupement existant,
         * on supprime d'abord toutes ses anciennes lignes.
         *
         * Cela permet par exemple de passer :
         *
         * Tle A1 + Tle A2 + Tle D
         *
         * à :
         *
         * Tle A1 + Tle D
         */
            if ($ancienRegroupementId) {
                EmploiDuTempsLigne::query()
                    ->where(
                        'emploi_du_temps_id',
                        $emploi->id
                    )
                    ->where(
                        'regroupement_id',
                        $ancienRegroupementId
                    )
                    ->delete();
            }

            if ($ancienBlocId) {
                EmploiDuTempsLigne::query()
                    ->where('emploi_du_temps_id', $emploi->id)
                    ->where('bloc_id', $ancienBlocId)
                    ->delete();
            }

            /*
         * Si une ligne individuelle existait dans une des classes
         * sélectionnées, elle est remplacée par le nouveau cours.
         */
            if ($idsAExclure->isNotEmpty()) {
                EmploiDuTempsLigne::query()
                    ->whereIn('id', $idsAExclure)
                    ->delete();
            }

            $blocId = !empty($validated['double_creneau'])
                ? (string) Str::uuid()
                : null;

            foreach ($classeIds as $classeId) {
                foreach ($creneauxCours as $creneauCours) {
                    EmploiDuTempsLigne::create([
                        'emploi_du_temps_id' => $emploi->id,
                        'creneau_horaire_id' => $creneauCours->id,
                        'classe_id' => $classeId,
                        'groupe' => $groupe,
                        'matiere_id' => $validated['matiere_id'] ?? null,
                        'activite' => $validated['activite'] ?? null,
                        'enseignant_id' => empty($validated['activite']) ? ($validated['enseignant_id'] ?? null) : null,
                        'educateur_id' => !empty($validated['activite']) ? $validated['educateur_id'] : null,
                        'regroupement_id' => $regroupementId,
                        'bloc_id' => $blocId,
                        'jour' => $validated['jour'],
                        'salle' => $salle?->nom,
                        'salle_id' => $validated['salle_id'] ?? null,
                    ]);
                }
            }
        });

        return back()->with(
            'success',
            !empty($validated['activite'])
                ? 'Activité enregistrée avec succès.'
                : ($classeIds->count() > 1
                    ? 'Cours regroupé enregistré avec succès.'
                    : 'Cours enregistré avec succès.')
        );
    }

    /**
     * Déplacer une ligne vers un autre créneau.
     */
    public function deplacerLigne(
        Request $request,
        EmploiDuTempsLigne $ligne
    ) {
        $user = $request->user();

        $this->autoriserGestion($user);

        $emploi = $ligne->emploiDuTemps;

        $this->etablissementAutorise(
            $user,
            $emploi->etablissement_id
        );

        $this->verifierEmploiDuTempsModifiable($emploi);

        $validated = $request->validate([
            'jour' => [
                'required',
                'in:lundi,mardi,mercredi,jeudi,vendredi,samedi',
            ],

            'creneau_horaire_id' => [
                'required',
                'integer',
                'exists:creneaux_horaires,id',
            ],
        ]);

        /*
    |--------------------------------------------------------------------------
    | Vérifier le nouveau créneau
    |--------------------------------------------------------------------------
    */

        $creneau = CreneauHoraire::query()
            ->whereKey($validated['creneau_horaire_id'])
            ->where(
                'etablissement_id',
                $emploi->etablissement_id
            )
            ->where('actif', true)
            ->first();

        if (!$creneau) {
            throw ValidationException::withMessages([
                'creneau_horaire_id' =>
                'Le créneau sélectionné est invalide.',
            ]);
        }

        if (
            $creneau->type === 'pause' ||
            preg_match(
                '/pause|récré|recre/i',
                $creneau->libelle
            )
        ) {
            throw ValidationException::withMessages([
                'creneau_horaire_id' =>
                'Impossible de déplacer un cours pendant une pause.',
            ]);
        }

        /*
    |--------------------------------------------------------------------------
    | Identifier le groupe à déplacer
    |--------------------------------------------------------------------------
    */

        $regroupementId = $ligne->regroupement_id;

        if ($ligne->bloc_id) {
            $lignesGroupe = EmploiDuTempsLigne::query()
                ->where('emploi_du_temps_id', $emploi->id)
                ->where('bloc_id', $ligne->bloc_id)
                ->with(['creneau', 'classe'])
                ->get();
        } elseif ($regroupementId) {
            $lignesGroupe = EmploiDuTempsLigne::query()
                ->where(
                    'emploi_du_temps_id',
                    $emploi->id
                )
                ->where(
                    'regroupement_id',
                    $regroupementId
                )
                ->with([
                    'creneau',
                    'classe',
                ])
                ->get();
        } else {
            $lignesGroupe = collect([$ligne->load([
                'creneau',
                'classe',
            ])]);
        }

        $creneauxSource = $lignesGroupe
            ->map(fn($item) => $item->creneau)
            ->unique('id')
            ->sortBy('heure_debut')
            ->values();
        $creneauxCibles = collect([$creneau]);
        for ($index = 1; $index < $creneauxSource->count(); $index++) {
            $precedent = $creneauxCibles->last();
            $suivant = CreneauHoraire::query()
                ->where('etablissement_id', $emploi->etablissement_id)
                ->where('actif', true)
                ->where('heure_debut', $precedent->heure_fin)
                ->where('type', '!=', 'pause')
                ->orderBy('ordre')
                ->first();

            if (!$suivant || preg_match('/pause|récré|recre/i', $suivant->libelle)) {
                throw ValidationException::withMessages([
                    'creneau_horaire_id' => 'Le cours de deux créneaux doit être déplacé vers deux créneaux consécutifs disponibles.',
                ]);
            }
            $creneauxCibles->push($suivant);
        }

        $idsLignesGroupe = $lignesGroupe->pluck('id');
        $heureFinCible = $creneauxCibles->last()->heure_fin;

        /*
    |--------------------------------------------------------------------------
    | Vérifier qu'aucune classe du groupe n'est déjà occupée
    |--------------------------------------------------------------------------
    */

        $classeIds = $lignesGroupe
            ->pluck('classe_id')
            ->unique()
            ->values();

        $conflitClasse = EmploiDuTempsLigne::query()
            ->where(
                'emploi_du_temps_id',
                $emploi->id
            )
            ->where(
                'jour',
                $validated['jour']
            )
            ->whereIn(
                'classe_id',
                $classeIds
            )
            ->where(function ($query) use ($ligne) {
                $groupe = $ligne->groupe ?? '';
                $query->where('groupe', $groupe);
                if ($groupe !== '') {
                    $query->orWhere('groupe', '');
                } else {
                    $query->orWhereNotNull('groupe');
                }
            })
            ->whereHas('creneau', fn($query) => $query
                ->where('heure_debut', '<', $heureFinCible)
                ->where('heure_fin', '>', $creneau->heure_debut))
            ->whereNotIn('id', $idsLignesGroupe)
            ->exists();

        if ($conflitClasse) {
            throw ValidationException::withMessages([
                'creneau_horaire_id' =>
                'Une des classes concernées possède déjà un cours sur ce créneau.',
            ]);
        }

        /*
    |--------------------------------------------------------------------------
    | Vérifier le conflit enseignant
    |--------------------------------------------------------------------------
    */

        $enseignantIds = $lignesGroupe
            ->pluck('enseignant_id')
            ->filter()
            ->unique()
            ->values();

        foreach ($enseignantIds as $enseignantId) {
            $conflitEnseignant = EmploiDuTempsLigne::query()
                ->where(
                    'emploi_du_temps_id',
                    $emploi->id
                )
                ->where(
                    'jour',
                    $validated['jour']
                )
                ->where(
                    'enseignant_id',
                    $enseignantId
                )
                ->whereHas(
                    'creneau',
                    function ($query) use ($creneau, $heureFinCible) {
                        $query
                            ->where(
                                'heure_debut',
                                '<',
                                $heureFinCible
                            )
                            ->where(
                                'heure_fin',
                                '>',
                                $creneau->heure_debut
                            );
                    }
                )
                ->whereNotIn('id', $idsLignesGroupe)
                ->exists();

            if ($conflitEnseignant) {
                throw ValidationException::withMessages([
                    'creneau_horaire_id' =>
                    'L’enseignant concerné a déjà un cours sur ce créneau.',
                ]);
            }
        }

        $educateurIds = $lignesGroupe->pluck('educateur_id')->filter()->unique();
        foreach ($educateurIds as $educateurId) {
            $conflitEducateur = EmploiDuTempsLigne::query()
                ->where('emploi_du_temps_id', $emploi->id)
                ->where('jour', $validated['jour'])
                ->where('educateur_id', $educateurId)
                ->whereHas('creneau', fn($query) => $query
                    ->where('heure_debut', '<', $heureFinCible)
                    ->where('heure_fin', '>', $creneau->heure_debut))
                ->whereNotIn('id', $idsLignesGroupe)
                ->exists();

            if ($conflitEducateur) {
                throw ValidationException::withMessages([
                    'creneau_horaire_id' => 'L’éducateur concerné est déjà occupé sur cette plage horaire.',
                ]);
            }
        }

        /*
    |--------------------------------------------------------------------------
    | Vérifier les conflits de salle
    |--------------------------------------------------------------------------
    */

        $salles = $lignesGroupe
            ->pluck('salle')
            ->filter()
            ->unique()
            ->values();

        foreach ($salles as $salle) {
            $conflitSalle = EmploiDuTempsLigne::query()
                ->where(
                    'emploi_du_temps_id',
                    $emploi->id
                )
                ->where(
                    'jour',
                    $validated['jour']
                )
                ->where(
                    'salle',
                    $salle
                )
                ->whereHas(
                    'creneau',
                    function ($query) use ($creneau, $heureFinCible) {
                        $query
                            ->where(
                                'heure_debut',
                                '<',
                                $heureFinCible
                            )
                            ->where(
                                'heure_fin',
                                '>',
                                $creneau->heure_debut
                            );
                    }
                )
                ->whereNotIn('id', $idsLignesGroupe)
                ->exists();

            if ($conflitSalle) {
                throw ValidationException::withMessages([
                    'creneau_horaire_id' =>
                    "La salle {$salle} est déjà occupée sur ce créneau.",
                ]);
            }
        }

        /*
    |--------------------------------------------------------------------------
    | Déplacer le cours / le groupe
    |--------------------------------------------------------------------------
    */

        $creneauxSourceIds = $creneauxSource->pluck('id')->values();
        $creneauxCiblesIds = $creneauxCibles->pluck('id')->values();
        \DB::transaction(function () use (
            $lignesGroupe,
            $validated,
            $creneauxSourceIds,
            $creneauxCiblesIds
        ) {
            foreach ($lignesGroupe as $ligneGroupe) {
                $sourceIndex = $creneauxSourceIds->search(
                    (int) $ligneGroupe->creneau_horaire_id
                );
                $ligneGroupe->update([
                    'jour' => $validated['jour'],
                    'creneau_horaire_id' => $creneauxCiblesIds[$sourceIndex],
                ]);
            }
        });

        return back()->with(
            'success',
            $lignesGroupe->count() > 1
                ? 'Cours regroupé déplacé avec succès.'
                : 'Cours déplacé avec succès.'
        );
    }

    /**
     * Supprimer une ligne.
     */
    public function supprimerLigne(
        Request $request,
        EmploiDuTempsLigne $ligne
    ) {
        $user = $request->user();

        $this->autoriserGestion($user);

        $this->etablissementAutorise(
            $user,
            $ligne->emploiDuTemps->etablissement_id
        );

        $this->verifierEmploiDuTempsModifiable($ligne->emploiDuTemps);

        /*
    |--------------------------------------------------------------------------
    | Suppression d'un cours regroupé
    |--------------------------------------------------------------------------
    |
    | Si la ligne appartient à un regroupement, toutes les lignes
    | du même regroupement représentent le même cours partagé.
    |
    */

        if ($ligne->bloc_id) {
            EmploiDuTempsLigne::query()
                ->where('emploi_du_temps_id', $ligne->emploi_du_temps_id)
                ->where('bloc_id', $ligne->bloc_id)
                ->delete();

            return back()->with('success', 'Cours de deux créneaux supprimé avec succès.');
        }

        if ($ligne->regroupement_id) {
            EmploiDuTempsLigne::query()
                ->where(
                    'emploi_du_temps_id',
                    $ligne->emploi_du_temps_id
                )
                ->where(
                    'regroupement_id',
                    $ligne->regroupement_id
                )
                ->delete();

            return back()->with(
                'success',
                'Cours regroupé supprimé avec succès.'
            );
        }

        /*
    |--------------------------------------------------------------------------
    | Suppression d'un cours individuel
    |--------------------------------------------------------------------------
    */

        $ligne->delete();

        return back()->with(
            'success',
            'Cours supprimé avec succès.'
        );
    }

    public function reordonnerClasses(Request $request, EmploiDuTemps $emploi)
    {
        $user = $request->user();
        $this->autoriserGestion($user);
        $this->etablissementAutorise($user, $emploi->etablissement_id);

        $this->verifierEmploiDuTempsModifiable($emploi);

        $validated = $request->validate([
            'ordre_classes' => ['required', 'array'],
            'ordre_classes.*' => ['required', 'integer', 'distinct', 'exists:classes,id'],
        ]);

        $classesAutorisees = Classe::query()
            ->where('etablissement_id', $emploi->etablissement_id)
            ->where('annee_scolaire_id', $emploi->annee_scolaire_id)
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->sort()
            ->values();

        $ordreDemande = collect($validated['ordre_classes'])
            ->map(fn($id) => (int) $id)
            ->sort()
            ->values();

        if ($classesAutorisees->all() !== $ordreDemande->all()) {
            throw ValidationException::withMessages([
                'ordre_classes' => 'L’ordre doit contenir exactement les classes de cet établissement et de cette année.',
            ]);
        }

        $emploi->update(['ordre_classes' => $validated['ordre_classes']]);

        return back()->with('success', 'Ordre des classes enregistré.');
    }

    public function publier(Request $request, EmploiDuTemps $emploi)
    {
        $user = $request->user();

        $this->autoriserGestion($user);
        $this->etablissementAutorise($user, $emploi->etablissement_id);

        if ($emploi->statut === 'publie') {
            return back()->with(
                'success',
                'Cet emploi du temps est déjà publié.'
            );
        }

        $this->verifierEmploiDuTempsAvantPublication($emploi);

        $emploi->update([
            'statut' => 'publie',
        ]);

        return back()->with(
            'success',
            'Emploi du temps publié avec succès.'
        );
    }

    public function depublier(Request $request, EmploiDuTemps $emploi)
    {
        $user = $request->user();

        $this->autoriserGestion($user);
        $this->etablissementAutorise($user, $emploi->etablissement_id);

        if ($emploi->statut === 'brouillon') {
            return back()->with(
                'success',
                'Cet emploi du temps est déjà en brouillon.'
            );
        }

        $emploi->update([
            'statut' => 'brouillon',
        ]);

        return back()->with(
            'success',
            'L’emploi du temps est repassé en brouillon.'
        );
    }
    private function etablissementAutorise($user, ?int $etablissementId): int
    {
        if ($user->hasRole('SuperAdmin')) {
            abort_unless($etablissementId, 422, 'Sélectionnez un établissement.');

            return (int) $etablissementId;
        }

        abort_unless(
            $user->etablissement_id &&
                (!$etablissementId || (int) $etablissementId === (int) $user->etablissement_id),
            403
        );

        return (int) $user->etablissement_id;
    }

    private function verifierEmploiDuTempsModifiable(
        EmploiDuTemps $emploi
    ): void {
        abort_if(
            $emploi->statut === 'publie',
            422,
            'Cet emploi du temps est publié et ne peut plus être modifié. Repassez-le en brouillon.'
        );
    }

    private function verifierEmploiDuTempsAvantPublication(
        EmploiDuTemps $emploi
    ): void {
        $lignes = $emploi->lignes()
            ->with([
                'classe:id,libelle',
                'matiere:id,libelle',
                'enseignant:id,nom,prenoms',
                'educateur:id,nom,prenoms',
                'salle:id,nom,type,capacite',
                'creneau:id,libelle,type,heure_debut,heure_fin',
            ])
            ->get();

        // Aucun cours
        if ($lignes->isEmpty()) {
            abort(
                422,
                'Impossible de publier : aucun cours n’est encore enregistré.'
            );
        }

        // Vérification des lignes individuelles
        foreach ($lignes as $ligne) {
            if (!$ligne->classe_id) {
                abort(
                    422,
                    'Impossible de publier : un cours ne possède pas de classe.'
                );
            }

            if (!$ligne->matiere_id && !$ligne->activite) {
                abort(
                    422,
                    'Impossible de publier : un cours ne possède pas de matière ou d’activité.'
                );
            }

            if ($ligne->activite && !$ligne->educateur_id) {
                abort(422, 'Impossible de publier : une activité ne possède pas d’éducateur.');
            }

            if (!$ligne->creneau) {
                abort(
                    422,
                    'Impossible de publier : un cours possède un créneau invalide.'
                );
            }

            if ($ligne->creneau->type === 'pause') {
                abort(
                    422,
                    'Impossible de publier : un cours est placé sur une pause.'
                );
            }
        }

        $lignesAvecEducateur = $lignes
            ->filter(fn($ligne) => $ligne->educateur_id !== null);

        foreach ($lignesAvecEducateur as $ligne) {
            $conflit = $lignesAvecEducateur->first(function ($autre) use ($ligne) {
                if ($autre->id === $ligne->id || $autre->jour !== $ligne->jour) {
                    return false;
                }
                if ($autre->educateur_id !== $ligne->educateur_id) {
                    return false;
                }
                if ($autre->regroupement_id && $autre->regroupement_id === $ligne->regroupement_id) {
                    return false;
                }

                return $this->creneauxSeChevauchent($ligne->creneau, $autre->creneau);
            });

            if ($conflit) {
                $educateur = $ligne->educateur
                    ? trim($ligne->educateur->nom . ' ' . $ligne->educateur->prenoms)
                    : 'cet éducateur';
                abort(422, "Impossible de publier : conflit d'horaire pour l'éducateur {$educateur} le {$ligne->jour}.");
            }
        }

        /*
    |--------------------------------------------------------------------------
    | Conflits enseignant
    |--------------------------------------------------------------------------
    */

        $lignesAvecEnseignant = $lignes
            ->filter(fn($ligne) => $ligne->enseignant_id !== null);

        foreach ($lignesAvecEnseignant as $ligne) {
            $conflit = $lignesAvecEnseignant->first(
                function ($autre) use ($ligne) {
                    if ($autre->id === $ligne->id) {
                        return false;
                    }

                    if ($autre->jour !== $ligne->jour) {
                        return false;
                    }

                    if (
                        $autre->enseignant_id !==
                        $ligne->enseignant_id
                    ) {
                        return false;
                    }

                    if (
                        $autre->regroupement_id &&
                        $autre->regroupement_id ===
                        $ligne->regroupement_id
                    ) {
                        return false;
                    }

                    return $this->creneauxSeChevauchent(
                        $ligne->creneau,
                        $autre->creneau
                    );
                }
            );

            if ($conflit) {
                $enseignant = $ligne->enseignant
                    ? trim(
                        $ligne->enseignant->nom .
                            ' ' .
                            $ligne->enseignant->prenoms
                    )
                    : 'cet enseignant';

                abort(
                    422,
                    "Impossible de publier : conflit d'horaire pour l'enseignant {$enseignant} le {$ligne->jour}."
                );
            }
        }

        /*
    |--------------------------------------------------------------------------
    | Conflits de salle
    |--------------------------------------------------------------------------
    */

        $lignesAvecSalle = $lignes
            ->filter(
                fn($ligne) =>
                $ligne->salle_id !== null &&
                    $ligne->salle_id !== ''
            );

        foreach ($lignesAvecSalle as $ligne) {
            $conflit = $lignesAvecSalle->first(
                function ($autre) use ($ligne) {
                    if ($autre->id === $ligne->id) {
                        return false;
                    }

                    if ($autre->jour !== $ligne->jour) {
                        return false;
                    }

                    if (
                        $autre->salle_id !==
                        $ligne->salle_id
                    ) {
                        return false;
                    }

                    if (
                        $autre->regroupement_id &&
                        $autre->regroupement_id ===
                        $ligne->regroupement_id
                    ) {
                        return false;
                    }

                    return $this->creneauxSeChevauchent(
                        $ligne->creneau,
                        $autre->creneau
                    );
                }
            );

            if ($conflit) {
                $salleNom = $ligne->salle?->nom ?? 'cette salle';

                abort(
                    422,
                    "Impossible de publier : la salle {$salleNom} est utilisée simultanément le {$ligne->jour}."
                );
            }
        }
    }

    private function creneauxSeChevauchent(
        $creneauA,
        $creneauB
    ): bool {
        return (
            $creneauA->heure_debut < $creneauB->heure_fin &&
            $creneauA->heure_fin > $creneauB->heure_debut
        );
    }
}
