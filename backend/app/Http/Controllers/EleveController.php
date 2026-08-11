<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEleveRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Etablissement;
use Inertia\Inertia;

class EleveController extends Controller
{
    /**
     * Afficher la liste des élèves.
     */
    public function index()
    {
        $eleves = Eleve::with([
            'etablissement',
            'anneeScolaire',
            'classe',
        ])
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get();

        return Inertia::render('Eleves/Index', [
            'eleves' => $eleves,
        ]);
    }

    /**
     * Afficher le formulaire de création.
     */
    public function create()
    {
        return Inertia::render('Eleves/Create', [
            'etablissements' => Etablissement::orderBy('nom')->get(),

            'annees' => AnneeScolaire::orderByDesc('date_debut')->get(),

            'classes' => Classe::orderBy('libelle')->get(),
        ]);
    }

    /**
     * Enregistrer un nouvel élève.
     */
    public function store(StoreEleveRequest $request)
    {
        $validated = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | Vérification de cohérence
        |--------------------------------------------------------------------------
        */

        $classe = Classe::findOrFail($validated['classe_id']);

        if (
            $classe->etablissement_id != $validated['etablissement_id']
        ) {
            return back()
                ->withErrors([
                    'classe_id' =>
                    "La classe sélectionnée n'appartient pas à l'établissement choisi.",
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | Création de l'élève
        |--------------------------------------------------------------------------
        */

        $eleve = Eleve::create($validated);

        $eleve->update([
            'code_eleve' => 'ELV-' . str_pad(
                $eleve->id,
                6,
                '0',
                STR_PAD_LEFT
            ),
        ]);

        return redirect()
            ->route('eleves.index')
            ->with('success', 'Élève enregistré avec succès.');
    }

    /**
     * Afficher un élève.
     */
    public function show(Eleve $eleve)
    {
        $eleve->load([
            'etablissement',
            'anneeScolaire',
            'classe',
        ]);

        return Inertia::render('Eleves/Show', [
            'eleve' => $eleve,
        ]);
    }

    /**
     * Afficher le formulaire de modification.
     */
    public function edit(Eleve $eleve)
    {
        $eleve->load([
            'etablissement',
            'anneeScolaire',
            'classe',
        ]);

        return Inertia::render('Eleves/Edit', [
            'eleve' => $eleve,

            'etablissements' => Etablissement::orderBy('nom')->get(),

            'annees' => AnneeScolaire::orderByDesc('date_debut')->get(),

            'classes' => Classe::orderBy('libelle')->get(),
        ]);
    }

    /**
     * Mettre à jour un élève.
     */
    public function update(
        StoreEleveRequest $request,
        Eleve $eleve
    ) {
        $validated = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | Vérification de cohérence
        |--------------------------------------------------------------------------
        */

        $classe = Classe::findOrFail($validated['classe_id']);

        if (
            $classe->etablissement_id != $validated['etablissement_id']
        ) {
            return back()
                ->withErrors([
                    'classe_id' =>
                    "La classe sélectionnée n'appartient pas à l'établissement choisi.",
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | Mise à jour
        |--------------------------------------------------------------------------
        */

        $eleve->update($validated);

        return redirect()
            ->route('eleves.index')
            ->with('success', 'Élève modifié avec succès.');
    }

    /**
     * Retourner les classes correspondant
     * à un établissement et une année scolaire.
     */
    public function classesParEtablissement()
    {
        $etablissementId = request('etablissement_id');
        $anneeScolaireId = request('annee_scolaire_id');

        if (!$etablissementId || !$anneeScolaireId) {
            return response()->json([]);
        }

        $classes = Classe::where('etablissement_id', $etablissementId)
            ->where('annee_scolaire_id', $anneeScolaireId)
            ->where('active', true)
            ->orderBy('libelle')
            ->get([
                'id',
                'libelle',
                'etablissement_id',
                'annee_scolaire_id',
            ]);

        return response()->json($classes);
    }

    /**
     * Supprimer un élève.
     */
    public function destroy(Eleve $eleve)
    {
        $eleve->delete();

        return redirect()
            ->route('eleves.index')
            ->with('success', 'Élève supprimé avec succès.');
    }
}
