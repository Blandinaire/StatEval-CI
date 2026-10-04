<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMaquetteRequest;
use App\Http\Requests\StoreMaquetteVersionRequest;
use App\Models\AnneeScolaire;
use App\Models\Cycle;
use App\Models\Maquette;
use App\Models\Niveau;
use App\Models\Serie;
use App\Services\MaquetteService;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class MaquetteController extends Controller
{
    public function __construct(
        protected MaquetteService $maquetteService
    ) {}

    /**
     * Liste des maquettes et de leurs versions.
     */
    public function index()
    {
        return Inertia::render('Maquettes/Index', [
            'maquettes' => Maquette::with([
                'cycle',
                'niveau',
                'serie',
                'anneeScolaire',
            ])
                ->withCount([
                    'lignes',
                    'classes',
                ])
                ->orderByDesc('annee_scolaire_id')
                ->orderBy('niveau_id')
                ->orderBy('serie_id')
                ->orderBy('version')
                ->paginate(15)
                ->withQueryString(),
        ]);
    }

    /**
     * Formulaire de création de la première version.
     */
    public function create()
    {
        abort_unless(
            auth()->user()->hasRole('SuperAdmin'),
            403
        );

        return Inertia::render('Maquettes/Create', [
            'annees' =>
                AnneeScolaire::orderByDesc('date_debut')->get(),

            'cycles' =>
                Cycle::orderBy('ordre')->get(),

            'niveaux' =>
                Niveau::orderBy('ordre')->get(),

            'series' =>
                Serie::where('actif', true)
                    ->orderBy('ordre')
                    ->get(),
        ]);
    }

    /**
     * Création de V1.
     */
    public function store(StoreMaquetteRequest $request)
    {
        $maquette = $this->maquetteService->create(
            $request->validated()
        );

        return redirect()
            ->route(
                'maquettes.show',
                $maquette->id
            )
            ->with(
                'success',
                'Maquette créée avec succès.'
            );
    }

    /**
     * Fiche d'une version.
     */
    public function show(Maquette $maquette)
    {
        $maquette->load([
            'anneeScolaire',
            'cycle',
            'niveau',
            'serie',
            'lignes.matiere',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Toutes les versions de la même famille
        |--------------------------------------------------------------------------
        */

        $versionsQuery = Maquette::with([
            'anneeScolaire',
            'cycle',
            'niveau',
            'serie',
        ])
            ->withCount([
                'lignes',
                'classes',
            ])
            ->where(
                'annee_scolaire_id',
                $maquette->annee_scolaire_id
            )
            ->where(
                'cycle_id',
                $maquette->cycle_id
            )
            ->where(
                'niveau_id',
                $maquette->niveau_id
            );

        if ($maquette->serie_id) {
            $versionsQuery->where(
                'serie_id',
                $maquette->serie_id
            );
        } else {
            $versionsQuery->whereNull('serie_id');
        }

        $versions = $versionsQuery
            ->orderBy('version')
            ->get();

        return Inertia::render('Maquettes/Show', [
            'maquette' =>
                $maquette,

            'versions' =>
                $versions,
        ]);
    }

    /**
     * Créer une nouvelle version.
     */
    public function storeVersion(
        StoreMaquetteVersionRequest $request,
        Maquette $maquette
    ) {
        $version = $this->maquetteService->createVersion(
            $maquette,
            $request->validated()
        );

        return redirect()
            ->route(
                'maquettes.show',
                $version->id
            )
            ->with(
                'success',
                'Nouvelle version créée avec succès.'
            );
    }

    /**
     * Activer / désactiver une version.
     *
     * Plusieurs versions peuvent être actives.
     */
    public function toggleActive(Maquette $maquette)
    {
        $this->maquetteService->toggleActive(
            $maquette
        );

        return back()->with(
            'success',
            $maquette->active
                ? 'Version activée avec succès.'
                : 'Version désactivée avec succès.'
        );
    }

    /**
     * Supprimer une version.
     */
    public function destroy(Maquette $maquette)
    {
        try {
            $this->maquetteService->delete(
                $maquette
            );
        } catch (ValidationException $exception) {
            return back()->withErrors(
                $exception->errors()
            );
        }

        return redirect()
            ->route('maquettes.index')
            ->with(
                'success',
                'Version de maquette supprimée avec succès.'
            );
    }
}