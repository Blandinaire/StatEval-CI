<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EtablissementScope
{
    /**
     * Restreint l'accès aux données de l'établissement
     * de l'utilisateur connecté.
     *
     * Le SuperAdmin conserve un accès global.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Aucun utilisateur connecté : on laisse
        // le middleware auth gérer la situation.
        if (!$user) {
            return $next($request);
        }

        // Le SuperAdmin a accès à tous les établissements.
        if ($user->hasRole('SuperAdmin')) {
            return $next($request);
        }

        // Tous les autres utilisateurs doivent
        // appartenir à un établissement.
        if (!$user->etablissement_id) {
            abort(403, 'Aucun établissement n’est associé à votre compte.');
        }

        // On partage l'identifiant de l'établissement
        // avec la requête afin que les contrôleurs
        // puissent l'utiliser.
        $request->attributes->set(
            'etablissement_id',
            $user->etablissement_id
        );

        return $next($request);
    }
}