<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEducateurRequest;
use App\Models\Educateur;
use App\Models\Etablissement;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EducateurController extends Controller
{
    /**
     * Liste des éducateurs.
     */
    public function index(): Response
    {
        $educateurs = Educateur::query()
            ->with('etablissement')
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get();

        return Inertia::render('Educateurs/Index', [
            'educateurs' => $educateurs,
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create(): Response
    {
        $etablissements = Etablissement::query()
            ->orderBy('nom')
            ->get([
                'id',
                'nom',
            ]);

        return Inertia::render('Educateurs/Create', [
            'etablissements' => $etablissements,
        ]);
    }

    /**
     * Enregistrement d'un éducateur.
     */
    public function store(
        StoreEducateurRequest $request
    ): RedirectResponse {

        Educateur::create(
            $request->validated()
        );

        return redirect()
            ->route('educateurs.index')
            ->with(
                'success',
                'Éducateur créé avec succès.'
            );
    }

    /**
     * Affichage d'un éducateur.
     */
    public function show(Educateur $educateur): Response
    {
        $educateur->load('etablissement');

        return Inertia::render('Educateurs/Show', [
            'educateur' => $educateur,
        ]);
    }

    /**
     * Formulaire de modification.
     */
    public function edit(Educateur $educateur): Response
    {
        $etablissements = Etablissement::query()
            ->orderBy('nom')
            ->get([
                'id',
                'nom',
            ]);

        return Inertia::render('Educateurs/Edit', [
            'educateur' => $educateur,
            'etablissements' => $etablissements,
        ]);
    }

    /**
     * Mise à jour d'un éducateur.
     */
    public function update(
        StoreEducateurRequest $request,
        Educateur $educateur
    ): RedirectResponse {

        $educateur->update(
            $request->validated()
        );

        return redirect()
            ->route('educateurs.index')
            ->with(
                'success',
                'Éducateur modifié avec succès.'
            );
    }

    /**
     * Suppression d'un éducateur.
     */
    public function destroy(
        Educateur $educateur
    ): RedirectResponse {

        $educateur->delete();

        return redirect()
            ->route('educateurs.index')
            ->with(
                'success',
                'Éducateur supprimé avec succès.'
            );
    }
}