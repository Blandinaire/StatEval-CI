<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConduiteRequest;
use App\Http\Requests\UpdateConduiteRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Conduite;
use App\Models\Educateur;
use App\Models\Eleve;
use App\Models\Evaluation;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ConduiteController extends Controller
{
    /**
     * Liste des notes de conduite.
     */
    public function index(): Response
    {
        $conduites = Conduite::with([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
            'evaluation',
        ])
            ->latest()
            ->get();

        return Inertia::render('Conduites/Index', [
            'conduites' => $conduites,
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create(): Response
    {
        return Inertia::render('Conduites/Create', [
            'eleves' => Eleve::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'educateurs' => Educateur::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'anneesScolaires' => AnneeScolaire::orderByDesc('id')
                ->get(),

            'classes' => Classe::orderBy('libelle')
                ->get(),

            'evaluations' => Evaluation::orderByDesc('id')
                ->get(),
        ]);
    }

    /**
     * Enregistrement d'une note de conduite.
     */
    public function store(
        StoreConduiteRequest $request
    ): RedirectResponse {
        Conduite::create($request->validated());

        return redirect()
            ->route('conduites.index')
            ->with(
                'success',
                'Note de conduite enregistrée avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(Conduite $conduite): Response
    {
        return Inertia::render('Conduites/Edit', [
            'conduite' => $conduite,

            'eleves' => Eleve::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'educateurs' => Educateur::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'anneesScolaires' => AnneeScolaire::orderByDesc('id')
                ->get(),

            'classes' => Classe::orderBy('libelle')
                ->get(),

            'evaluations' => Evaluation::orderByDesc('id')
                ->get(),
        ]);
    }

    /**
     * Mise à jour d'une note de conduite.
     */
    public function update(
        UpdateConduiteRequest $request,
        Conduite $conduite
    ): RedirectResponse {
        $conduite->update($request->validated());

        return redirect()
            ->route('conduites.index')
            ->with(
                'success',
                'Note de conduite modifiée avec succès.'
            );
    }

    /**
     * Suppression d'une note de conduite.
     */
    public function destroy(
        Conduite $conduite
    ): RedirectResponse {
        $conduite->delete();

        return redirect()
            ->route('conduites.index')
            ->with(
                'success',
                'Note de conduite supprimée avec succès.'
            );
    }
}