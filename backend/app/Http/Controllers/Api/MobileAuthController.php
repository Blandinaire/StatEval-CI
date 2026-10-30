<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class MobileAuthController extends Controller
{
    /**
     * Connexion mobile : SuperAdmin ou personnel.
     */

    /**
     * Connexion mobile : SuperAdmin, personnel ou parent.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'in:superadmin,personnel,parent'],

            'email' => [
                'required_if:mode,superadmin',
                'nullable',
                'email',
            ],

            'etablissement_id' => [
                'required_if:mode,personnel,parent',
                'nullable',
                'integer',
                'exists:etablissements,id',
            ],

            'role' => [
                'required_if:mode,personnel',
                'nullable',
                'in:Administrateur,Direction,Professeur,Educateur',
            ],

            'user_id' => [
                'required_if:mode,personnel',
                'nullable',
                'integer',
            ],

            'telephone' => [
                'required_if:mode,parent',
                'nullable',
                'string',
                'max:20',
            ],

            'password' => ['required', 'string'],
        ]);

        /*
     * Limitation des tentatives de connexion.
     */
        if ($validated['mode'] === 'superadmin') {
            $key = Str::transliterate(
                Str::lower($validated['email']) . '|' . $request->ip()
            );
        } elseif ($validated['mode'] === 'parent') {
            $telephone = preg_replace(
                '/[\s().-]+/',
                '',
                $validated['telephone']
            );

            $key = implode('|', [
                'mobile-parent',
                $validated['etablissement_id'],
                $telephone,
                $request->ip(),
            ]);
        } else {
            $key = implode('|', [
                'mobile-personnel',
                $validated['etablissement_id'],
                $validated['role'],
                $validated['user_id'],
                $request->ip(),
            ]);
        }

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'message' => 'Trop de tentatives. Réessayez ultérieurement.',
            ], 429);
        }

        /*
     * Recherche du compte dans le bon établissement.
     */
        $userQuery = User::query()->where('actif', true);

        if ($validated['mode'] === 'superadmin') {
            $userQuery->where('email', $validated['email']);
        } elseif ($validated['mode'] === 'parent') {
            $userQuery
                ->where('etablissement_id', $validated['etablissement_id'])
                ->where('telephone', $telephone)
                ->whereHas('roles', function ($query) {
                    $query->where('name', 'Parent');
                });
        } else {
            $userQuery
                ->where('id', $validated['user_id'])
                ->where('etablissement_id', $validated['etablissement_id']);
        }

        $user = $userQuery->first();

        $roleValide = $user && (
            $validated['mode'] === 'superadmin'
            ? $user->hasRole('SuperAdmin')
            : (
                $validated['mode'] === 'parent'
                ? $user->hasRole('Parent')
                : $user->hasRole($validated['role'])
            )
        );

        /*
|--------------------------------------------------------------------------
| Vérification du mot de passe
|--------------------------------------------------------------------------
*/

        $motDePasseValide = false;

        if ($user && $roleValide) {

            if (
                $validated['mode'] === 'parent' &&
                $user->must_change_password
            ) {
                // Le matricule doit appartenir à l'un des enfants associés.
                $motDePasseValide = $user->eleves()
                    ->where('eleves.matricule', $validated['password'])
                    ->exists();
            } else {
                // Authentification habituelle.
                $motDePasseValide = Hash::check(
                    $validated['password'],
                    $user->password
                );
            }
        }

        if (!$user || !$roleValide || !$motDePasseValide) {
            RateLimiter::hit($key, 60);

            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 422);
        }

        RateLimiter::clear($key);

        /*
     * Création du jeton mobile.
     */
        $changementObligatoire = (bool) $user->must_change_password;

        $token = $user->createToken(
            $changementObligatoire
                ? 'mobile-password-change'
                : 'mobile-app',
            $changementObligatoire
                ? ['password:change']
                : ['*']
        );

        return response()->json([
            'message' => $changementObligatoire
                ? 'Le changement du mot de passe est obligatoire.'
                : 'Connexion réussie.',
            'token_type' => 'Bearer',
            'token' => $token->plainTextToken,
            'must_change_password' => $changementObligatoire,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'fonction' => $user->fonction,
                'etablissement_id' => $user->etablissement_id,
                'roles' => $user->getRoleNames()->values(),
            ],
        ]);
    }


    /**
     * Changement du mot de passe initial.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->must_change_password) {
            return response()->json([
                'message' => 'Aucun changement obligatoire en attente.',
            ], 422);
        }

        $validated = $request->validate([
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::defaults(),
            ],
        ]);

        $user->update([
            'password' => $validated['password'],
            'must_change_password' => false,
            'initial_password' => null,
        ]);

        $request->user()->currentAccessToken()?->delete();

        $token = $user->createToken('mobile-app', ['*']);

        return response()->json([
            'message' => 'Mot de passe modifié avec succès.',
            'token_type' => 'Bearer',
            'token' => $token->plainTextToken,
            'must_change_password' => false,
        ]);
    }

    /**
     * Déconnexion mobile : révocation du jeton courant.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }
}
