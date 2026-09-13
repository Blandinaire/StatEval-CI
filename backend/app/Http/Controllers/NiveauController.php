<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNiveauRequest;
use App\Models\Niveau;
use Inertia\Inertia;

class NiveauController extends Controller
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
     * Afficher la liste des niveaux.
     *
     * Accessible aux utilisateurs autorisés.
     */
    public function index()
    {
        $niveaux = Niveau::orderBy('ordre')->get();

        return Inertia::render('Niveaux/Index', [
            'niveaux' => $niveaux,
        ]);
    }

    /**
     * Afficher le formulaire de création.
     *
     * SuperAdmin uniquement.
     */
    public function create()
    {
        $this->verifierSuperAdmin();

        return Inertia::render('Niveaux/Create');
    }

    /**
     * Enregistrer un niveau.
     *
     * SuperAdmin uniquement.
     */
    public function store(StoreNiveauRequest $request)
    {
        $this->verifierSuperAdmin();

        Niveau::create(
            $request->validated()
        );

        return redirect()
            ->route('niveaux.index')
            ->with(
                'success',
                'Niveau créé avec succès.'
            );
    }

    /**
     * Afficher le formulaire de modification.
     *
     * SuperAdmin uniquement.
     */
    public function edit(Niveau $niveau)
    {
        $this->verifierSuperAdmin();

        return Inertia::render('Niveaux/Edit', [
            'niveau' => $niveau,
        ]);
    }

    /**
     * Mettre à jour un niveau.
     *
     * SuperAdmin uniquement.
     */
    public function update(
        StoreNiveauRequest $request,
        Niveau $niveau
    ) {
        $this->verifierSuperAdmin();

        $niveau->update(
            $request->validated()
        );

        return redirect()
            ->route('niveaux.index')
            ->with(
                'success',
                'Niveau modifié avec succès.'
            );
    }

    /**
     * Supprimer un niveau.
     *
     * SuperAdmin uniquement.
     */
    public function destroy(Niveau $niveau)
    {
        $this->verifierSuperAdmin();

        $niveau->delete();

        return redirect()
            ->route('niveaux.index')
            ->with(
                'success',
                'Niveau supprimé avec succès.'
            );
    }
}