<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEleveRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Etablissement;
use Illuminate\Support\Facades\DB;
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
        | Préparation du responsable légal
        |--------------------------------------------------------------------------
        */

        $validated = $this->preparerResponsableLegal($validated);

        /*
        |--------------------------------------------------------------------------
        | Vérification établissement / classe
        |--------------------------------------------------------------------------
        */

        $classe = Classe::findOrFail($validated['classe_id']);

        if (
            (int) $classe->etablissement_id !==
            (int) $validated['etablissement_id']
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
        | Vérification année scolaire / classe
        |--------------------------------------------------------------------------
        */

        if (
            isset($classe->annee_scolaire_id) &&
            (int) $classe->annee_scolaire_id !==
            (int) $validated['annee_scolaire_id']
        ) {
            return back()
                ->withErrors([
                    'classe_id' =>
                        "La classe sélectionnée n'appartient pas à l'année scolaire choisie.",
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | Création de l'élève
        |--------------------------------------------------------------------------
        */

        $eleve = DB::transaction(function () use ($validated) {

            $eleve = Eleve::create($validated);

            $eleve->update([
                'code_eleve' => 'ELV-' . str_pad(
                    $eleve->id,
                    6,
                    '0',
                    STR_PAD_LEFT
                ),
            ]);

            return $eleve;
        });

        /*
        |--------------------------------------------------------------------------
        | Redirection vers la liste des élèves
        |--------------------------------------------------------------------------
        */

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
        | Préparation du responsable légal
        |--------------------------------------------------------------------------
        */

        $validated = $this->preparerResponsableLegal($validated);

        /*
        |--------------------------------------------------------------------------
        | Vérification établissement / classe
        |--------------------------------------------------------------------------
        */

        $classe = Classe::findOrFail($validated['classe_id']);

        if (
            (int) $classe->etablissement_id !==
            (int) $validated['etablissement_id']
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
        | Vérification année scolaire / classe
        |--------------------------------------------------------------------------
        */

        if (
            isset($classe->annee_scolaire_id) &&
            (int) $classe->annee_scolaire_id !==
            (int) $validated['annee_scolaire_id']
        ) {
            return back()
                ->withErrors([
                    'classe_id' =>
                        "La classe sélectionnée n'appartient pas à l'année scolaire choisie.",
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | Mise à jour de l'élève
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use ($eleve, $validated) {
            $eleve->update($validated);
        });

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

        $classes = Classe::where(
            'etablissement_id',
            $etablissementId
        )
            ->where(
                'annee_scolaire_id',
                $anneeScolaireId
            )
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
     * Préparer automatiquement les informations
     * du responsable légal.
     *
     * Le tuteur légal peut être :
     * - le Père ;
     * - la Mère ;
     * - une autre personne.
     */
    private function preparerResponsableLegal(array $data): array
{
    $type = $data['type_tuteur'] ?? null;

    /*
    |--------------------------------------------------------------------------
    | Père
    |--------------------------------------------------------------------------
    */

    if ($type === 'Père') {

        $data['type_tuteur_legal'] = 'PERE';

        $data['responsable_nom'] =
            $data['pere_nom'] ?? null;

        $data['responsable_prenoms'] =
            $data['pere_prenoms'] ?? null;

        $data['responsable_telephone'] =
            $data['pere_telephone'] ?? null;

        $data['responsable_email'] =
            $data['pere_email'] ?? null;

        $data['responsable_profession'] =
            $data['pere_profession'] ?? null;

        $data['responsable_adresse'] =
            $data['pere_adresse'] ?? null;
    }

    /*
    |--------------------------------------------------------------------------
    | Mère
    |--------------------------------------------------------------------------
    */

    elseif ($type === 'Mère') {

        $data['type_tuteur_legal'] = 'MERE';

        $data['responsable_nom'] =
            $data['mere_nom'] ?? null;

        $data['responsable_prenoms'] =
            $data['mere_prenoms'] ?? null;

        $data['responsable_telephone'] =
            $data['mere_telephone'] ?? null;

        $data['responsable_email'] =
            $data['mere_email'] ?? null;

        $data['responsable_profession'] =
            $data['mere_profession'] ?? null;

        $data['responsable_adresse'] =
            $data['mere_adresse'] ?? null;
    }

    /*
    |--------------------------------------------------------------------------
    | Autre tuteur
    |--------------------------------------------------------------------------
    */

    elseif ($type === 'Autre') {

        $data['type_tuteur_legal'] = 'AUTRE';

        $data['responsable_nom'] =
            $data['tuteur_nom'] ?? null;

        $data['responsable_prenoms'] =
            $data['tuteur_prenoms'] ?? null;

        $data['responsable_telephone'] =
            $data['tuteur_telephone'] ?? null;

        $data['responsable_email'] =
            $data['tuteur_email'] ?? null;

        $data['responsable_profession'] =
            $data['tuteur_profession'] ?? null;

        $data['responsable_adresse'] =
            $data['tuteur_adresse'] ?? null;
    }

    return $data;
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