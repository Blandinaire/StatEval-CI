<?php

namespace App\Http\Controllers;

use App\Models\Etablissement;
use App\Models\EtablissementResponsable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EtablissementResponsableController extends Controller
{
    /**
     * Vérifie que l'utilisateur peut gérer
     * les responsables de cet établissement.
     */
    private function verifierAccesEtablissement(
        Etablissement $etablissement
    ): void {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------
        |
        | Le SuperAdmin peut gérer les responsables
        | de tous les établissements.
        |
        */

        if ($user->hasRole('SuperAdmin')) {
            return;
        }

        /*
        |--------------------------------------------------------------
        | UTILISATEUR D'ÉTABLISSEMENT
        |--------------------------------------------------------------
        */

        if (
            !$user->etablissement_id ||
            (int) $user->etablissement_id !==
            (int) $etablissement->id
        ) {
            abort(403);
        }
    }
    /**
     * Liste des responsables.
     */
    public function index(Etablissement $etablissement)
    {
        $this->verifierAccesEtablissement($etablissement);

        $responsables = $etablissement
            ->responsables()
            ->orderByDesc('principal')
            ->orderByDesc('actif')
            ->orderBy('fonction')
            ->get()
            ->map(function ($responsable) {

                return [
                    'id' => $responsable->id,

                    'civilite' => $responsable->civilite,

                    'nom' => $responsable->nom,

                    'prenoms' => $responsable->prenoms,

                    'nom_complet' => $responsable->nom_complet,

                    'fonction' => $responsable->fonction,

                    'telephone' => $responsable->telephone,

                    'whatsapp' => $responsable->whatsapp,

                    'email' => $responsable->email,

                    'actif' => $responsable->actif,

                    'principal' => $responsable->principal,
                ];
            });

        return Inertia::render(
            'Etablissements/Responsables/Index',
            [
                'etablissement' => [
                    'id' => $etablissement->id,
                    'nom' => $etablissement->nom,
                    'code' => $etablissement->code,
                ],

                'responsables' => $responsables,
            ]
        );
    }

    /**
     * Formulaire de création.
     */
    public function create(Etablissement $etablissement)
    {
        $this->verifierAccesEtablissement($etablissement);

        return Inertia::render(
            'Etablissements/Responsables/Create',
            [
                'etablissement' => [
                    'id' => $etablissement->id,
                    'nom' => $etablissement->nom,
                ],
            ]
        );
    }
    /**
     * Enregistrer un responsable.
     */
    public function store(
        Request $request,
        Etablissement $etablissement
    ) {
        $this->verifierAccesEtablissement($etablissement);
        $data = $request->validate([

            'civilite' => [
                'nullable',
                'string',
                'max:20',
            ],

            'nom' => [
                'required',
                'string',
                'max:100',
            ],

            'prenoms' => [
                'required',
                'string',
                'max:150',
            ],

            'fonction' => [
                'required',
                'string',
                'max:150',
            ],

            'telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'whatsapp' => [
                'nullable',
                'string',
                'max:30',
            ],

            'email' => [
                'nullable',
                'email',
                'max:150',
            ],

            'actif' => [
                'boolean',
            ],

            'principal' => [
                'boolean',
            ],
        ]);

        /*
        |------------------------------------------------------------------
        | Un seul responsable principal
        |------------------------------------------------------------------
        */

        if (!empty($data['principal'])) {

            $etablissement
                ->responsables()
                ->update([
                    'principal' => false,
                ]);
        }

        $etablissement
            ->responsables()
            ->create([

                'civilite' => $data['civilite'] ?? null,

                'nom' => $data['nom'],

                'prenoms' => $data['prenoms'],

                'fonction' => $data['fonction'],

                'telephone' => $data['telephone'] ?? null,

                'whatsapp' => $data['whatsapp'] ?? null,

                'email' => $data['email'] ?? null,

                'actif' => !empty($data['actif']),

                'principal' => !empty($data['principal']),
            ]);

        return redirect()
            ->route(
                'etablissements.responsables.index',
                $etablissement->id
            )
            ->with(
                'success',
                'Responsable ajouté avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(
        Etablissement $etablissement,
        EtablissementResponsable $responsable
    ) {
        $this->verifierAccesEtablissement($etablissement);

        if (
            (int) $responsable->etablissement_id !==
            (int) $etablissement->id
        ) {
            abort(404);
        }

        return Inertia::render(
            'Etablissements/Responsables/Edit',
            [
                'etablissement' => [
                    'id' => $etablissement->id,
                    'nom' => $etablissement->nom,
                ],

                'responsable' => $responsable,
            ]
        );
    }

    /**
     * Mettre à jour un responsable.
     */
    public function update(
        Request $request,
        Etablissement $etablissement,
        EtablissementResponsable $responsable
    ) {
        $this->verifierAccesEtablissement($etablissement);

        if (
            (int) $responsable->etablissement_id !==
            (int) $etablissement->id
        ) {
            abort(404);
        }
        $data = $request->validate([

            'civilite' => [
                'nullable',
                'string',
                'max:20',
            ],

            'nom' => [
                'required',
                'string',
                'max:100',
            ],

            'prenoms' => [
                'required',
                'string',
                'max:150',
            ],

            'fonction' => [
                'required',
                'string',
                'max:150',
            ],

            'telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'whatsapp' => [
                'nullable',
                'string',
                'max:30',
            ],

            'email' => [
                'nullable',
                'email',
                'max:150',
            ],

            'actif' => [
                'boolean',
            ],

            'principal' => [
                'boolean',
            ],
        ]);

        /*
        |------------------------------------------------------------------
        | Un seul responsable principal
        |------------------------------------------------------------------
        */

        if (!empty($data['principal'])) {

            $etablissement
                ->responsables()
                ->where(
                    'id',
                    '!=',
                    $responsable->id
                )
                ->update([
                    'principal' => false,
                ]);
        }

        $responsable->update([

            'civilite' => $data['civilite'] ?? null,

            'nom' => $data['nom'],

            'prenoms' => $data['prenoms'],

            'fonction' => $data['fonction'],

            'telephone' => $data['telephone'] ?? null,

            'whatsapp' => $data['whatsapp'] ?? null,

            'email' => $data['email'] ?? null,

            'actif' => !empty($data['actif']),

            'principal' => !empty($data['principal']),
        ]);

        return redirect()
            ->route(
                'etablissements.responsables.index',
                $etablissement->id
            )
            ->with(
                'success',
                'Responsable modifié avec succès.'
            );
    }

    /**
     * Supprimer un responsable.
     */
    public function destroy(
        Etablissement $etablissement,
        EtablissementResponsable $responsable
    ) {
        $this->verifierAccesEtablissement($etablissement);

        if (
            (int) $responsable->etablissement_id !==
            (int) $etablissement->id
        ) {
            abort(404);
        }

        $responsable->delete();

        return redirect()
            ->back()
            ->with(
                'success',
                'Responsable supprimé avec succès.'
            );
    }
}
