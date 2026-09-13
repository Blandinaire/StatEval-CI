<?php

namespace App\Http\Controllers;

use App\Models\Educateur;
use App\Models\Enseignant;
use App\Models\Etablissement;
use App\Models\EtablissementResponsable;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Vérifie que l'utilisateur connecté peut gérer les comptes.
     */
    private function authorizeManagement(): void
    {
        abort_unless(
            Auth::check()
                && Auth::user()->hasAnyRole([
                    'SuperAdmin',
                    'Administrateur',
                ]),
            403
        );
    }

    /**
     * Vérifie qu'un administrateur reste dans son établissement.
     */
    private function authorizeEstablishment(?int $etablissementId): void
    {
        $currentUser = Auth::user();

        if ($currentUser->hasRole('SuperAdmin')) {
            return;
        }

        abort_unless(
            $etablissementId !== null
                && (int) $currentUser->etablissement_id === $etablissementId,
            403
        );
    }

    /**
     * Liste des utilisateurs.
     */
    public function index()
    {
        $this->authorizeManagement();

        $query = User::with([
            'roles',
            'etablissement',
            'enseignant',
            'educateur',
            'etablissementResponsable',
        ])->orderBy('name');

        // Un Administrateur ne voit que les utilisateurs
        // de son propre établissement.
        if (Auth::user()->hasRole('Administrateur')) {
            $query->where('etablissement_id', Auth::user()->etablissement_id);
        }

        $users = $query->get();

        $etablissementsQuery = Etablissement::orderBy('nom');

        if (Auth::user()->hasRole('Administrateur')) {
            $etablissementsQuery->where(
                'id',
                Auth::user()->etablissement_id
            );
        }

        return Inertia::render('Utilisateurs/Index', [
            'users' => $users,
            'roles' => Role::whereIn('name', [
                'SuperAdmin',
                'Administrateur',
                'Direction',
                'Professeur',
                'Educateur',
            ])->orderBy('name')->get(),
            'etablissements' => $etablissementsQuery->get(),
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create()
    {
        $this->authorizeManagement();

        $etablissementsQuery = Etablissement::where('actif', true)
            ->orderBy('nom');

        if (Auth::user()->hasRole('Administrateur')) {
            $etablissementsQuery->where(
                'id',
                Auth::user()->etablissement_id
            );
        }

        return Inertia::render('Utilisateurs/Create', [
            'roles' => Role::whereIn('name', [
                'SuperAdmin',
                'Administrateur',
                'Direction',
                'Professeur',
                'Educateur',
            ])
                ->orderBy('name')
                ->get(),

            'etablissements' => $etablissementsQuery->get(),

            'enseignants' => collect(),

            'educateurs' => collect(),
            'responsables' => collect(),
        ]);
    }

    /**
     * Retourne les comptes utilisateurs disponibles
     * pour un établissement et un rôle.
     */
    /**
     * Retourne les comptes utilisateurs disponibles
     * pour un établissement et un rôle.
     *
     * Cette route est accessible avant authentification
     * afin de permettre à un membre du personnel de
     * sélectionner son compte pour se connecter.
     */
    public function personnelOptions(Request $request)
    {
        $validated = $request->validate([
            'etablissement_id' => [
                'required',
                'integer',
                'exists:etablissements,id',
            ],

            'role' => [
                'required',
                'string',
                'in:Administrateur,Direction,Professeur,Educateur',
            ],
        ]);

        $etablissementId = (int) $validated['etablissement_id'];
        $role = $validated['role'];

        // L'établissement doit être actif.
        $etablissement = Etablissement::query()
            ->where('id', $etablissementId)
            ->where('actif', true)
            ->firstOrFail();

        // Recherche uniquement les comptes actifs
        // appartenant à cet établissement et possédant
        // le rôle sélectionné.
        $users = User::query()
            ->where('etablissement_id', $etablissement->id)
            ->where('actif', true)
            ->whereHas('roles', function ($query) use ($role) {
                $query->where('name', $role);
            })
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        return response()->json($users);
    }

    public function creationPersonnelOptions(Request $request)
    {
        $this->authorizeManagement();

        $validated = $request->validate([
            'etablissement_id' => [
                'required',
                'integer',
                'exists:etablissements,id',
            ],

            'role' => [
                'required',
                'string',
                'in:Administrateur,Direction,Professeur,Educateur',
            ],
        ]);

        $etablissementId = (int) $validated['etablissement_id'];
        $role = $validated['role'];

        $this->authorizeEstablishment($etablissementId);

        if ($role === 'Professeur') {
            $personnes = Enseignant::query()
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)
                ->whereDoesntHave('user')
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'etablissement_id',
                    'nom',
                    'prenoms',
                    'email',
                ]);
        } elseif ($role === 'Educateur') {
            $personnes = Educateur::query()
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)
                ->whereDoesntHave('user')
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'etablissement_id',
                    'nom',
                    'prenoms',
                    'email',
                ]);
        } else {
            $personnes = EtablissementResponsable::query()
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)
                ->whereDoesntHave('user')
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'etablissement_id',
                    'civilite',
                    'nom',
                    'prenoms',
                    'fonction',
                    'email',
                ]);
        }

        return response()->json([
            'personnes' => $personnes,
        ]);
    }

    /**
     * Création d'un utilisateur.
     */
    public function store(Request $request)
    {
        $this->authorizeManagement();

        $validated = $request->validate([
            'role' => [
                'required',
                'string',
                'exists:roles,name',
            ],

            'etablissement_id' => [
                'nullable',
                'integer',
                'exists:etablissements,id',
            ],

            'enseignant_id' => [
                'nullable',
                'integer',
                'exists:enseignants,id',
            ],

            'educateur_id' => [
                'nullable',
                'integer',
                'exists:educateurs,id',
            ],

            'etablissement_responsable_id' => [
                'nullable',
                'integer',
                'exists:etablissement_responsables,id',
            ],

            'name' => [
                'nullable',
                'string',
                'max:150',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'nullable',
                'string',
                'min:8',
            ],

            'fonction' => [
                'nullable',
                'string',
                'max:150',
            ],

            'actif' => [
                'boolean',
            ],
        ]);

        $role = $validated['role'];

        /*
         * ---------------------------------------------------------
         * SUPERVISION DE L'ÉTABLISSEMENT
         * ---------------------------------------------------------
         */

        $etablissementId = $role === 'SuperAdmin'
            ? null
            : ($validated['etablissement_id'] ?? null);

        if ($role !== 'SuperAdmin') {
            abort_unless($etablissementId !== null, 422);

            $this->authorizeEstablishment($etablissementId);
        }

        /*
         * ---------------------------------------------------------
         * SUPÉRADMIN
         * ---------------------------------------------------------
         */

        if ($role === 'SuperAdmin') {
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:150',
                ],
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    'unique:users,email',
                ],
                'password' => [
                    'required',
                    'string',
                    'min:8',
                ],
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'fonction' => $validated['fonction'] ?? 'SuperAdministrateur',
                'etablissement_id' => null,
                'enseignant_id' => null,
                'educateur_id' => null,
                'etablissement_responsable_id' => null,
                'actif' => $validated['actif'] ?? true,
                'must_change_password' => false,
            ]);

            $user->syncRoles(['SuperAdmin']);

            return redirect()
                ->route('users.index')
                ->with('success', 'SuperAdmin créé avec succès.');
        }

        /*
         * ---------------------------------------------------------
         * PROFESSEUR
         * ---------------------------------------------------------
         */

        if ($role === 'Professeur') {
            abort_unless(
                !empty($validated['enseignant_id']),
                422,
                'Veuillez sélectionner un enseignant.'
            );

            $enseignant = Enseignant::query()
                ->where('id', $validated['enseignant_id'])
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)
                ->firstOrFail();

            abort_if(
                User::where('enseignant_id', $enseignant->id)->exists(),
                422,
                'Cet enseignant possède déjà un compte utilisateur.'
            );

            $name = trim(
                $enseignant->nom . ' ' . $enseignant->prenoms
            );

            $email = $enseignant->email;

            if (!empty($email)) {
                abort_if(
                    User::where('email', $email)->exists(),
                    422,
                    'L’adresse e-mail de cet enseignant est déjà utilisée par un compte.'
                );
            }

            $initialPassword = $this->generateInitialPassword();

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => $initialPassword,
                'initial_password' => $initialPassword,
                'fonction' => 'Professeur',
                'etablissement_id' => $etablissementId,
                'enseignant_id' => $enseignant->id,
                'educateur_id' => null,
                'etablissement_responsable_id' => null,
                'actif' => $validated['actif'] ?? true,
                'must_change_password' => true,
            ]);

            $user->syncRoles(['Professeur']);

            return redirect()
                ->route('users.index')
                ->with('success', 'Compte professeur créé avec succès.')
                ->with('initial_password', $initialPassword)
                ->with('created_user', $name);
        }

        /*
         * ---------------------------------------------------------
         * ÉDUCATEUR
         * ---------------------------------------------------------
         */

        if ($role === 'Educateur') {
            abort_unless(
                !empty($validated['educateur_id']),
                422,
                'Veuillez sélectionner un éducateur.'
            );

            $educateur = Educateur::query()
                ->where('id', $validated['educateur_id'])
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)
                ->firstOrFail();

            abort_if(
                User::where('educateur_id', $educateur->id)->exists(),
                422,
                'Cet éducateur possède déjà un compte utilisateur.'
            );

            $name = trim(
                $educateur->nom . ' ' . $educateur->prenoms
            );

            $email = $educateur->email;

            if (!empty($email)) {
                abort_if(
                    User::where('email', $email)->exists(),
                    422,
                    'L’adresse e-mail de cet éducateur est déjà utilisée par un compte.'
                );
            }

            $initialPassword = $this->generateInitialPassword();

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => $initialPassword,
                'initial_password' => $initialPassword,
                'fonction' => 'Educateur',
                'etablissement_id' => $etablissementId,
                'enseignant_id' => null,
                'educateur_id' => $educateur->id,
                'etablissement_responsable_id' => null,
                'actif' => $validated['actif'] ?? true,
                'must_change_password' => true,
            ]);

            $user->syncRoles(['Educateur']);

            return redirect()
                ->route('users.index')
                ->with('success', 'Compte éducateur créé avec succès.')
                ->with('initial_password', $initialPassword)
                ->with('created_user', $name);
        }

        /*
         * ---------------------------------------------------------
         * ADMINISTRATEUR / DIRECTION
         * ---------------------------------------------------------
         */

        if (in_array($role, [
            'Administrateur',
            'Direction',
        ], true)) {
            abort_unless(
                !empty($validated['etablissement_responsable_id']),
                422,
                'Veuillez sélectionner le responsable concerné.'
            );

            $responsable = EtablissementResponsable::query()
                ->where('id', $validated['etablissement_responsable_id'])
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)
                ->firstOrFail();

            abort_if(
                User::where(
                    'etablissement_responsable_id',
                    $responsable->id
                )->exists(),
                422,
                'Cette personne possède déjà un compte utilisateur.'
            );

            $name = trim(
                $responsable->nom . ' ' . $responsable->prenoms
            );

            $email = $responsable->email;

            if (!empty($email)) {
                abort_if(
                    User::where('email', $email)->exists(),
                    422,
                    'L’adresse e-mail de cette personne est déjà utilisée par un compte.'
                );
            }

            $initialPassword = $this->generateInitialPassword();

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => $initialPassword,
                'initial_password' => $initialPassword,
                'fonction' => $responsable->fonction,
                'etablissement_id' => $etablissementId,
                'enseignant_id' => null,
                'educateur_id' => null,
                'etablissement_responsable_id' => $responsable->id,
                'actif' => $validated['actif'] ?? true,
                'must_change_password' => true,
            ]);

            $user->syncRoles([$role]);

            return redirect()
                ->route('users.index')
                ->with(
                    'success',
                    "Compte {$role} créé avec succès."
                )
                ->with('initial_password', $initialPassword)
                ->with('created_user', $name);
        }

        abort(422, 'Rôle non pris en charge.');
    }

    public function resetPassword(User $user)
    {
        $this->authorizeManagement();

        // Un SuperAdmin ne reçoit pas de mot de passe initial.
        abort_if(
            $user->hasRole('SuperAdmin'),
            422,
            'Le mot de passe d’un SuperAdmin ne peut pas être réinitialisé par cette fonction.'
        );

        // Un Administrateur ne peut agir que dans son établissement.
        if (Auth::user()->hasRole('Administrateur')) {
            abort_unless(
                (int) $user->etablissement_id ===
                    (int) Auth::user()->etablissement_id,
                403
            );
        }

        $initialPassword = $this->generateInitialPassword();

        $user->update([
            'password' => $initialPassword,
            'initial_password' => $initialPassword,
            'must_change_password' => true,
        ]);

        return redirect()
            ->route('users.index')
            ->with(
                'success',
                "Le mot de passe de {$user->name} a été réinitialisé avec succès."
            );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(User $user)
    {
        $this->authorizeManagement();

        if (Auth::user()->hasRole('Administrateur')) {
            abort_unless(
                (int) $user->etablissement_id ===
                    (int) Auth::user()->etablissement_id,
                403
            );
        }

        return Inertia::render('Utilisateurs/Edit', [
            'user' => $user->load([
                'roles',
                'enseignant',
                'educateur',
                'etablissementResponsable',
            ]),

            'roles' => Role::whereIn('name', [
                'SuperAdmin',
                'Administrateur',
                'Direction',
                'Professeur',
                'Educateur',
            ])->orderBy('name')->get(),

            'etablissements' => Etablissement::orderBy('nom')->get(),
        ]);
    }

    /**
     * Modification d'un utilisateur.
     */
    public function update(Request $request, User $user)
    {
        $this->authorizeManagement();

        if (Auth::user()->hasRole('Administrateur')) {
            abort_unless(
                (int) $user->etablissement_id ===
                    (int) Auth::user()->etablissement_id,
                403
            );
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],

            'email' => [
                'nullable',
                'email',
                'max:255',
                'unique:users,email,' . $user->id,
            ],

            'fonction' => [
                'nullable',
                'string',
                'max:150',
            ],

            'role' => [
                'required',
                'string',
                'exists:roles,name',
            ],

            'etablissement_id' => [
                'nullable',
                'integer',
                'exists:etablissements,id',
            ],

            'actif' => [
                'boolean',
            ],
        ]);

        $role = $validated['role'];

        $etablissementId = $role === 'SuperAdmin'
            ? null
            : ($validated['etablissement_id'] ?? null);

        if ($role !== 'SuperAdmin') {
            abort_unless($etablissementId !== null, 422);

            $this->authorizeEstablishment($etablissementId);
        }

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'fonction' => $validated['fonction'] ?? null,
            'etablissement_id' => $etablissementId,
            'actif' => $validated['actif'] ?? true,
        ];

        $user->update($data);

        $user->syncRoles([$role]);

        return redirect()
            ->route('users.index')
            ->with('success', 'Utilisateur modifié avec succès.');
    }

    /**
     * Suppression.
     */
    public function destroy(User $user)
    {
        $this->authorizeManagement();

        if ($user->id === (int) Auth::id()) {
            return back()->with(
                'error',
                'Vous ne pouvez pas supprimer votre propre compte.'
            );
        }

        if (Auth::user()->hasRole('Administrateur')) {
            abort_unless(
                (int) $user->etablissement_id ===
                    (int) Auth::user()->etablissement_id,
                403
            );
        }

        $user->delete();

        return redirect()
            ->route('users.index')
            ->with('success', 'Utilisateur supprimé avec succès.');
    }

    /**
     * Activation / désactivation.
     */
    public function toggle(User $user)
    {
        $this->authorizeManagement();

        if ($user->id === (int) Auth::id()) {
            return back()->with(
                'error',
                'Vous ne pouvez pas désactiver votre propre compte.'
            );
        }

        if (Auth::user()->hasRole('Administrateur')) {
            abort_unless(
                (int) $user->etablissement_id ===
                    (int) Auth::user()->etablissement_id,
                403
            );
        }

        $user->update([
            'actif' => !$user->actif,
        ]);

        return back()->with(
            'success',
            $user->actif
                ? 'Compte activé avec succès.'
                : 'Compte désactivé avec succès.'
        );
    }

    /**
     * Génère le mot de passe temporaire.
     *
     * Il n'est jamais enregistré en clair dans la base.
     */
    private function generateInitialPassword(): string
    {
        return Str::random(12);
    }
}
