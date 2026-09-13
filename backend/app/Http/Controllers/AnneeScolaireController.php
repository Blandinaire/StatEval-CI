<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAnneeScolaireRequest;
use App\Models\AnneeScolaire;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnneeScolaireController extends Controller
{
    /**
     * Vérifie si l'utilisateur connecté est SuperAdmin.
     */
    private function estSuperAdmin($user): bool
    {
        return $user->hasRole('SuperAdmin');
    }


    /**
     * Afficher la liste des années scolaires.
     *
     * Accessible en consultation aux utilisateurs autorisés.
     */
    public function index()
    {
        $user = Auth::user();

        $annees = AnneeScolaire::orderByDesc('date_debut')
            ->get()
            ->map(function ($annee) {
                return [
                    'id' => $annee->id,
                    'libelle' => $annee->libelle,
                    'date_debut' =>
                        $annee->date_debut->format('d/m/Y'),
                    'date_fin' =>
                        $annee->date_fin->format('d/m/Y'),
                    'active' => $annee->active,
                ];
            });

        return Inertia::render('AnneeScolaires/Index', [
            'annees' => $annees,

            /*
            |----------------------------------------------------------
            | Permet au frontend de savoir si les boutons
            | de gestion doivent être affichés.
            |----------------------------------------------------------
            */

            'estSuperAdmin' =>
                $this->estSuperAdmin($user),
        ]);
    }


    /**
     * Afficher une année scolaire.
     *
     * Consultation autorisée.
     */
    public function show(AnneeScolaire $anneeScolaire)
    {
        $user = Auth::user();

        return Inertia::render('AnneeScolaires/Show', [
            'annee' => $anneeScolaire,

            'estSuperAdmin' =>
                $this->estSuperAdmin($user),
        ]);
    }


    /**
     * Afficher le formulaire de création.
     *
     * Exclusivement SuperAdmin.
     */
    public function create()
    {
        $user = Auth::user();

        if (!$this->estSuperAdmin($user)) {
            abort(403);
        }

        return Inertia::render(
            'AnneeScolaires/Create'
        );
    }


    /**
     * Enregistrer une nouvelle année scolaire.
     *
     * Exclusivement SuperAdmin.
     */
    public function store(StoreAnneeScolaireRequest $request)
    {
        $user = Auth::user();

        if (!$this->estSuperAdmin($user)) {
            abort(403);
        }

        $data = $request->validated();

        DB::transaction(function () use ($data) {

            /*
            |----------------------------------------------------------
            | Une seule année scolaire peut être active
            |----------------------------------------------------------
            */

            if (!empty($data['active'])) {

                AnneeScolaire::query()->update([
                    'active' => false,
                ]);
            }


            /*
            |----------------------------------------------------------
            | Création
            |----------------------------------------------------------
            */

            AnneeScolaire::create([
                'libelle' =>
                    $data['libelle'],

                'date_debut' =>
                    $data['date_debut'],

                'date_fin' =>
                    $data['date_fin'],

                'active' =>
                    !empty($data['active']),
            ]);
        });

        return redirect()
            ->route('annee-scolaires.index')
            ->with(
                'success',
                'Année scolaire créée avec succès.'
            );
    }


    /**
     * Afficher le formulaire de modification.
     *
     * Exclusivement SuperAdmin.
     */
    public function edit(AnneeScolaire $anneeScolaire)
    {
        $user = Auth::user();

        if (!$this->estSuperAdmin($user)) {
            abort(403);
        }

        return Inertia::render(
            'AnneeScolaires/Edit',
            [
                'annee' =>
                    $anneeScolaire,
            ]
        );
    }


    /**
     * Mettre à jour une année scolaire.
     *
     * Exclusivement SuperAdmin.
     */
    public function update(
        StoreAnneeScolaireRequest $request,
        AnneeScolaire $anneeScolaire
    ) {
        $user = Auth::user();

        if (!$this->estSuperAdmin($user)) {
            abort(403);
        }

        $data = $request->validated();

        DB::transaction(
            function () use (
                $data,
                $anneeScolaire
            ) {

                /*
                |------------------------------------------------------
                | Si cette année devient active,
                | désactiver toutes les autres.
                |------------------------------------------------------
                */

                if (!empty($data['active'])) {

                    AnneeScolaire::where(
                        'id',
                        '!=',
                        $anneeScolaire->id
                    )->update([
                        'active' => false,
                    ]);
                }


                /*
                |------------------------------------------------------
                | Mise à jour
                |------------------------------------------------------
                */

                $anneeScolaire->update([
                    'libelle' =>
                        $data['libelle'],

                    'date_debut' =>
                        $data['date_debut'],

                    'date_fin' =>
                        $data['date_fin'],

                    'active' =>
                        !empty($data['active']),
                ]);
            }
        );

        return redirect()
            ->route('annee-scolaires.index')
            ->with(
                'success',
                'Année scolaire modifiée avec succès.'
            );
    }


    /**
     * Supprimer une année scolaire.
     *
     * Exclusivement SuperAdmin.
     */
    public function destroy(
        AnneeScolaire $anneeScolaire
    ) {
        $user = Auth::user();

        if (!$this->estSuperAdmin($user)) {
            abort(403);
        }


        /*
        |--------------------------------------------------------------
        | Protection de l'année active
        |--------------------------------------------------------------
        */

        if ($anneeScolaire->active) {

            return redirect()
                ->back()
                ->with(
                    'error',
                    "Impossible de supprimer l'année scolaire active."
                );
        }


        /*
        |--------------------------------------------------------------
        | Suppression
        |--------------------------------------------------------------
        */

        $anneeScolaire->delete();

        return redirect()
            ->route('annee-scolaires.index')
            ->with(
                'success',
                'Année scolaire supprimée avec succès.'
            );
    }
}