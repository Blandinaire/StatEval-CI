<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAffectationRequest;
use App\Models\Affectation;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Etablissement;
use App\Models\Enseignant;
use App\Models\Matiere;
use Inertia\Inertia;

class AffectationController extends Controller
{
    /**
     * Liste des affectations.
     */
    public function index()
    {
        $affectations = Affectation::with([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
        ])
        ->orderByDesc('id')
        ->get();

        return Inertia::render('Affectations/Index', [
            'affectations' => $affectations,
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create()
    {
        return Inertia::render('Affectations/Create', [

            'etablissements' => Etablissement::orderBy('nom')->get(),

            'annees' => AnneeScolaire::orderByDesc('date_debut')->get(),

            'classes' => Classe::orderBy('libelle')->get(),

            'matieres' => Matiere::orderBy('libelle')->get(),

            'enseignants' => Enseignant::orderBy('nom')->get(),

        ]);
    }

    /**
     * Enregistrement.
     */
    public function store(StoreAffectationRequest $request)
    {
        Affectation::create($request->validated());

        return redirect()
            ->route('affectations.index')
            ->with('success', 'Affectation créée avec succès.');
    }

    /**
     * Formulaire de modification.
     */
    public function edit(Affectation $affectation)
    {
        return Inertia::render('Affectations/Edit', [

            'affectation' => $affectation,

            'etablissements' => Etablissement::orderBy('nom')->get(),

            'annees' => AnneeScolaire::orderByDesc('date_debut')->get(),

            'classes' => Classe::orderBy('libelle')->get(),

            'matieres' => Matiere::orderBy('libelle')->get(),

            'enseignants' => Enseignant::orderBy('nom')->get(),

        ]);
    }

    /**
     * Mise à jour.
     */
    public function update(StoreAffectationRequest $request, Affectation $affectation)
    {
        $affectation->update($request->validated());

        return redirect()
            ->route('affectations.index')
            ->with('success', 'Affectation modifiée avec succès.');
    }

    /**
     * Suppression.
     */
    public function destroy(Affectation $affectation)
    {
        $affectation->delete();

        return redirect()
            ->route('affectations.index')
            ->with('success', 'Affectation supprimée avec succès.');
    }

    public function enseignantsParMatiere($matiereId)
{
    $enseignants = Enseignant::where('matiere_principale_id', $matiereId)
        ->orWhere('matiere_secondaire_id', $matiereId)
        ->where('actif', true)
        ->orderBy('nom')
        ->orderBy('prenoms')
        ->get([
            'id',
            'nom',
            'prenoms',
            'matiere_principale_id',
            'matiere_secondaire_id',
        ]);

    return response()->json($enseignants);
}
}