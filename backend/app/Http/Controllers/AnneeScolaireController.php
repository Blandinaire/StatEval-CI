<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAnneeScolaireRequest;
use App\Models\AnneeScolaire;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnneeScolaireController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    $annees = AnneeScolaire::orderByDesc('date_debut')
        ->get()
        ->map(function ($annee) {
            return [
                'id' => $annee->id,
                'libelle' => $annee->libelle,
                'date_debut' => $annee->date_debut->format('d/m/Y'),
                'date_fin' => $annee->date_fin->format('d/m/Y'),
                'active' => $annee->active,
            ];
        });

    return inertia('AnneeScolaires/Index', [
        'annees' => $annees,
    ]);
}

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('AnneeScolaires/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAnneeScolaireRequest $request)
{
    $data = $request->validated();

    // Si cette année est activée,
    // désactiver toutes les autres.
    if (!empty($data['active']) && $data['active']) {
        AnneeScolaire::query()->update([
            'active' => false,
        ]);
    }

    AnneeScolaire::create($data);

    return redirect()
        ->route('annee-scolaires.index')
        ->with('success', 'Année scolaire créée avec succès.');
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AnneeScolaire $anneeScolaire)
    {
        return Inertia('AnneeScolaires/Edit', [
            'annee' => $anneeScolaire,
        ]);
    }
        //

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreAnneeScolaireRequest $request, AnneeScolaire $anneeScolaire)
{

    if ($request->active) {
        AnneeScolaire::query()->update([
            'active' => false,
        ]);
    }

    $anneeScolaire->update($request->validated());

    return redirect()
        ->route('annee-scolaires.index')
        ->with('success', 'Année scolaire modifiée avec succès.');
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AnneeScolaire $anneeScolaire)
{
    // Empêcher la suppression de l'année active
    if ($anneeScolaire->active) {
        return redirect()
            ->back()
            ->with('error', "Impossible de supprimer l'année scolaire active.");
    }

    $anneeScolaire->delete();

    return redirect()
        ->route('annee-scolaires.index')
        ->with('success', 'Année scolaire supprimée avec succès.');
}
}
