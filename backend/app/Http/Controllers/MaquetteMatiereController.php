<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMaquetteMatiereRequest;
use App\Models\Maquette;
use App\Models\Matiere;
use App\Models\MaquetteMatiere;
use App\Services\MaquetteMatiereService;
use Inertia\Inertia;

class MaquetteMatiereController extends Controller
{
    public function __construct(
        protected MaquetteMatiereService $service
    ) {}

    /**
     * Liste des matières d'une maquette.
     */
    public function index(Maquette $maquette)
    {
        $maquette->load([
            'etablissement',
            'anneeScolaire',
            'cycle',
            'niveau',
            'serie',
        ]);

        $lignes = $maquette->lignes()
            ->with('matiere')
            ->orderBy('ordre')
            ->get();

        return Inertia::render('MaquettesMatieres/Index', [
            'maquette' => $maquette,
            'lignes' => $lignes,
        ]);
    }

    /**
     * Formulaire d'ajout.
     */
    public function create(Maquette $maquette)
    {
        return Inertia::render('MaquettesMatieres/Create', [

            'maquette' => $maquette,

            'matieres' => Matiere::orderBy('libelle')->get(),

        ]);
    }

    /**
     * Enregistrement.
     */
    public function store(StoreMaquetteMatiereRequest $request)
    {
        $this->service->create(
            $request->validated()
        );

        return redirect()
            ->route(
                'maquettes.matieres.index',
                $request->maquette_id
            )
            ->with(
                'success',
                'Matière ajoutée avec succès.'
            );
    }

    public function edit(Maquette $maquette, MaquetteMatiere $maquetteMatiere)
    {
        return Inertia::render('MaquettesMatieres/Edit', [
            'maquette' => $maquette,
            'ligne' => $maquetteMatiere,
            'matieres' => Matiere::orderBy('libelle')->get(),
        ]);
    }

    public function update(
    StoreMaquetteMatiereRequest $request,
    Maquette $maquette,
    MaquetteMatiere $maquetteMatiere
) {

    $this->service->update(
        $maquetteMatiere,
        $request->validated()
    );

    return redirect()
        ->route(
            'maquettes.matieres.index',
            $maquette->id
        )
        ->with(
            'success',
            'Matière modifiée avec succès.'
        );
}

    public function destroy(
    Maquette $maquette,
    MaquetteMatiere $maquetteMatiere
) {

    $this->service->delete($maquetteMatiere);

    return redirect()
        ->route(
            'maquettes.matieres.index',
            $maquette->id
        )
        ->with(
            'success',
            'Matière supprimée avec succès.'
        );
}
}
