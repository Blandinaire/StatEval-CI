<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClasseRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Niveau;
use Inertia\Inertia;

class ClasseController extends Controller
{
    /**
     * Liste des classes.
     */
    public function index()
{
    $classes = Classe::with(['niveau', 'anneeScolaire'])
        ->orderBy('libelle')
        ->get();

    return Inertia::render('Classes/Index', [
        'classes' => $classes,
    ]);
}

    /**
     * Formulaire de création.
     */
    public function create()
    {
        return Inertia::render('Classes/Create', [
            'niveaux' => Niveau::orderBy('ordre')->get(),
            'annees' => AnneeScolaire::orderByDesc('date_debut')->get(),
        ]);
    }

    /**
     * Enregistrement.
     */
    public function store(StoreClasseRequest $request)
    {
        Classe::create($request->validated());

        return redirect()
            ->route('classes.index')
            ->with('success', 'Classe créée avec succès.');
    }

    /**
     * Formulaire de modification.
     */
    public function edit(Classe $classe)
    {
        return Inertia::render('Classes/Edit', [
            'classe' => $classe,
            'niveaux' => Niveau::orderBy('ordre')->get(),
            'annees' => AnneeScolaire::orderByDesc('date_debut')->get(),
        ]);
    }

    /**
     * Mise à jour.
     */
    public function update(StoreClasseRequest $request, Classe $classe)
    {
        $classe->update($request->validated());

        return redirect()
            ->route('classes.index')
            ->with('success', 'Classe modifiée avec succès.');
    }

    /**
     * Suppression.
     */
    public function destroy(Classe $classe)
    {
        $classe->delete();

        return redirect()
            ->route('classes.index')
            ->with('success', 'Classe supprimée avec succès.');
    }
}