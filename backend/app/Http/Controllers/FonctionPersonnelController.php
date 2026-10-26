<?php

namespace App\Http\Controllers;

use App\Models\FonctionPersonnel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FonctionPersonnelController extends Controller
{
    /**
     * Liste des fonctions disponibles.
     */
    public function index(): Response
    {
        abort_unless(
            auth()->user()?->hasRole('SuperAdmin'),
            403
        );

        $fonctions = FonctionPersonnel::query()
            ->withCount('personnels')
            ->orderBy('libelle')
            ->get();

        return Inertia::render('FonctionsPersonnel/Index', [
            'fonctions' => $fonctions,
        ]);
    }

    /**
     * Enregistrer une nouvelle fonction.
     */
    public function store(Request $request): RedirectResponse
    {
        abort_unless(
            auth()->user()?->hasRole('SuperAdmin'),
            403
        );

        $data = $request->validate([
            'libelle' => [
                'required',
                'string',
                'max:150',
                'unique:fonctions_personnel,libelle',
            ],
            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $data['actif'] = true;

        FonctionPersonnel::create($data);

        return redirect()
            ->route('fonctions-personnel.index')
            ->with('success', 'Fonction créée avec succès.');
    }

    /**
     * Modifier une fonction existante.
     */
    public function update(
        Request $request,
        FonctionPersonnel $fonctions_personnel
    ): RedirectResponse {
        abort_unless(
            auth()->user()?->hasRole('SuperAdmin'),
            403
        );

        $data = $request->validate([
            'libelle' => [
                'required',
                'string',
                'max:150',
                Rule::unique('fonctions_personnel', 'libelle')
                    ->ignore($fonctions_personnel->id),
            ],
            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $fonctions_personnel->update($data);

        return redirect()
            ->route('fonctions-personnel.index')
            ->with('success', 'Fonction modifiée avec succès.');
    }

    /**
     * Activer ou désactiver une fonction.
     */
    public function toggle(
        FonctionPersonnel $fonctions_personnel
    ): RedirectResponse {
        abort_unless(
            auth()->user()?->hasRole('SuperAdmin'),
            403
        );

        $fonctions_personnel->update([
            'actif' => ! $fonctions_personnel->actif,
        ]);

        return redirect()
            ->route('fonctions-personnel.index')
            ->with('success', 'Statut de la fonction mis à jour.');
    }

    /**
     * Supprimer une fonction non utilisée.
     */
    public function destroy(
        FonctionPersonnel $fonctions_personnel
    ): RedirectResponse {
        abort_unless(
            auth()->user()?->hasRole('SuperAdmin'),
            403
        );

        if ($fonctions_personnel->personnels()->exists()) {
            return redirect()
                ->route('fonctions-personnel.index')
                ->with(
                    'error',
                    'Cette fonction est utilisée par un ou plusieurs personnels. Désactivez-la plutôt que de la supprimer.'
                );
        }

        $fonctions_personnel->delete();

        return redirect()
            ->route('fonctions-personnel.index')
            ->with('success', 'Fonction supprimée avec succès.');
    }
}
