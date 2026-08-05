<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNiveauRequest;
use App\Models\Niveau;
use Inertia\Inertia;

class NiveauController extends Controller
{
    /**
     * Afficher la liste des niveaux.
     */
    public function index()
    {
        $niveaux = Niveau::orderBy('ordre')->get();

        return Inertia::render('Niveaux/Index', [
            'niveaux' => $niveaux,
        ]);
    }

    /**
     * Afficher le formulaire de création.
     */
    public function create()
    {
        return Inertia::render('Niveaux/Create');
    }

    /**
     * Enregistrer un niveau.
     */
    public function store(StoreNiveauRequest $request)
    {
        Niveau::create($request->validated());

        return redirect()
            ->route('niveaux.index')
            ->with('success', 'Niveau créé avec succès.');
    }

    /**
     * Afficher le formulaire de modification.
     */
    public function edit(Niveau $niveau)
    {
        return Inertia::render('Niveaux/Edit', [
            'niveau' => $niveau,
        ]);
    }

    /**
     * Mettre à jour un niveau.
     */
    public function update(StoreNiveauRequest $request, Niveau $niveau)
    {
        $niveau->update($request->validated());

        return redirect()
            ->route('niveaux.index')
            ->with('success', 'Niveau modifié avec succès.');
    }

    /**
     * Supprimer un niveau.
     */
    public function destroy(Niveau $niveau)
    {
        $niveau->delete();

        return redirect()
            ->route('niveaux.index')
            ->with('success', 'Niveau supprimé avec succès.');
    }
}