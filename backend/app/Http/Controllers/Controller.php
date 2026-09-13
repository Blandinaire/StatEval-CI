<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

abstract class Controller
{
    /**
     * Vérifier si l'utilisateur connecté est Super Administrateur.
     */
    protected function isSuperAdmin(): bool
    {
        $user = Auth::user();

        if (! $user) {
            return false;
        }

        return $user->hasRole('SuperAdmin');
    }

    /**
     * Retourner l'identifiant de l'établissement
     * de l'utilisateur actuellement connecté.
     */
    protected function currentEtablissementId(): ?int
    {
        $user = Auth::user();

        if (! $user) {
            return null;
        }

        return $user->etablissement_id
            ? (int) $user->etablissement_id
            : null;
    }
}
