<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Direction',
            ]),
            403
        );

        $validated = $request->validate([
            'etablissement_id' => [
                'required',
                'integer',
                'exists:etablissements,id',
            ],
            'nom' => [
                'required',
                'string',
                'max:80',
            ],
            'type' => [
                'required',
                'string',
                'max:50',
            ],
            'capacite' => [
                'nullable',
                'integer',
                'min:1',
            ],
        ]);

        if (!$user->hasRole('SuperAdmin')) {
            abort_unless(
                (int) $user->etablissement_id ===
                    (int) $validated['etablissement_id'],
                403
            );
        }

        Salle::create([
            'etablissement_id' => $validated['etablissement_id'],
            'nom' => trim($validated['nom']),
            'type' => $validated['type'],
            'capacite' => $validated['capacite'] ?? null,
            'active' => true,
        ]);

        return back()->with(
            'success',
            'Salle créée avec succès.'
        );
    }

    public function update(Request $request, Salle $salle)
    {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Direction',
            ]),
            403
        );

        if (!$user->hasRole('SuperAdmin')) {
            abort_unless(
                (int) $user->etablissement_id ===
                    (int) $salle->etablissement_id,
                403
            );
        }

        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:80'],
            'type' => ['required', 'string', 'max:50'],
            'capacite' => ['nullable', 'integer', 'min:1'],
        ]);

        $salle->update($validated);

        return back()->with(
            'success',
            'Salle modifiée avec succès.'
        );
    }

    public function toggle(Request $request, Salle $salle)
    {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Direction',
            ]),
            403
        );

        if (!$user->hasRole('SuperAdmin')) {
            abort_unless(
                (int) $user->etablissement_id ===
                    (int) $salle->etablissement_id,
                403
            );
        }

        $salle->update([
            'active' => !$salle->active,
        ]);

        return back()->with(
            'success',
            $salle->active
                ? 'Salle activée.'
                : 'Salle désactivée.'
        );
    }

    public function destroy(Request $request, Salle $salle)
    {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Direction',
            ]),
            403
        );

        if (!$user->hasRole('SuperAdmin')) {
            abort_unless(
                (int) $user->etablissement_id ===
                    (int) $salle->etablissement_id,
                403
            );
        }

        $salle->delete();

        return back()->with(
            'success',
            'Salle supprimée avec succès.'
        );
    }
}