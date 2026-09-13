<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EtablissementAccess
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

        // Pas connecté
        if (!$user) {
            abort(403);
        }

        // Le SuperAdmin peut accéder à tous les établissements
        if ($user->hasRole('SuperAdmin')) {
            return $next($request);
        }

        // Les utilisateurs sans établissement ne peuvent
        // pas accéder aux données établissement
        if (!$user->etablissement_id) {
            abort(403, 'Aucun établissement n’est associé à votre compte.');
        }

        return $next($request);
    }
}