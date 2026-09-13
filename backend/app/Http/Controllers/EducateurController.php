<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEducateurRequest;
use App\Models\Educateur;
use App\Models\Etablissement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EducateurController extends Controller
{
    /**
     * Liste des éducateurs.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if ($isSuperAdmin) {

            $etablissementId =
                $request->input('etablissement_id');
        } else {

            $etablissementId =
                $user->etablissement_id;
        }


        /*
        |--------------------------------------------------------------------------
        | REQUÊTE ÉDUCATEURS
        |--------------------------------------------------------------------------
        */

        $query = Educateur::query()
            ->with('etablissement')
            ->orderBy('nom')
            ->orderBy('prenoms');


        if ($etablissementId) {

            $query->where(
                'etablissement_id',
                $etablissementId
            );
        }


        $educateurs = $query->get();


        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENTS
        |--------------------------------------------------------------------------
        */

        $etablissements = $isSuperAdmin

            ? Etablissement::query()
            ->orderBy('nom')
            ->get([
                'id',
                'nom',
            ])

            : [];


        return Inertia::render(
            'Educateurs/Index',
            [

                'educateurs' =>
                $educateurs,

                'etablissements' =>
                $etablissements,

                'etablissementSelectionne' =>
                $etablissementId
                    ? (int) $etablissementId
                    : null,

                'isSuperAdmin' =>
                $isSuperAdmin,
            ]
        );
    }


    /**
     * Formulaire de création.
     */
    public function create(): Response
    {
        $user = Auth::user();

        $isSuperAdmin =
            $user->hasRole('SuperAdmin');


        return Inertia::render(
            'Educateurs/Create',
            [

                'etablissements' =>
                $isSuperAdmin
                    ? Etablissement::query()
                    ->orderBy('nom')
                    ->get([
                        'id',
                        'nom',
                    ])
                    : [],

                'etablissementId' =>
                $isSuperAdmin
                    ? null
                    : $user->etablissement_id,

                'isSuperAdmin' =>
                $isSuperAdmin,
            ]
        );
    }


    /**
     * Enregistrement d'un éducateur.
     */
    public function store(
        StoreEducateurRequest $request
    ): RedirectResponse {

        /*
    |--------------------------------------------------------------------------
    | DONNÉES VALIDÉES
    |--------------------------------------------------------------------------
    */

        $data = $request->validated();


        /*
    |--------------------------------------------------------------------------
    | UTILISATEUR CONNECTÉ
    |--------------------------------------------------------------------------
    */

        $user = Auth::user();

        $isSuperAdmin =
            $user->hasRole('SuperAdmin');


        /*
    |--------------------------------------------------------------------------
    | ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    */

        if (!$isSuperAdmin) {

            $data['etablissement_id'] =
                $user->etablissement_id;
        }


        /*
    |--------------------------------------------------------------------------
    | GÉNÉRATION AUTOMATIQUE DU MATRICULE
    |--------------------------------------------------------------------------
    */

        $dernierId =
            Educateur::max('id') ?? 0;


        $prochainNumero =
            $dernierId + 1;


        $data['matricule'] =
            'EDU-' .
            str_pad(
                $prochainNumero,
                5,
                '0',
                STR_PAD_LEFT
            );


        /*
    |--------------------------------------------------------------------------
    | CRÉATION
    |--------------------------------------------------------------------------
    */

        Educateur::create($data);


        /*
    |--------------------------------------------------------------------------
    | REDIRECTION
    |--------------------------------------------------------------------------
    */

        return redirect()
            ->route('educateurs.index')
            ->with(
                'success',
                'Éducateur créé avec succès.'
            );
    }


    /**
     * Affichage d'un éducateur.
     */
    public function show(
        Educateur $educateur
    ): Response {

        $user = Auth::user();

        $isSuperAdmin =
            $user->hasRole('SuperAdmin');


        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (
            !$isSuperAdmin &&
            $educateur->etablissement_id !==
            $user->etablissement_id
        ) {
            abort(403);
        }


        $educateur->load(
            'etablissement'
        );


        return Inertia::render(
            'Educateurs/Show',
            [

                'educateur' =>
                $educateur,
            ]
        );
    }


    /**
     * Formulaire de modification.
     */
    public function edit(
        Educateur $educateur
    ): Response {

        $user = Auth::user();

        $isSuperAdmin =
            $user->hasRole('SuperAdmin');


        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (
            !$isSuperAdmin &&
            $educateur->etablissement_id !==
            $user->etablissement_id
        ) {
            abort(403);
        }


        return Inertia::render(
            'Educateurs/Edit',
            [

                'educateur' =>
                $educateur,

                'etablissements' =>
                $isSuperAdmin
                    ? Etablissement::query()
                    ->orderBy('nom')
                    ->get([
                        'id',
                        'nom',
                    ])
                    : [],

                'isSuperAdmin' =>
                $isSuperAdmin,
            ]
        );
    }


    /**
     * Mise à jour d'un éducateur.
     */
    public function update(
        StoreEducateurRequest $request,
        Educateur $educateur
    ): RedirectResponse {

        $user = Auth::user();

        $isSuperAdmin =
            $user->hasRole('SuperAdmin');


        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (
            !$isSuperAdmin &&
            $educateur->etablissement_id !==
            $user->etablissement_id
        ) {
            abort(403);
        }


        /*
        |--------------------------------------------------------------------------
        | DONNÉES VALIDÉES
        |--------------------------------------------------------------------------
        */

        $data =
            $request->validated();


        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (!$isSuperAdmin) {

            $data['etablissement_id'] =
                $user->etablissement_id;
        }


        /*
        |--------------------------------------------------------------------------
        | LE MATRICULE NE DOIT PAS ÊTRE MODIFIÉ
        |--------------------------------------------------------------------------
        */

        unset(
            $data['matricule']
        );


        /*
        |--------------------------------------------------------------------------
        | MISE À JOUR
        |--------------------------------------------------------------------------
        */

        $educateur->update(
            $data
        );


        return redirect()
            ->route('educateurs.index')
            ->with(
                'success',
                'Éducateur modifié avec succès.'
            );
    }


    /**
     * Suppression d'un éducateur.
     */
    public function destroy(
        Educateur $educateur
    ): RedirectResponse {

        $user = Auth::user();

        $isSuperAdmin =
            $user->hasRole('SuperAdmin');


        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (
            !$isSuperAdmin &&
            $educateur->etablissement_id !==
            $user->etablissement_id
        ) {
            abort(403);
        }


        /*
        |--------------------------------------------------------------------------
        | SUPPRESSION
        |--------------------------------------------------------------------------
        */

        $educateur->delete();


        return redirect()
            ->route('educateurs.index')
            ->with(
                'success',
                'Éducateur supprimé avec succès.'
            );
    }
}
