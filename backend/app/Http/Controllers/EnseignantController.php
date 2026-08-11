<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEnseignantRequest;
use App\Models\AnneeScolaire;
use App\Models\Etablissement;
use App\Models\Enseignant;
use App\Models\Matiere;
use Inertia\Inertia;

class EnseignantController extends Controller
{
    /**
     * Liste des enseignants.
     */
    public function index()
    {
        $enseignants = Enseignant::with([
            'etablissement',
            'matierePrincipale',
            'matiereSecondaire',
        ])
        ->orderBy('nom')
        ->orderBy('prenoms')
        ->get();

        return Inertia::render('Enseignants/Index', [
            'enseignants' => $enseignants,
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create()
    {
        return Inertia::render('Enseignants/Create', [
            'etablissements' => Etablissement::orderBy('nom')->get(),
            'matieres'       => Matiere::orderBy('libelle')->get(),
        ]);
    }

    /**
     * Enregistrement.
     */
    public function store(StoreEnseignantRequest $request)
    {
        Enseignant::create($request->validated());

        return redirect()
            ->route('enseignants.index')
            ->with('success', 'Enseignant créé avec succès.');
    }

    /**
     * Formulaire de modification.
     */
    public function edit(Enseignant $enseignant)
    {
        return Inertia::render('Enseignants/Edit', [
            'enseignant'     => $enseignant,
            'etablissements' => Etablissement::orderBy('nom')->get(),
            'matieres'       => Matiere::orderBy('libelle')->get(),
        ]);
    }

    /**
     * Mise à jour.
     */
    public function update(StoreEnseignantRequest $request, Enseignant $enseignant)
    {
        $enseignant->update($request->validated());

        return redirect()
            ->route('enseignants.index')
            ->with('success', 'Enseignant modifié avec succès.');
    }

    /**
     * Suppression.
     */
    public function destroy(Enseignant $enseignant)
    {
        $enseignant->delete();

        return redirect()
            ->route('enseignants.index')
            ->with('success', 'Enseignant supprimé avec succès.');
    }
}