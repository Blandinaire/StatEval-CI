<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCycleRequest;
use App\Models\Cycle;
use Inertia\Inertia;

class CycleController extends Controller
{
    public function index()
    {
        $cycles = Cycle::orderBy('ordre')->get();

        return Inertia::render('Cycles/Index', [
            'cycles' => $cycles,
        ]);
    }

    public function create()
    {
        return Inertia::render('Cycles/Create');
    }

    public function store(StoreCycleRequest $request)
    {
        Cycle::create($request->validated());

        return redirect()
            ->route('cycles.index')
            ->with('success', 'Cycle créé avec succès.');
    }

    public function edit(Cycle $cycle)
    {
        return Inertia::render('Cycles/Edit', [
            'cycle' => $cycle,
        ]);
    }

    public function update(StoreCycleRequest $request, Cycle $cycle)
    {
        $cycle->update($request->validated());

        return redirect()
            ->route('cycles.index')
            ->with('success', 'Cycle modifié avec succès.');
    }

    public function destroy(Cycle $cycle)
    {
        $cycle->delete();

        return redirect()
            ->route('cycles.index')
            ->with('success', 'Cycle supprimé avec succès.');
    }
}