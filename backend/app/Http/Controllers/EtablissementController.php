<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEtablissementRequest;
use App\Http\Requests\UpdateEtablissementRequest;
use App\Models\Etablissement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EtablissementController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LISTE / FICHE ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('SuperAdmin')) {

            return Inertia::render(
                'Etablissements/Index',
                [
                    'mode' => 'superadmin',

                    'etablissements' =>
                    Etablissement::orderBy('nom')
                        ->get(),
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | UTILISATEUR D'ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (!$user->etablissement_id) {

            abort(
                403,
                "Aucun établissement n'est associé à votre compte."
            );
        }

        $etablissement = Etablissement::with([
            'responsables',
            'responsablePrincipal',
        ])->findOrFail(
            $user->etablissement_id
        );

        return Inertia::render(
            'Etablissements/Index',
            [
                'mode' => 'etablissement',

                'etablissement' => $etablissement,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CRÉATION
    |--------------------------------------------------------------------------
    */

    public function create()
    {
        abort_unless(
            Auth::user()->hasRole('SuperAdmin'),
            403
        );

        return Inertia::render(
            'Etablissements/Create'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ENREGISTREMENT
    |--------------------------------------------------------------------------
    */

    public function store(
        StoreEtablissementRequest $request
    ) {
        abort_unless(
            Auth::user()->hasRole('SuperAdmin'),
            403
        );

        $data = $request->validated();

        if ($request->hasFile('logo')) {

            $data['logo'] =
                $request
                ->file('logo')
                ->store(
                    'etablissements/logos',
                    'public'
                );
        }

        Etablissement::create($data);

        return redirect()
            ->route('etablissements.index')
            ->with(
                'success',
                'Établissement créé avec succès.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | AFFICHER UN ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    */

    public function show(
        Etablissement $etablissement
    ) {
        $user = Auth::user();

        if (
            !$user->hasRole('SuperAdmin') &&
            $user->etablissement_id !== $etablissement->id
        ) {
            abort(403);
        }

        return Inertia::render(
            'Etablissements/Show',
            [
                'etablissement' =>
                $etablissement->load(
                    'responsables'
                ),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | FORMULAIRE MODIFICATION
    |--------------------------------------------------------------------------
    */

    public function edit(
        Etablissement $etablissement
    ) {
        $user = Auth::user();

        if (
            !$user->hasRole('SuperAdmin') &&
            $user->etablissement_id !== $etablissement->id
        ) {
            abort(403);
        }

        return Inertia::render(
            'Etablissements/Edit',
            [
                'etablissement' => $etablissement,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | MISE À JOUR
    |--------------------------------------------------------------------------
    */

    public function update(
        UpdateEtablissementRequest $request,
        Etablissement $etablissement
    ) {
        $user = Auth::user();

        if (
            !$user->hasRole('SuperAdmin') &&
            $user->etablissement_id !== $etablissement->id
        ) {
            abort(403);
        }

        $data = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | LOGO
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('logo')) {

            if (
                $etablissement->logo &&
                Storage::disk('public')->exists(
                    $etablissement->logo
                )
            ) {
                Storage::disk('public')->delete(
                    $etablissement->logo
                );
            }

            $data['logo'] =
                $request
                ->file('logo')
                ->store(
                    'etablissements/logos',
                    'public'
                );
        }

        $etablissement->update($data);

        return redirect()
            ->route(
                'etablissements.index'
            )
            ->with(
                'success',
                "La fiche de l'établissement a été mise à jour avec succès."
            );
    }

    /*
    |--------------------------------------------------------------------------
    | SUPPRESSION
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Etablissement $etablissement
    ) {
        abort_unless(
            Auth::user()->hasRole('SuperAdmin'),
            403
        );

        if ($etablissement->logo) {

            Storage::disk('public')->delete(
                $etablissement->logo
            );
        }

        $etablissement->delete();

        return redirect()
            ->route('etablissements.index')
            ->with(
                'success',
                'Établissement supprimé avec succès.'
            );
    }
}
