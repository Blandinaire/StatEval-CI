<?php

namespace App\Http\Controllers;

use App\Models\AutrePersonnel;
use App\Models\Educateur;
use App\Models\Enseignant;
use App\Models\Etablissement;
use App\Models\EtablissementResponsable;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    private function authorizeManagement(): void
    {
        abort_unless(
            Auth::check() && Auth::user()->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
            ]),
            403
        );
    }

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

    public function index()
    {
        $this->authorizeManagement();

        $query = User::with([
            'roles',
            'etablissement',
            'enseignant',
            'educateur',
            'etablissementResponsable',
            'autrePersonnel.fonction',
        ])->orderBy('name');

        if (Auth::user()->hasRole('Administrateur')) {
            $query->where('etablissement_id', Auth::user()->etablissement_id);
        }

        $etablissementsQuery = Etablissement::orderBy('nom');

        if (Auth::user()->hasRole('Administrateur')) {
            $etablissementsQuery->where('id', Auth::user()->etablissement_id);
        }

        return Inertia::render('Utilisateurs/Index', [
            'users' => $query->get(),
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

    public function create()
    {
        $this->authorizeManagement();

        $etablissementsQuery = Etablissement::where('actif', true)
            ->orderBy('nom');

        if (Auth::user()->hasRole('Administrateur')) {
            $etablissementsQuery->where('id', Auth::user()->etablissement_id);
        }

        return Inertia::render('Utilisateurs/Create', [
            'roles' => Role::whereIn('name', [
                'SuperAdmin',
                'Administrateur',
                'Direction',
                'Professeur',
                'Educateur',
            ])->orderBy('name')->get(),
            'etablissements' => $etablissementsQuery->get(),
            'enseignants' => collect(),
            'educateurs' => collect(),
            'responsables' => collect(),
        ]);
    }

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

        $etablissement = Etablissement::query()
            ->where('id', (int) $validated['etablissement_id'])
            ->where('actif', true)
            ->firstOrFail();

        $role = $validated['role'];

        $users = User::query()
            ->where('etablissement_id', $etablissement->id)
            ->where('actif', true)
            ->whereHas('roles', fn($query) => $query->where('name', $role))
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($users);
    }

    /**
     * Retourne les personnes disponibles pour créer un compte.
     * Pour Administrateur et Direction, les deux catégories sont réunies.
     */
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
                ->get(['id', 'etablissement_id', 'nom', 'prenoms', 'email'])
                ->map(fn($personne) => [
                    'id' => $personne->id,
                    'selection_id' => 'enseignant:' . $personne->id,
                    'type' => 'enseignant',
                    'nom' => $personne->nom,
                    'prenoms' => $personne->prenoms,
                    'email' => $personne->email,
                    'fonction' => 'Professeur',
                ]);
        } elseif ($role === 'Educateur') {
            $personnes = Educateur::query()
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)
                ->whereDoesntHave('user')
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get(['id', 'etablissement_id', 'nom', 'prenoms', 'email'])
                ->map(fn($personne) => [
                    'id' => $personne->id,
                    'selection_id' => 'educateur:' . $personne->id,
                    'type' => 'educateur',
                    'nom' => $personne->nom,
                    'prenoms' => $personne->prenoms,
                    'email' => $personne->email,
                    'fonction' => 'Educateur',
                ]);
        } else {
            $autresPersonnels = AutrePersonnel::with('fonction')
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)
                ->whereNull('user_id')
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get()
                ->map(fn($personnel) => [
                    'id' => $personnel->id,
                    'selection_id' => 'autre_personnel:' . $personnel->id,
                    'type' => 'autre_personnel',
                    'nom' => $personnel->nom,
                    'prenoms' => $personnel->prenoms,
                    'email' => $personnel->email,
                    'fonction' => $personnel->fonction?->libelle ?? '',
                ]);

            $responsables = EtablissementResponsable::query()
                ->where('etablissement_id', $etablissementId)
                ->where('actif', true)
                ->whereDoesntHave('user')
                ->orderByDesc('principal')
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'etablissement_id',
                    'civilite',
                    'nom',
                    'prenoms',
                    'email',
                    'fonction',
                ])
                ->map(fn($responsable) => [
                    'id' => $responsable->id,
                    'selection_id' => 'responsable:' . $responsable->id,
                    'type' => 'responsable',
                    'civilite' => $responsable->civilite,
                    'nom' => $responsable->nom,
                    'prenoms' => $responsable->prenoms,
                    'email' => $responsable->email,
                    'fonction' => $responsable->fonction ?: 'Responsable de l’établissement',
                    'principal' => (bool) $responsable->principal,
                ]);

            $personnes = $autresPersonnels
                ->concat($responsables)
                ->values();
        }

        return response()->json([
            'personnes' => $personnes,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeManagement();

        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
            'etablissement_id' => ['nullable', 'integer', 'exists:etablissements,id'],
            'enseignant_id' => ['nullable', 'integer', 'exists:enseignants,id'],
            'educateur_id' => ['nullable', 'integer', 'exists:educateurs,id'],
            'etablissement_responsable_id' => [
                'nullable',
                'integer',
                'exists:etablissement_responsables,id',
            ],
            'autre_personnel_id' => [
                'nullable',
                'integer',
                'exists:autres_personnels,id',
            ],
            'name' => ['nullable', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:8'],
            'fonction' => ['nullable', 'string', 'max:150'],
            'actif' => ['boolean'],
        ]);

        $role = $validated['role'];

        $etablissementId = $role === 'SuperAdmin'
            ? null
            : (isset($validated['etablissement_id'])
                ? (int) $validated['etablissement_id']
                : null);

        if ($role !== 'SuperAdmin') {
            abort_unless($etablissementId !== null, 422);
            $this->authorizeEstablishment($etablissementId);
        }

        if ($role === 'SuperAdmin') {
            $superAdminData = $request->validate([
                'name' => ['required', 'string', 'max:150'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8'],
            ]);

            $user = User::create([
                'name' => $superAdminData['name'],
                'email' => $superAdminData['email'],
                'password' => $superAdminData['password'],
                'fonction' => $validated['fonction'] ?? 'SuperAdministrateur',
                'etablissement_id' => null,
                'enseignant_id' => null,
                'educateur_id' => null,
                'etablissement_responsable_id' => null,
                'actif' => $validated['actif'] ?? true,
                'must_change_password' => false,
            ]);

            $user->syncRoles(['SuperAdmin']);

            return redirect()->route('users.index')
                ->with('success', 'SuperAdmin créé avec succès.');
        }

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

            $name = trim($enseignant->nom . ' ' . $enseignant->prenoms);
            $email = trim((string) $enseignant->email);

            abort_unless(
                $email !== '',
                422,
                'Renseignez une adresse e-mail sur la fiche de cet enseignant.'
            );

            abort_if(
                User::where('email', $email)->exists(),
                422,
                'Cette adresse e-mail est déjà utilisée par un compte.'
            );

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

            return redirect()->route('users.index')
                ->with('success', 'Compte professeur créé avec succès.')
                ->with('initial_password', $initialPassword)
                ->with('created_user', $name);
        }

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

            $name = trim($educateur->nom . ' ' . $educateur->prenoms);
            $email = trim((string) $educateur->email);

            abort_unless(
                $email !== '',
                422,
                'Renseignez une adresse e-mail sur la fiche de cet éducateur.'
            );

            abort_if(
                User::where('email', $email)->exists(),
                422,
                'Cette adresse e-mail est déjà utilisée par un compte.'
            );

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

            return redirect()->route('users.index')
                ->with('success', 'Compte éducateur créé avec succès.')
                ->with('initial_password', $initialPassword)
                ->with('created_user', $name);
        }

        if (in_array($role, ['Administrateur', 'Direction'], true)) {
            $responsableId = $validated['etablissement_responsable_id'] ?? null;
            $autrePersonnelId = $validated['autre_personnel_id'] ?? null;

            abort_unless(
                (bool) $responsableId xor (bool) $autrePersonnelId,
                422,
                'Sélectionnez une seule personne : un responsable ou un autre personnel.'
            );

            if ($responsableId) {
                $personne = EtablissementResponsable::query()
                    ->where('id', $responsableId)
                    ->where('etablissement_id', $etablissementId)
                    ->where('actif', true)
                    ->whereDoesntHave('user')
                    ->firstOrFail();

                $name = trim($personne->prenoms . ' ' . $personne->nom);
                $email = trim((string) $personne->email);
                $fonction = trim((string) $personne->fonction)
                    ?: 'Responsable de l’établissement';
            } else {
                $personne = AutrePersonnel::with('fonction')
                    ->where('id', $autrePersonnelId)
                    ->where('etablissement_id', $etablissementId)
                    ->where('actif', true)
                    ->whereNull('user_id')
                    ->firstOrFail();

                $name = trim($personne->nom . ' ' . $personne->prenoms);
                $email = trim((string) $personne->email);
                $fonction = $personne->fonction?->libelle ?: $role;
            }

            abort_unless(
                $email !== '',
                422,
                'Renseignez une adresse e-mail sur la fiche de cette personne avant de créer son compte.'
            );

            abort_if(
                User::where('email', $email)->exists(),
                422,
                'Cette adresse e-mail est déjà utilisée par un compte.'
            );

            $initialPassword = $this->generateInitialPassword();

            DB::transaction(function () use (
                $personne,
                $responsableId,
                $name,
                $email,
                $fonction,
                $role,
                $etablissementId,
                $validated,
                $initialPassword,
                &$user
            ) {
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => $initialPassword,
                    'initial_password' => $initialPassword,
                    'fonction' => $fonction,
                    'etablissement_id' => $etablissementId,
                    'enseignant_id' => null,
                    'educateur_id' => null,
                    'etablissement_responsable_id' => $responsableId
                        ? $personne->id
                        : null,
                    'actif' => $validated['actif'] ?? true,
                    'must_change_password' => true,
                ]);

                if (!$responsableId) {
                    $personne->user_id = $user->id;
                    $personne->save();
                }

                $user->syncRoles([$role]);
            });

            return redirect()->route('users.index')
                ->with('success', "Compte {$role} créé avec succès.")
                ->with('initial_password', $initialPassword)
                ->with('created_user', $name);
        }

        abort(422, 'Rôle non pris en charge.');
    }

    public function resetPassword(User $user)
    {
        $this->authorizeManagement();

        abort_if(
            $user->hasRole('SuperAdmin'),
            422,
            'Le mot de passe d’un SuperAdmin ne peut pas être réinitialisé par cette fonction.'
        );

        if (Auth::user()->hasRole('Administrateur')) {
            abort_unless(
                (int) $user->etablissement_id === (int) Auth::user()->etablissement_id,
                403
            );
        }

        $initialPassword = $this->generateInitialPassword();

        $user->update([
            'password' => $initialPassword,
            'initial_password' => $initialPassword,
            'must_change_password' => true,
        ]);

        return redirect()->route('users.index')
            ->with('success', "Le mot de passe de {$user->name} a été réinitialisé avec succès.");
    }

    public function edit(User $user)
    {
        $this->authorizeManagement();

        if (Auth::user()->hasRole('Administrateur')) {
            abort_unless(
                (int) $user->etablissement_id === (int) Auth::user()->etablissement_id,
                403
            );
        }

        return Inertia::render('Utilisateurs/Edit', [
            'user' => $user->load([
                'roles',
                'enseignant',
                'educateur',
                'etablissementResponsable',
                'autrePersonnel.fonction',
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

    public function update(Request $request, User $user)
    {
        $this->authorizeManagement();

        if (Auth::user()->hasRole('Administrateur')) {
            abort_unless(
                (int) $user->etablissement_id === (int) Auth::user()->etablissement_id,
                403
            );
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'fonction' => ['nullable', 'string', 'max:150'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'etablissement_id' => ['nullable', 'integer', 'exists:etablissements,id'],
            'actif' => ['boolean'],
        ]);

        $role = $validated['role'];
        $etablissementId = $role === 'SuperAdmin'
            ? null
            : ($validated['etablissement_id'] ?? null);

        if ($role !== 'SuperAdmin') {
            abort_unless($etablissementId !== null, 422);
            $this->authorizeEstablishment((int) $etablissementId);
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'fonction' => $validated['fonction'] ?? null,
            'etablissement_id' => $etablissementId,
            'actif' => $validated['actif'] ?? true,
        ]);

        $user->syncRoles([$role]);

        return redirect()->route('users.index')
            ->with('success', 'Utilisateur modifié avec succès.');
    }

    public function destroy(User $user)
    {
        $this->authorizeManagement();

        if ($user->id === (int) Auth::id()) {
            return back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        if (Auth::user()->hasRole('Administrateur')) {
            abort_unless(
                (int) $user->etablissement_id === (int) Auth::user()->etablissement_id,
                403
            );
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Utilisateur supprimé avec succès.');
    }

    public function toggle(User $user)
    {
        $this->authorizeManagement();

        if ($user->id === (int) Auth::id()) {
            return back()->with('error', 'Vous ne pouvez pas désactiver votre propre compte.');
        }

        if (Auth::user()->hasRole('Administrateur')) {
            abort_unless(
                (int) $user->etablissement_id === (int) Auth::user()->etablissement_id,
                403
            );
        }

        $user->update(['actif' => !$user->actif]);

        return back()->with(
            'success',
            $user->actif ? 'Compte activé avec succès.' : 'Compte désactivé avec succès.'
        );
    }

    private function generateInitialPassword(): string
    {
        return Str::random(12);
    }
}
