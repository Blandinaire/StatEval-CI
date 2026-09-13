<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSerieRequest;
use App\Models\Cycle;
use App\Models\Serie;
use Inertia\Inertia;

class SerieController extends Controller
{
    /**
     * Vérifie que l'utilisateur connecté est SuperAdmin.
     */
    private function verifierSuperAdmin(): void
    {
        if (!auth()->user()->hasRole('SuperAdmin')) {
            abort(403);
        }
    }

    /**
     * Liste des séries.
     *
     * Accessible aux utilisateurs autorisés.
     */
    public function index()
    {
        $series = Serie::with('cycle')
            ->orderBy('ordre')
            ->get();

        return Inertia::render('Series/Index', [
            'series' => $series,
        ]);
    }

    /**
     * Formulaire de création.
     *
     * SuperAdmin uniquement.
     */
    public function create()
    {
        $this->verifierSuperAdmin();

        return Inertia::render('Series/Create', [
            'cycles' => Cycle::orderBy('ordre')->get(),
        ]);
    }

    /**
     * Enregistrement.
     *
     * SuperAdmin uniquement.
     */
    public function store(StoreSerieRequest $request)
    {
        $this->verifierSuperAdmin();

        Serie::create(
            $request->validated()
        );

        return redirect()
            ->route('series.index')
            ->with(
                'success',
                'Série créée avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     *
     * SuperAdmin uniquement.
     */
    public function edit($serie)
    {
        $this->verifierSuperAdmin();

        $serie = Serie::findOrFail($serie);

        return Inertia::render('Series/Edit', [
            'serie' => $serie,
            'cycles' => Cycle::orderBy('ordre')->get(),
        ]);
    }

    /**
     * Mise à jour.
     *
     * SuperAdmin uniquement.
     */
    public function update(
        StoreSerieRequest $request,
        $serie
    ) {
        $this->verifierSuperAdmin();

        $serie = Serie::findOrFail($serie);

        $serie->update(
            $request->validated()
        );

        return redirect()
            ->route('series.index')
            ->with(
                'success',
                'Série modifiée avec succès.'
            );
    }

    /**
     * Suppression.
     *
     * SuperAdmin uniquement.
     */
    public function destroy($serie)
    {
        $this->verifierSuperAdmin();

        $serie = Serie::findOrFail($serie);

        $serie->delete();

        return redirect()
            ->route('series.index')
            ->with(
                'success',
                'Série supprimée avec succès.'
            );
    }
}
