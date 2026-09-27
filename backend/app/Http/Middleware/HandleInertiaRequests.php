<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        $userData = null;

        if ($user) {
            // Charger le rôle Spatie
            $user->load(['roles', 'etablissement']);

            // Transformer le modèle en tableau
            // afin de ne PAS ajouter "role" au modèle Eloquent
            $userData = $user->toArray();

            // Ajouter le rôle uniquement aux données
            // envoyées à React
            $userData['role'] = $user->getRoleNames()->first();
        }

        return array_merge(parent::share($request), [

            'auth' => [
                'user' => $userData,
            ],

            'flash' => [
                'success' => fn() =>
                $request->session()->get('success'),

                'import_errors' => fn() =>
                $request->session()->get('import_errors', []),

                'import_summary' => fn() =>
                $request->session()->get('import_summary'),

                'import_correction_token' => fn() =>
                $request->session()->get('import_correction_token'),
            ],
        ]);
    }
}
