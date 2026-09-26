<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMaquetteRequest;
use App\Models\Maquette;
use App\Services\MaquetteService;
use App\Models\AnneeScolaire;
use App\Models\Cycle;
use App\Models\Niveau;
use App\Models\Serie;
use Inertia\Inertia;

class MaquetteController extends Controller
{
    public function __construct(
        protected MaquetteService $maquetteService
    ) {}

    public function index()
    {
        return Inertia::render('Maquettes/Index', [
            'maquettes' => Maquette::with([
                'cycle',
                'niveau',
                'serie',
                'anneeScolaire'
            ])
                ->latest()
                ->paginate(15),
        ]);
    }

    public function create()
    {
        return Inertia::render('Maquettes/Create', [

            'annees' => AnneeScolaire::orderByDesc('date_debut')->get(),

            'cycles' => Cycle::orderBy('ordre')->get(),

            'niveaux' => Niveau::orderBy('ordre')->get(),

            'series' => Serie::orderBy('ordre')->get(),

        ]);
    }

    public function store(StoreMaquetteRequest $request)
    {
        $this->maquetteService->create(
            $request->validated()
        );

        return redirect()
            ->route('maquettes.index')
            ->with('success', 'Maquette créée avec succès.');
    }

    public function show(Maquette $maquette)
    {
        $maquette->load([
            'anneeScolaire',
            'cycle',
            'niveau',
            'serie',
            'lignes.matiere',
        ]);

        return Inertia::render('Maquettes/Show', [
            'maquette' => $maquette,
        ]);
    }
}
