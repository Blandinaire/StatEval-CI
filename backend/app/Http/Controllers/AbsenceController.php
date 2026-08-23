<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAbsenceRequest;
use App\Http\Requests\UpdateAbsenceRequest;
use App\Models\Absence;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Educateur;
use App\Models\Eleve;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AbsenceController extends Controller
{
    /**
     * Liste des absences.
     */
    public function index(): Response
    {
        $absences = Absence::with([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
        ])
            ->orderByDesc('date_absence')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Absences/Index', [
            'absences' => $absences,
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create(): Response
    {
        return Inertia::render('Absences/Create', [
            'eleves' => Eleve::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'educateurs' => Educateur::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'anneesScolaires' => AnneeScolaire::orderByDesc('id')
                ->get(),

            'classes' => Classe::orderBy('libelle')
                ->get(),
        ]);
    }

    /**
     * Enregistrement d'une absence.
     */
    public function store(
        StoreAbsenceRequest $request
    ): RedirectResponse {
        Absence::create($request->validated());

        return redirect()
            ->route('absences.index')
            ->with(
                'success',
                'Absence enregistrée avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(
        Absence $absence
    ): Response {
        return Inertia::render('Absences/Edit', [
            'absence' => $absence,

            'eleves' => Eleve::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'educateurs' => Educateur::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'anneesScolaires' => AnneeScolaire::orderByDesc('id')
                ->get(),

            'classes' => Classe::orderBy('libelle')
                ->get(),
        ]);
    }

    /**
     * Mise à jour d'une absence.
     */
    public function update(
        UpdateAbsenceRequest $request,
        Absence $absence
    ): RedirectResponse {
        $absence->update($request->validated());

        return redirect()
            ->route('absences.index')
            ->with(
                'success',
                'Absence modifiée avec succès.'
            );
    }

    /**
     * Suppression d'une absence.
     */
    public function destroy(
        Absence $absence
    ): RedirectResponse {
        $absence->delete();

        return redirect()
            ->route('absences.index')
            ->with(
                'success',
                'Absence supprimée avec succès.'
            );
    }
}