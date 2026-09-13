<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMatiereRequest;
use App\Models\Matiere;
use Inertia\Inertia;

class MatiereController extends Controller
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
     * Liste des matières.
     *
     * Accessible aux utilisateurs autorisés.
     */
    public function index()
    {
        $matieres = Matiere::with('parent')
            ->orderBy('libelle')
            ->get();

        return Inertia::render('Matieres/Index', [
            'matieres' => $matieres,
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

        return Inertia::render('Matieres/Create', [
            'matieresParents' => Matiere::whereNull('matiere_parent_id')
                ->orderBy('libelle')
                ->get(['id', 'libelle']),
        ]);
    }

    /**
     * Enregistrement.
     *
     * SuperAdmin uniquement.
     */
    public function store(StoreMatiereRequest $request)
    {
        $this->verifierSuperAdmin();

        Matiere::create(
            $request->validated()
        );

        return redirect()
            ->route('matieres.index')
            ->with(
                'success',
                'Matière créée avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     *
     * SuperAdmin uniquement.
     */
    public function edit(Matiere $matiere)
    {
        $this->verifierSuperAdmin();

        return Inertia::render('Matieres/Edit', [
            'matiere' => $matiere,
            'matieresParents' => Matiere::whereNull('matiere_parent_id')
                ->where('id', '!=', $matiere->id)
                ->orderBy('libelle')
                ->get(['id', 'libelle']),
        ]);
    }

    /**
     * Mise à jour.
     *
     * SuperAdmin uniquement.
     */
    public function update(
        StoreMatiereRequest $request,
        Matiere $matiere
    ) {
        $this->verifierSuperAdmin();

        $rules = $request->rules();

        /*
        |------------------------------------------------------------------
        | Le code doit rester unique,
        | sauf pour la matière actuellement modifiée.
        |------------------------------------------------------------------
        */

        $rules['code'] =
            'required|string|max:20|unique:matieres,code,' .
            $matiere->id;

        $data = $request->validate($rules);

        $matiere->update($data);

        return redirect()
            ->route('matieres.index')
            ->with(
                'success',
                'Matière modifiée avec succès.'
            );
    }

    /**
     * Suppression.
     *
     * SuperAdmin uniquement.
     */
    public function destroy(Matiere $matiere)
    {
        $this->verifierSuperAdmin();

        $matiere->delete();

        return redirect()
            ->route('matieres.index')
            ->with(
                'success',
                'Matière supprimée avec succès.'
            );
    }
}
