<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCycleRequest;
use App\Models\Cycle;
use Inertia\Inertia;

class CycleController extends Controller
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
     * Liste des cycles.
     *
     * Accessible aux utilisateurs autorisés.
     */
    public function index()
    {
        $cycles = Cycle::orderBy('ordre')->get();

        return Inertia::render('Cycles/Index', [
            'cycles' => $cycles,
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

        return Inertia::render('Cycles/Create');
    }

    /**
     * Enregistrement.
     *
     * SuperAdmin uniquement.
     */
    public function store(StoreCycleRequest $request)
    {
        $this->verifierSuperAdmin();

        Cycle::create($request->validated());

        return redirect()
            ->route('cycles.index')
            ->with(
                'success',
                'Cycle créé avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     *
     * SuperAdmin uniquement.
     */
    public function edit(Cycle $cycle)
    {
        $this->verifierSuperAdmin();

        return Inertia::render('Cycles/Edit', [
            'cycle' => $cycle,
        ]);
    }

    /**
     * Mise à jour.
     *
     * SuperAdmin uniquement.
     */
    public function update(
        StoreCycleRequest $request,
        Cycle $cycle
    ) {
        $this->verifierSuperAdmin();

        $cycle->update(
            $request->validated()
        );

        return redirect()
            ->route('cycles.index')
            ->with(
                'success',
                'Cycle modifié avec succès.'
            );
    }

    /**
     * Suppression.
     *
     * SuperAdmin uniquement.
     */
    public function destroy(Cycle $cycle)
    {
        $this->verifierSuperAdmin();

        $cycle->delete();

        return redirect()
            ->route('cycles.index')
            ->with(
                'success',
                'Cycle supprimé avec succès.'
            );
    }
}