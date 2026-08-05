<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMatiereRequest;
use App\Models\Matiere;
use Inertia\Inertia;

class MatiereController extends Controller
{
    public function index()
    {
        $matieres = Matiere::orderBy('libelle')->get();

        return Inertia::render('Matieres/Index', [
            'matieres' => $matieres,
        ]);
    }

    public function create()
    {
        return Inertia::render('Matieres/Create');
    }

    public function store(StoreMatiereRequest $request)
    {
        Matiere::create($request->validated());

        return redirect()
            ->route('matieres.index')
            ->with('success', 'Matière créée avec succès.');
    }

    public function edit(Matiere $matiere)
    {
        return Inertia::render('Matieres/Edit', [
            'matiere' => $matiere,
        ]);
    }

    public function update(StoreMatiereRequest $request, Matiere $matiere)
    {
        $rules = $request->rules();

        $rules['code'] =
            'required|string|max:20|unique:matieres,code,' . $matiere->id;

        $data = $request->validate($rules);

        $matiere->update($data);

        return redirect()
            ->route('matieres.index')
            ->with('success', 'Matière modifiée avec succès.');
    }

    public function destroy(Matiere $matiere)
    {
        $matiere->delete();

        return redirect()
            ->route('matieres.index')
            ->with('success', 'Matière supprimée avec succès.');
    }
}