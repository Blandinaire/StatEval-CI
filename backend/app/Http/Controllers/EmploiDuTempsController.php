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
use Illuminate\Http\Request;
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

        if ($etablissementId && $anneeId) {
            $classes = Classe::query()
                ->where('etablissement_id', $etablissementId)
                ->where('annee_scolaire_id', $anneeId)
                ->with('niveau:id,libelle')
                ->orderBy('libelle')
                ->get(['id', 'libelle', 'niveau_id', 'maquette_id']);

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
                        $query->whereIn('classe_id', $classes->pluck('id'))
                            ->with(['classe:id,libelle', 'matiere:id,libelle,couleur', 'enseignant:id,nom,prenoms', 'creneau']);
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
     * Enregistrer une ligne.
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
                'required',
                'exists:classes,id',
            ],

            'matiere_id' => ['required', 'integer', 'exists:matieres,id'],

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
        $etablissementId = $this->etablissementAutorise($user, $emploi->etablissement_id);

        if (!Classe::query()
            ->whereKey($validated['classe_id'])
            ->where('etablissement_id', $etablissementId)
            ->where('annee_scolaire_id', $emploi->annee_scolaire_id)
            ->exists()) {
            throw ValidationException::withMessages([
                'classe_id' => 'La classe ne correspond pas à cet emploi du temps.',
            ]);
        }

        $classe = Classe::query()
            ->whereKey($validated['classe_id'])
            ->where('etablissement_id', $etablissementId)
            ->where('annee_scolaire_id', $emploi->annee_scolaire_id)
            ->firstOrFail();

        $matiereAutorisee = Matiere::query()
            ->whereKey($validated['matiere_id'])
            ->whereHas('maquettes', function ($query) use ($classe) {
                $query->where('maquettes.id', $classe->maquette_id)
                    ->where('maquette_matieres.active', true);
            })
            ->exists();

        if (!$matiereAutorisee) {
            throw ValidationException::withMessages([
                'matiere_id' => 'Cette matière ne figure pas dans la maquette de la classe sélectionnée.',
            ]);
        }

        $creneau = CreneauHoraire::query()
            ->whereKey($validated['creneau_horaire_id'])
            ->where('etablissement_id', $etablissementId)
            ->where('actif', true)
            ->first();

        if (!$creneau) {
            throw ValidationException::withMessages([
                'creneau_horaire_id' => 'Le créneau est invalide pour cet établissement.',
            ]);
        }

        if ($creneau->type === 'pause' || preg_match('/pause|récré|recre/i', $creneau->libelle)) {
            throw ValidationException::withMessages([
                'creneau_horaire_id' => 'Aucun cours ne peut être ajouté pendant une pause.',
            ]);
        }

        if (!empty($validated['enseignant_id'])) {
            if (!Affectation::query()
                ->where('etablissement_id', $etablissementId)
                ->where('annee_scolaire_id', $emploi->annee_scolaire_id)
                ->where('classe_id', $classe->id)
                ->where('matiere_id', $validated['matiere_id'])
                ->where('enseignant_id', $validated['enseignant_id'])
                ->where('actif', true)
                ->exists()) {
                throw ValidationException::withMessages([
                    'enseignant_id' => 'Cet enseignant n’est pas affecté à cette matière dans cette classe pour l’année sélectionnée.',
                ]);
            }
        }

        $ligneExistante = EmploiDuTempsLigne::query()
            ->where('emploi_du_temps_id', $emploi->id)
            ->where('jour', $validated['jour'])
            ->where('creneau_horaire_id', $validated['creneau_horaire_id'])
            ->where('classe_id', $validated['classe_id'])
            ->first();

        $conflitEnseignant = !empty($validated['enseignant_id']) && EmploiDuTempsLigne::query()
            ->where('emploi_du_temps_id', $emploi->id)
            ->where('jour', $validated['jour'])
            ->where('enseignant_id', $validated['enseignant_id'])
            ->when($ligneExistante, fn($query) => $query->where('id', '!=', $ligneExistante->id))
            ->whereHas('creneau', function ($query) use ($creneau) {
                $query->where('heure_debut', '<', $creneau->heure_fin)
                    ->where('heure_fin', '>', $creneau->heure_debut);
            })
            ->exists();

        if ($conflitEnseignant) {
            throw ValidationException::withMessages([
                'enseignant_id' => 'Cet enseignant a déjà un cours sur ce créneau.',
            ]);
        }

        $conflitSalle = !empty($validated['salle']) && EmploiDuTempsLigne::query()
            ->where('emploi_du_temps_id', $emploi->id)
            ->where('jour', $validated['jour'])
            ->where('salle', $validated['salle'])
            ->when($ligneExistante, fn($query) => $query->where('id', '!=', $ligneExistante->id))
            ->whereHas('creneau', function ($query) use ($creneau) {
                $query->where('heure_debut', '<', $creneau->heure_fin)
                    ->where('heure_fin', '>', $creneau->heure_debut);
            })
            ->exists();

        if ($conflitSalle) {
            throw ValidationException::withMessages([
                'salle' => 'Cette salle est déjà réservée sur ce créneau.',
            ]);
        }

        EmploiDuTempsLigne::updateOrCreate(
            [
                'emploi_du_temps_id' =>
                $validated['emploi_du_temps_id'],

                'creneau_horaire_id' =>
                $validated['creneau_horaire_id'],

                'classe_id' =>
                $validated['classe_id'],

                'jour' =>
                $validated['jour'],
            ],
            [
                'matiere_id' =>
                $validated['matiere_id'],

                'enseignant_id' =>
                $validated['enseignant_id'] ?? null,

                'salle' =>
                $validated['salle'] ?? null,
            ]
        );

        return back()->with(
            'success',
            'Créneau enregistré avec succès.'
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
        $this->etablissementAutorise($user, $ligne->emploiDuTemps->etablissement_id);

        $ligne->delete();

        return back()->with(
            'success',
            'Créneau supprimé avec succès.'
        );
    }

    public function reordonnerClasses(Request $request, EmploiDuTemps $emploi)
    {
        $user = $request->user();
        $this->autoriserGestion($user);
        $this->etablissementAutorise($user, $emploi->etablissement_id);

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

    private function autoriserGestion($user): void
    {
        abort_unless(
            $user->hasAnyRole(['SuperAdmin', 'Administrateur', 'Direction']),
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
}
