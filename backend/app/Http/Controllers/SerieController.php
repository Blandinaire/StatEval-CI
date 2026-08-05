<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSerieRequest;
use App\Models\Cycle;
use App\Models\Serie;
use Inertia\Inertia;

class SerieController extends Controller
{
    public function index()
    {
        $series = Serie::with('cycle')
            ->orderBy('ordre')
            ->get();

        return Inertia::render('Series/Index', [
            'series' => $series,
        ]);
    }

    public function create()
    {
        return Inertia::render('Series/Create', [
            'cycles' => Cycle::orderBy('ordre')->get(),
        ]);
    }

    public function store(StoreSerieRequest $request)
    {
        Serie::create($request->validated());

        return redirect()
            ->route('series.index')
            ->with('success', 'Série créée avec succès.');
    }

    public function edit(Serie $series)
    {
        return Inertia::render('Series/Edit', [
            'serie' => $series,
            'cycles' => Cycle::orderBy('ordre')->get(),
        ]);
    }

    public function update(StoreSerieRequest $request, Serie $series)
    {
        $series->update($request->validated());

        return redirect()
            ->route('series.index')
            ->with('success', 'Série modifiée avec succès.');
    }

    public function destroy(Serie $series)
    {
        $series->delete();

        return redirect()
            ->route('series.index')
            ->with('success', 'Série supprimée.');
    }
}