<?php

namespace App\Http\Controllers;

use App\Models\Etablissement;
use App\Models\Cycle;
use App\Models\Serie;
use App\Models\Maquette;
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
    $classes = Classe::with([
        'etablissement',
        'anneeScolaire',
        'cycle',
        'niveau',
        'serie',
        'maquette',
    ])
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

        'etablissements' => Etablissement::orderBy('nom')->get(),

        'annees' => AnneeScolaire::orderByDesc('date_debut')->get(),

        'cycles' => Cycle::orderBy('libelle')->get(),

        'niveaux' => Niveau::orderBy('ordre')->get(),

        'series' => Serie::orderBy('libelle')->get(),

        'maquettes' => Maquette::orderBy('libelle')->get(),

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

        'etablissements' => Etablissement::orderBy('nom')->get(),

        'annees' => AnneeScolaire::orderByDesc('date_debut')->get(),

        'cycles' => Cycle::orderBy('libelle')->get(),

        'niveaux' => Niveau::orderBy('ordre')->get(),

        'series' => Serie::orderBy('libelle')->get(),

        'maquettes' => Maquette::orderBy('libelle')->get(),

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