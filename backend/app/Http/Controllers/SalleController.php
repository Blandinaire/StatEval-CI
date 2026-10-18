<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use App\Models\Etablissement;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SalleController extends Controller
{

    public function index(Request $request)
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

        $query = Salle::query()
            ->with('etablissement:id,nom')
            ->orderBy('nom');

        if (!$user->hasRole('SuperAdmin')) {
            $query->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        $salles = $query->get([
            'id',
            'etablissement_id',
            'nom',
            'type',
            'capacite',
            'active',
        ]);

        $etablissements = $user->hasRole('SuperAdmin')
            ? \App\Models\Etablissement::orderBy('nom')
            ->get(['id', 'nom'])
            : \App\Models\Etablissement::where(
                'id',
                $user->etablissement_id
            )->get(['id', 'nom']);

        return \Inertia\Inertia::render(
            'Salles/Index',
            [
                'salles' => $salles,
                'etablissements' => $etablissements,
                'isSuperAdmin' => $user->hasRole('SuperAdmin'),
                'etablissementId' => $user->etablissement_id,
            ]
        );
    }

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
            'etablissement_id' => ['required', 'integer', 'exists:etablissements,id'],
            'nom' => [
                'required',
                'string',
                'max:255',
                Rule::unique('salles', 'nom')
                    ->where(
                        fn($query) => $query->where(
                            'etablissement_id',
                            $request->etablissement_id
                        )
                    ),
            ],
            'type' => ['required', 'string', 'max:255'],
            'capacite' => ['nullable', 'integer', 'min:1'],
        ], [
            'nom.unique' => 'Cette salle existe déjà dans cet établissement.',
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
            'etablissement_id' => ['required', 'integer', 'exists:etablissements,id'],
            'nom' => [
                'required',
                'string',
                'max:255',
                Rule::unique('salles', 'nom')
                    ->where(
                        fn($query) => $query->where(
                            'etablissement_id',
                            $request->etablissement_id
                        )
                    )
                    ->ignore($salle->id),
            ],
            'type' => ['required', 'string', 'max:255'],
            'capacite' => ['nullable', 'integer', 'min:1'],
        ], [
            'nom.unique' => 'Cette salle existe déjà dans cet établissement.',
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
