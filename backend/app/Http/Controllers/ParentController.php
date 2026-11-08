<?php

namespace App\Http\Controllers;

use App\Models\Etablissement;
use App\Models\User;
use App\Models\Eleve;
use App\Models\Classe;
use App\Models\Niveau;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ParentController extends Controller
{
    private function autoriser(): void
    {
        abort_unless(
            Auth::user()->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Direction',
            ]),
            403
        );
    }

    private function autoriserSuperAdmin(): void
    {
        abort_unless(
            Auth::user()->hasRole('SuperAdmin'),
            403,
            'Seul le SuperAdmin peut générer les comptes parents.'
        );
    }

    private function etablissementId(Request $request): int
    {
        $user = Auth::user();

        $id = $user->hasRole('SuperAdmin')
            ? $request->input('etablissement_id')
            : $user->etablissement_id;

        abort_unless($id, 422, 'Veuillez sélectionner un établissement.');

        abort_unless(
            Etablissement::whereKey($id)->exists(),
            404
        );

        return (int) $id;
    }

    private function elevesDuPerimetre(Request $request, int $etablissementId)
    {
        $type = $request->input('type_perimetre', 'etablissement');

        abort_unless(
            in_array($type, ['etablissement', 'niveau', 'classe'], true),
            422,
            'Périmètre invalide.'
        );

        $query = Eleve::query()
            ->where('etablissement_id', $etablissementId);

        if ($type === 'niveau') {
            $request->validate([
                'niveau_id' => ['required', 'integer', 'exists:niveaux,id'],
            ]);

            $query->whereHas('classe', function ($q) use ($request, $etablissementId) {
                $q->where('etablissement_id', $etablissementId)
                    ->where('niveau_id', $request->niveau_id);
            });
        }

        if ($type === 'classe') {
            $request->validate([
                'classe_id' => ['required', 'integer', 'exists:classes,id'],
            ]);

            $query->where('classe_id', $request->classe_id)
                ->whereHas('classe', function ($q) use ($etablissementId) {
                    $q->where('etablissement_id', $etablissementId);
                });
        }

        return $query;
    }


    private function telephoneNormalise(?string $telephone): string
    {
        $numero = preg_replace('/\D+/', '', $telephone ?? '');

        // Retirer le préfixe international 00.
        if (str_starts_with($numero, '00')) {
            $numero = substr($numero, 2);
        }

        // Retirer l'indicatif ivoirien 225 si le numéro comporte 13 chiffres.
        if (str_starts_with($numero, '225') && strlen($numero) === 13) {
            $numero = substr($numero, 3);
        }

        // Seuls les numéros nationaux à 10 chiffres sont acceptés.
        return strlen($numero) === 10 ? $numero : '';
    }

    /**
     * Indexe les comptes utilisateurs d'un établissement par téléphone normalisé.
     */
    private function comptesParTelephone(int $etablissementId): array
    {
        $comptes = User::query()
            ->with('roles')
            ->where('etablissement_id', $etablissementId)
            ->whereNotNull('telephone')
            ->get();

        $index = [];

        foreach ($comptes as $compte) {
            $telephone = $this->telephoneNormalise($compte->telephone);

            if ($telephone === '') {
                continue;
            }

            $index[$telephone][] = $compte;
        }

        return $index;
    }

    /**
     * Détermine si un compte possède le rôle Parent.
     */
    private function estCompteParent(User $user): bool
    {
        return $user->hasRole('Parent');
    }

    /**
     * Vérifie qu'un compte Parent appartient au périmètre de l'utilisateur.
     */
    private function autoriserAccesParent(User $parent): void
    {
        $this->autoriser();

        abort_unless($parent->hasRole('Parent'), 404);

        $user = Auth::user();

        if (!$user->hasRole('SuperAdmin')) {
            abort_unless(
                (int) $parent->etablissement_id === (int) $user->etablissement_id,
                403,
                'Vous ne pouvez pas gérer un compte parent d’un autre établissement.'
            );
        }
    }


    /**
     * Consultation détaillée d'un compte parent et de ses enfants.
     */
    public function show(User $parent)
    {
        $this->autoriserAccesParent($parent);

        $parent->load([
            'etablissement:id,nom',
            'eleves' => function ($query) {
                $query->orderBy('nom')
                    ->orderBy('prenoms')
                    ->with([
                        'classe:id,libelle,niveau_id',
                        'classe.niveau:id,libelle',
                    ]);
            },
        ]);

        $enfants = $parent->eleves->map(function (Eleve $eleve) {
            return [
                'id' => $eleve->id,
                'matricule' => $eleve->matricule ?: $eleve->code_eleve,
                'nom' => $eleve->nom,
                'prenoms' => $eleve->prenoms,
                'sexe' => $eleve->sexe,
                'classe' => $eleve->classe?->libelle,
                'niveau' => $eleve->classe?->niveau?->libelle,
                'statut' => $eleve->statut,
                'lien' => $eleve->pivot?->lien,
            ];
        })->values();

        return Inertia::render('Parents/Show', [
            'parent' => [
                'id' => $parent->id,
                'name' => $parent->name,
                'telephone' => $parent->telephone,
                'email' => $parent->email,
                'actif' => $parent->actif,
                'genere_automatiquement' => $parent->genere_automatiquement,
                'created_at' => $parent->created_at?->format('d/m/Y à H:i'),
                'etablissement' => $parent->etablissement?->nom,
            ],
            'enfants' => $enfants,
        ]);
    }


    /**
     * Formulaire de modification d'un compte parent.
     */
    public function edit(User $parent)
    {
        $this->autoriserAccesParent($parent);

        return Inertia::render('Parents/Edit', [
            'parent' => $parent->load('etablissement'),
        ]);
    }

    /**
     * Enregistrement des modifications d'un compte parent.
     */
    public function update(Request $request, User $parent)
    {
        $this->autoriserAccesParent($parent);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'telephone' => ['nullable', 'string', 'max:30'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                'unique:users,email,' . $parent->id,
            ],
        ]);

        $parent->update([
            'name' => $validated['name'],
            'telephone' => $validated['telephone'] ?? null,
            'email' => $validated['email'] ?? null,
            'fonction' => 'Parent',
        ]);

        return redirect()
            ->route('parents.index')
            ->with('success', 'Compte parent modifié avec succès.');
    }

    /**
     * Réinitialisation du mot de passe d'un compte parent.
     */
    public function resetPassword(User $parent)
    {
        $this->autoriserAccesParent($parent);

        $initialPassword = Str::random(12);

        $parent->update([
            'password' => $initialPassword,
            'initial_password' => $initialPassword,
            'must_change_password' => true,
        ]);

        return back()
            ->with('success', "Mot de passe de {$parent->name} réinitialisé.")
            ->with('initial_password', $initialPassword)
            ->with('created_user', $parent->name);
    }

    /**
     * Activation ou désactivation d'un compte parent.
     */
    public function toggle(User $parent)
    {
        $this->autoriserAccesParent($parent);

        abort_if(
            $parent->id === (int) Auth::id(),
            403,
            'Vous ne pouvez pas désactiver votre propre compte.'
        );

        $parent->update([
            'actif' => !$parent->actif,
        ]);

        return back()->with(
            'success',
            $parent->actif
                ? 'Compte parent activé avec succès.'
                : 'Compte parent désactivé avec succès.'
        );
    }


    /**
     * Formulaire de création individuelle d'un compte parent.
     */
    public function create(Request $request)
    {
        $this->autoriser();

        $user = Auth::user();

        $etablissementId = $user->hasRole('SuperAdmin')
            ? $request->input('etablissement_id')
            : $user->etablissement_id;

        if ($etablissementId) {
            abort_unless(
                Etablissement::whereKey($etablissementId)->exists(),
                404,
                'Établissement introuvable.'
            );
        }

        $eleves = collect();

        if ($etablissementId) {
            $eleves = Eleve::query()
                ->where('etablissement_id', $etablissementId)
                ->with('classe:id,libelle')
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'matricule',
                    'code_eleve',
                    'nom',
                    'prenoms',
                    'classe_id',
                    'etablissement_id',
                ]);
        }

        return Inertia::render('Parents/Create', [
            'etablissements' => Etablissement::query()
                ->when(
                    !$user->hasRole('SuperAdmin'),
                    fn($q) => $q->where('id', $user->etablissement_id)
                )
                ->orderBy('nom')
                ->get(['id', 'nom']),

            'etablissementId' => $etablissementId,

            'isSuperAdmin' => $user->hasRole('SuperAdmin'),

            'eleves' => $eleves,
        ]);
    }

    /**
     * Création d'un compte parent et association à plusieurs élèves.
     */
    public function store(Request $request)
    {
        $this->autoriser();

        $etablissementId = $this->etablissementId($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'telephone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'eleves' => ['required', 'array', 'min:1'],
            'eleves.*.id' => ['required', 'integer', 'distinct'],
            'eleves.*.lien' => ['nullable', 'string', 'max:30'],
        ]);

        $eleveIds = collect($validated['eleves'])
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values();

        $eleves = Eleve::query()
            ->where('etablissement_id', $etablissementId)
            ->whereIn('id', $eleveIds)
            ->get();

        $eleveSansMatricule = $eleves->first(
            fn($eleve) => trim((string) $eleve->matricule) === ''
        );

        if ($eleveSansMatricule) {
            throw ValidationException::withMessages([
                'eleves' => 'Tous les élèves sélectionnés doivent posséder un matricule pour générer le mot de passe initial.',
            ]);
        }

        if ($eleves->count() !== $eleveIds->count()) {
            throw ValidationException::withMessages([
                'eleves' => 'Un ou plusieurs élèves ne correspondent pas à cet établissement.',
            ]);
        }

        $motDePasseInitial = trim(
            (string) $eleves->first()->matricule
        );

        $parent = null;

        DB::transaction(function () use (
            $validated,
            $etablissementId,
            $motDePasseInitial,
            &$parent
        ) {
            $parent = User::create([
                'name' => $validated['name'],
                'telephone' => $validated['telephone'],
                'email' => $validated['email'] ?? null,
                'password' => $motDePasseInitial,
                'initial_password' => $motDePasseInitial,
                'etablissement_id' => $etablissementId,
                'fonction' => 'Parent',
                'actif' => true,
                'must_change_password' => true,
                'genere_automatiquement' => false,
            ]);

            $parent->assignRole('Parent');

            $associations = [];

            foreach ($validated['eleves'] as $association) {
                $associations[(int) $association['id']] = [
                    'lien' => $association['lien'] ?? 'Responsable légal',
                ];
            }

            $parent->eleves()->attach($associations);
        });

        return redirect()
            ->route('parents.index')
            ->with('success', 'Compte parent créé et élèves associés avec succès.')
            ->with('initial_password', $motDePasseInitial)
            ->with('created_user', $parent->name);
    }


    public function index(Request $request)
    {
        $this->autoriser();

        $user = Auth::user();

        $etablissementId = $user->hasRole('SuperAdmin')
            ? $request->input('etablissement_id')
            : $user->etablissement_id;

        $query = User::query()
            ->with(['roles', 'etablissement', 'eleves.classe'])
            ->whereHas('roles', fn($q) => $q->where('name', 'Parent'));

        if ($etablissementId) {
            $query->where('etablissement_id', $etablissementId);
        }


        $recherche = trim($request->input('recherche', ''));
        $rechercheEleve = trim($request->input('recherche_eleve', ''));
        $classeId = $request->input('classe_id');

        $request->validate([
            'classe_id' => ['nullable', 'integer', 'exists:classes,id'],
        ]);

        if ($classeId) {
            $classeSelectionnee = Classe::query()
                ->whereKey($classeId)
                ->when(
                    $etablissementId,
                    fn($q) => $q->where('etablissement_id', $etablissementId)
                )
                ->exists();

            abort_unless(
                $classeSelectionnee,
                422,
                'La classe sélectionnée ne correspond pas à votre établissement.'
            );

            $query->whereHas('eleves', function ($q) use ($classeId) {
                $q->where('classe_id', $classeId);
            });
        }

        if ($rechercheEleve !== '') {
            $query->whereHas('eleves', function ($q) use ($rechercheEleve) {
                $q->where(function ($eleveQuery) use ($rechercheEleve) {
                    $eleveQuery
                        ->where('matricule', 'like', "%{$rechercheEleve}%")
                        ->orWhere('code_eleve', 'like', "%{$rechercheEleve}%")
                        ->orWhere('nom', 'like', "%{$rechercheEleve}%")
                        ->orWhere('prenoms', 'like', "%{$rechercheEleve}%");
                });
            });
        }

        if ($recherche !== '') {
            $query->where(function ($q) use ($recherche) {
                $q->where('name', 'like', "%{$recherche}%")
                    ->orWhere('email', 'like', "%{$recherche}%")
                    ->orWhere('telephone', 'like', "%{$recherche}%");
            });
        }

        if ($request->filled('statut')) {
            $query->where('actif', $request->statut === 'actif');
        }


        $parents = (clone $query)
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Exposer le mot de passe initial uniquement si le parent
        // ne l'a pas encore changé.
        $parents->getCollection()->transform(function (User $parent) {
            $motDePasseInitial = $parent->must_change_password
                ? $parent->initial_password
                : null;

            // Ne jamais transmettre directement le champ initial_password.
            $parent->makeHidden('initial_password');

            $parent->setAttribute(
                'mot_de_passe_initial',
                $motDePasseInitial
            );

            return $parent;
        });

        $statsQuery = User::query()
            ->whereHas('roles', fn($q) => $q->where('name', 'Parent'));

        if ($etablissementId) {
            $statsQuery->where('etablissement_id', $etablissementId);
        }

        $etablissements = Etablissement::query()
            ->when(
                !$user->hasRole('SuperAdmin'),
                fn($q) => $q->where('id', $user->etablissement_id)
            )
            ->orderBy('nom')
            ->get(['id', 'nom']);

        $niveaux = Niveau::orderBy('ordre')
            ->get(['id', 'libelle', 'code']);

        $classes = Classe::query()
            ->when(
                $etablissementId,
                fn($q) => $q->where('etablissement_id', $etablissementId)
            )
            ->with('niveau:id,libelle')
            ->orderBy('libelle')
            ->get(['id', 'libelle', 'niveau_id']);

        $comptesAutomatiques = (clone $statsQuery)
            ->where('genere_automatiquement', true)
            ->count();

        return Inertia::render('Parents/Index', [
            'parents' => $parents,
            'stats' => [
                'total' => (clone $statsQuery)->count(),
                'actifs' => (clone $statsQuery)->where('actif', true)->count(),
                'inactifs' => (clone $statsQuery)->where('actif', false)->count(),
                'automatiques' => $comptesAutomatiques,
            ],
            'etablissements' => $etablissements,
            'niveaux' => $niveaux,
            'classes' => $classes,
            'filtres' => [
                'recherche' => $recherche,
                'recherche_eleve' => $rechercheEleve,
                'classe_id' => $classeId,
                'statut' => $request->input('statut', ''),
                'etablissement_id' => $etablissementId,
            ],
            'isSuperAdmin' => $user->hasRole('SuperAdmin'),
        ]);
    }

    /**
     * Aperçu avant génération des comptes.
     */

    public function previsualiser(Request $request)
    {
        $this->autoriserSuperAdmin();

        $etablissementId = $this->etablissementId($request);

        $eleves = $this->elevesDuPerimetre($request, $etablissementId)
            ->get([
                'id',
                'matricule',
                'responsable_nom',
                'responsable_prenoms',
                'responsable_telephone',
            ]);

        $groupes = [];
        $sansTelephone = 0;
        $sansMatricule = 0;

        foreach ($eleves as $eleve) {
            $telephone = $this->telephoneNormalise(
                $eleve->responsable_telephone
            );

            $nom = trim(
                ($eleve->responsable_nom ?? '') . ' ' .
                    ($eleve->responsable_prenoms ?? '')
            );

            if (!$telephone || !$nom) {
                $sansTelephone++;
                continue;
            }

            $groupes[$telephone][] = $eleve;

            if (!trim($eleve->matricule ?? '')) {
                $sansMatricule++;
            }
        }

        $comptesIndex = $this->comptesParTelephone($etablissementId);

        $existants = 0;
        $conflits = 0;
        $nouveaux = 0;

        foreach ($groupes as $telephone => $elevesDuParent) {
            $comptes = $comptesIndex[$telephone] ?? [];

            $parents = array_filter(
                $comptes,
                fn($compte) => $this->estCompteParent($compte)
            );

            $autresComptes = array_filter(
                $comptes,
                fn($compte) => !$this->estCompteParent($compte)
            );

            if (count($autresComptes) > 0) {
                $conflits++;
            } elseif (count($parents) > 0) {
                $existants++;
            } else {
                $possedeMatricule = collect($elevesDuParent)->contains(
                    fn($eleve) => trim($eleve->matricule ?? '') !== ''
                );

                if ($possedeMatricule) {
                    $nouveaux++;
                }
            }
        }

        return response()->json([
            'eleves' => $eleves->count(),
            'parents_distincts' => count($groupes),
            'comptes_existants' => $existants,
            'nouveaux_comptes' => $nouveaux,
            'conflits_telephone' => $conflits,
            'sans_telephone' => $sansTelephone,
            'sans_matricule' => $sansMatricule,
        ]);
    }


    /**
     * Génération effective des comptes.
     */

    public function generer(Request $request)
    {
        $this->autoriserSuperAdmin();

        $etablissementId = $this->etablissementId($request);

        $eleves = $this->elevesDuPerimetre($request, $etablissementId)
            ->get();

        $groupes = [];

        foreach ($eleves as $eleve) {
            $telephone = $this->telephoneNormalise(
                $eleve->responsable_telephone
            );

            $nom = trim(
                ($eleve->responsable_nom ?? '') . ' ' .
                    ($eleve->responsable_prenoms ?? '')
            );

            if (!$telephone || !$nom) {
                continue;
            }

            $groupes[$telephone][] = $eleve;
        }

        $crees = 0;
        $associes = 0;
        $ignores = 0;
        $conflits = 0;

        DB::transaction(function () use (
            $groupes,
            $etablissementId,
            &$crees,
            &$associes,
            &$ignores,
            &$conflits
        ) {
            $comptesIndex = $this->comptesParTelephone($etablissementId);

            foreach ($groupes as $telephone => $elevesDuParent) {
                $comptes = $comptesIndex[$telephone] ?? [];

                $parents = array_values(array_filter(
                    $comptes,
                    fn($compte) => $this->estCompteParent($compte)
                ));

                $autresComptes = array_filter(
                    $comptes,
                    fn($compte) => !$this->estCompteParent($compte)
                );

                // Un numéro utilisé par un autre profil ne doit pas
                // servir à créer un deuxième compte.
                if (count($autresComptes) > 0) {
                    $conflits++;
                    $ignores += count($elevesDuParent);
                    continue;
                }

                $parent = $parents[0] ?? null;

                // Chercher un matricule parmi tous les enfants du parent.
                $eleveAvecMatricule = collect($elevesDuParent)->first(
                    fn($eleve) => trim($eleve->matricule ?? '') !== ''
                );

                if (!$parent && !$eleveAvecMatricule) {
                    $ignores += count($elevesDuParent);
                    continue;
                }

                if (!$parent) {
                    $premierEleve = $elevesDuParent[0];

                    $nom = trim(
                        ($premierEleve->responsable_nom ?? '') . ' ' .
                            ($premierEleve->responsable_prenoms ?? '')
                    );

                    $matricule = trim($eleveAvecMatricule->matricule);

                    $parent = User::create([
                        'name' => $nom,
                        'email' => null,
                        'telephone' => $telephone,
                        'password' => $matricule,
                        'initial_password' => $matricule,
                        'etablissement_id' => $etablissementId,
                        'fonction' => 'Parent',
                        'actif' => true,
                        'must_change_password' => true,
                        'genere_automatiquement' => true,
                    ]);

                    $parent->assignRole('Parent');
                    $crees++;

                    // Ajouter le compte créé à l'index pour éviter
                    // toute nouvelle création pendant cette opération.
                    $comptesIndex[$telephone][] = $parent;

                    // Garantir le stockage du numéro au format national à 10 chiffres.
                    if ($parent->telephone !== $telephone) {
                        $parent->telephone = $telephone;
                        $parent->save();
                    }
                }

                foreach ($elevesDuParent as $eleve) {
                    if (!$parent->eleves()
                        ->where('eleves.id', $eleve->id)
                        ->exists()) {

                        $parent->eleves()->attach($eleve->id, [
                            'lien' => $eleve->type_tuteur
                                ?? 'Responsable légal',
                        ]);

                        $associes++;
                    }
                }
            }
        });

        return back()->with(
            'success',
            "Génération terminée : {$crees} compte(s) créé(s), " .
                "{$associes} association(s) effectuée(s), " .
                "{$conflits} numéro(s) en conflit, " .
                "{$ignores} fiche(s) ignorée(s)."
        );
    }


    /**
     * Supprimer un compte parent, qu'il soit créé manuellement
     * ou généré automatiquement.
     */
    public function destroy(User $parent)
    {
        $this->autoriserSuperAdmin();

        abort_unless($parent->hasRole('Parent'), 404);

        DB::transaction(function () use ($parent) {
            // Supprimer uniquement les associations avec les élèves.
            // Les fiches des élèves et leurs autres parents sont conservés.
            $parent->eleves()->detach();

            // Supprimer le compte parent.
            $parent->delete();
        });

        return back()->with(
            'success',
            'Le compte parent a été supprimé avec succès.'
        );
    }


    /**
     * Supprimer tous les comptes parents générés automatiquement
     * dans un établissement.
     */
    public function supprimerAutomatiques(Request $request)
    {
        $this->autoriserSuperAdmin();

        $etablissementId = $this->etablissementId($request);

        $comptes = User::query()
            ->where('etablissement_id', $etablissementId)
            ->where('genere_automatiquement', true)
            ->whereHas('roles', fn($q) => $q->where('name', 'Parent'))
            ->get();

        $nombre = $comptes->count();

        DB::transaction(function () use ($comptes) {
            foreach ($comptes as $parent) {
                $parent->eleves()->detach();
                $parent->delete();
            }
        });

        return back()->with(
            'success',
            "{$nombre} compte(s) parent(s) généré(s) automatiquement supprimé(s)."
        );
    }
}
