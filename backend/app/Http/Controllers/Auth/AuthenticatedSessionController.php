<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'etablissements' => \App\Models\Etablissement::where('actif', true)
                ->orderBy('nom')
                ->get(['id', 'nom']),

            'canResetPassword' => Route::has('password.request'),

            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Première connexion : changement obligatoire du mot de passe
        if ($user->must_change_password) {
            return redirect()->route('password.change');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

        /**
     * Retourne les comptes disponibles pour la connexion du personnel.
     */
    public function personnelOptions(Request $request): JsonResponse
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

        $users = User::query()
            ->where('etablissement_id', $validated['etablissement_id'])
            ->where('actif', true)
            ->whereHas('roles', function ($query) use ($validated) {
                $query->where('name', $validated['role']);
            })
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        return response()->json($users);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
