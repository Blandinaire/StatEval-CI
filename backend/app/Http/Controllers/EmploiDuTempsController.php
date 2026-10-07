<?php

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Affectation;
use App\Models\Classe;
use App\Models\CreneauHoraire;
use App\Models\EmploiDuTemps;
use App\Models\EmploiDuTempsLigne;
use App\Models\Enseignant;
use App\Models\Etablissement;
use App\Models\Matiere;
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
        $this->autoriserGestion($user);

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
        $creneaux = collect();
        $emploi = null;
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
                

            $matieresParClasse = $classes->mapWithKeys(function (Classe $classe) {
                $matieres = Matiere::query()
                    ->whereHas('maquettes', function ($query) use ($classe) {
                        $query->where('maquettes.id', $classe->maquette_id)
                            ->where('maquette_matieres.active', true);
                    })
                    ->orderBy('libelle')
                    ->get(['matieres.id', 'matieres.libelle', 'matieres.couleur']);

                return [$classe->id => $matieres];
            });

            $affectations = Affectation::query()
                ->where('etablissement_id', $etablissementId)
                ->where('annee_scolaire_id', $anneeId)
                ->whereIn('classe_id', $classes->pluck('id'))
                ->where('actif', true)
                ->with('enseignant:id,nom,prenoms')
                ->get(['id', 'classe_id', 'matiere_id', 'enseignant_id'])
                ->groupBy(['classe_id', 'matiere_id'])
                ->map(fn($byMatter) => $byMatter->map(
                    fn($rows) => $rows->map(fn($row) => [
                        'id' => $row->enseignant->id,
                        'nom' => $row->enseignant->nom,
                        'prenoms' => $row->enseignant->prenoms,
                    ])->values()
                ));

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
                    'lignes' => function ($query) use ($classes) {
                        $query
                            ->select([
                                'id',
                                'emploi_du_temps_id',
                                'creneau_horaire_id',
                                'classe_id',
                                'matiere_id',
                                'enseignant_id',
                                'regroupement_id',
                                'jour',
                                'salle',
                            ])
                            ->whereIn(
                                'classe_id',
                                $classes->pluck('id')
                            )
                            ->with([
                                'classe:id,libelle',
                                'matiere:id,libelle,couleur',
                                'enseignant:id,nom,prenoms',
                                'salle:id,nom,type,capacite',
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
            'creneaux' => $creneaux,
            'emploi' => $emploi,
            'salles' => $salles,
            'matieresParClasse' => $matieresParClasse,
            'enseignantsParClasseMatiere' => $affectations,
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
                'required',
                'integer',
                'exists:matieres,id',
            ],

            'enseignant_id' => [
                'nullable',
                'exists:enseignants,id',
            ],

            'jour' => [
                'required',
                'in:lundi,mardi,mercredi,jeudi,vendredi,samedi',
            ],

            'salle' => [
                'nullable',
                'string',
                'max:80',
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
            $matiereAutorisee = Matiere::query()
                ->whereKey($validated['matiere_id'])
                ->whereHas('maquettes', function ($query) use ($classe) {
                    $query
                        ->where(
                            'maquettes.id',
                            $classe->maquette_id
                        )
                        ->where(
                            'maquette_matieres.active',
                            true
                        );
                })
                ->exists();

            if (!$matiereAutorisee) {
                throw ValidationException::withMessages([
                    'matiere_id' =>
                    "La matière sélectionnée ne figure pas dans la maquette de la classe {$classe->libelle}.",
                ]);
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

        if (!empty($validated['enseignant_id'])) {
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
                    ->where(
                        'matiere_id',
                        $validated['matiere_id']
                    )
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

        /*
    |--------------------------------------------------------------------------
    | Conflit enseignant
    |--------------------------------------------------------------------------
    */

        if (!empty($validated['enseignant_id'])) {
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
                    function ($query) use ($creneau) {
                        $query
                            ->where(
                                'heure_debut',
                                '<',
                                $creneau->heure_fin
                            )
                            ->where(
                                'heure_fin',
                                '>',
                                $creneau->heure_debut
                            );
                    }
                )
                ->when(
                    $regroupementId,
                    function ($query) use ($regroupementId) {
                        $query->where(function ($q) use ($regroupementId) {
                            $q
                                ->whereNull('regroupement_id')
                                ->orWhere(
                                    'regroupement_id',
                                    '!=',
                                    $regroupementId
                                );
                        });
                    }
                )
                ->when(
                    !$regroupementId,
                    function ($query) use ($classeIds) {
                        $query->whereNotIn(
                            'classe_id',
                            $classeIds
                        );
                    }
                )
                ->exists();

            if ($conflitEnseignant) {
                throw ValidationException::withMessages([
                    'enseignant_id' =>
                    'Cet enseignant a déjà un autre cours sur ce créneau.',
                ]);
            }
        }

        /*
    |--------------------------------------------------------------------------
    | Conflit salle
    |--------------------------------------------------------------------------
    */

        if (!empty($validated['salle'])) {
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
                    $validated['salle']
                )
                ->whereHas(
                    'creneau',
                    function ($query) use ($creneau) {
                        $query
                            ->where(
                                'heure_debut',
                                '<',
                                $creneau->heure_fin
                            )
                            ->where(
                                'heure_fin',
                                '>',
                                $creneau->heure_debut
                            );
                    }
                )
                ->when(
                    $regroupementId,
                    function ($query) use ($regroupementId) {
                        $query->where(function ($q) use ($regroupementId) {
                            $q
                                ->whereNull('regroupement_id')
                                ->orWhere(
                                    'regroupement_id',
                                    '!=',
                                    $regroupementId
                                );
                        });
                    }
                )
                ->when(
                    !$regroupementId,
                    function ($query) use ($classeIds) {
                        $query->whereNotIn(
                            'classe_id',
                            $classeIds
                        );
                    }
                )
                ->exists();

            if ($conflitSalle) {
                throw ValidationException::withMessages([
                    'salle' =>
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
            $regroupementId,
            $ancienRegroupementId
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

            /*
         * Si une ligne individuelle existait dans une des classes
         * sélectionnées, elle est remplacée par le nouveau cours.
         */
            EmploiDuTempsLigne::query()
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
                ->delete();

            foreach ($classeIds as $classeId) {
                EmploiDuTempsLigne::create([
                    'emploi_du_temps_id' =>
                    $emploi->id,

                    'creneau_horaire_id' =>
                    $validated['creneau_horaire_id'],

                    'classe_id' =>
                    $classeId,

                    'matiere_id' =>
                    $validated['matiere_id'],

                    'enseignant_id' =>
                    $validated['enseignant_id'] ?? null,

                    'regroupement_id' =>
                    $regroupementId,

                    'jour' =>
                    $validated['jour'],

                    'salle' =>
                    $validated['salle'] ?? null,
                ]);
            }
        });

        return back()->with(
            'success',
            $classeIds->count() > 1
                ? 'Cours regroupé enregistré avec succès.'
                : 'Cours enregistré avec succès.'
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

        if ($regroupementId) {
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
            ->where(
                'creneau_horaire_id',
                $validated['creneau_horaire_id']
            )
            ->whereIn(
                'classe_id',
                $classeIds
            )
            ->when(
                $regroupementId,
                fn($query) =>
                $query->where(
                    'regroupement_id',
                    '!=',
                    $regroupementId
                )
            )
            ->when(
                !$regroupementId,
                fn($query) =>
                $query->where(
                    'id',
                    '!=',
                    $ligne->id
                )
            )
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
                    function ($query) use ($creneau) {
                        $query
                            ->where(
                                'heure_debut',
                                '<',
                                $creneau->heure_fin
                            )
                            ->where(
                                'heure_fin',
                                '>',
                                $creneau->heure_debut
                            );
                    }
                )
                ->when(
                    $regroupementId,
                    fn($query) =>
                    $query->where(
                        'regroupement_id',
                        '!=',
                        $regroupementId
                    )
                )
                ->when(
                    !$regroupementId,
                    fn($query) =>
                    $query->where(
                        'id',
                        '!=',
                        $ligne->id
                    )
                )
                ->exists();

            if ($conflitEnseignant) {
                throw ValidationException::withMessages([
                    'creneau_horaire_id' =>
                    'L’enseignant concerné a déjà un cours sur ce créneau.',
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
                    function ($query) use ($creneau) {
                        $query
                            ->where(
                                'heure_debut',
                                '<',
                                $creneau->heure_fin
                            )
                            ->where(
                                'heure_fin',
                                '>',
                                $creneau->heure_debut
                            );
                    }
                )
                ->when(
                    $regroupementId,
                    fn($query) =>
                    $query->where(
                        'regroupement_id',
                        '!=',
                        $regroupementId
                    )
                )
                ->when(
                    !$regroupementId,
                    fn($query) =>
                    $query->where(
                        'id',
                        '!=',
                        $ligne->id
                    )
                )
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

        \DB::transaction(function () use (
            $lignesGroupe,
            $validated
        ) {
            foreach ($lignesGroupe as $ligneGroupe) {
                $ligneGroupe->update([
                    'jour' =>
                    $validated['jour'],

                    'creneau_horaire_id' =>
                    $validated['creneau_horaire_id'],
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

        $this->verifierEmploiDuTempsModifiable($emploi);

        /*
    |--------------------------------------------------------------------------
    | Suppression d'un cours regroupé
    |--------------------------------------------------------------------------
    |
    | Si la ligne appartient à un regroupement, toutes les lignes
    | du même regroupement représentent le même cours partagé.
    |
    */

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
        $this->etablissementAutorise($user, $emploi);

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
        $this->etablissementAutorise($user, $emploi);

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



    private function autoriserGestion($user): void
    {
        abort_unless(
            $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Directeur',
                'Direction',
            ]),
            403
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

            if (!$ligne->matiere_id) {
                abort(
                    422,
                    'Impossible de publier : un cours ne possède pas de matière.'
                );
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
                $ligne->salle !== null &&
                    trim($ligne->salle) !== ''
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
                        mb_strtolower(trim($autre->salle)) !==
                        mb_strtolower(trim($ligne->salle))
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
                abort(
                    422,
                    "Impossible de publier : la salle {$ligne->salle} est utilisée simultanément le {$ligne->jour}."
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
