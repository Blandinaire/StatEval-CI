<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEducateurRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $educateurId = $this->route('educateur');

        return [

            /*
            |--------------------------------------------------------------------------
            | Rattachement
            |--------------------------------------------------------------------------
            */

            'etablissement_id' => [
                'required',
                'integer',
                'exists:etablissements,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | Identité
            |--------------------------------------------------------------------------
            */

            'nom' => [
                'required',
                'string',
                'max:255',
            ],

            'prenoms' => [
                'required',
                'string',
                'max:255',
            ],

            'sexe' => [
                'required',
                Rule::in([
                    'Masculin',
                    'Féminin',
                ]),
            ],

            'date_naissance' => [
                'nullable',
                'date',
            ],

            'lieu_naissance' => [
                'nullable',
                'string',
                'max:255',
            ],

            'nationalite' => [
                'required',
                'string',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | Coordonnées
            |--------------------------------------------------------------------------
            */

            'telephone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('educateurs', 'email')
                    ->ignore($educateurId),
            ],

            'adresse' => [
                'nullable',
                'string',
                'max:500',
            ],

            'photo' => [
                'nullable',
                'string',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | Situation professionnelle
            |--------------------------------------------------------------------------
            */

            'matricule' => [
                'required',
                'string',
                'max:255',
                Rule::unique('educateurs', 'matricule')
                    ->ignore($educateurId),
            ],

            'type' => [
                'required',
                Rule::in([
                    'Permanent',
                    'Contractuel',
                ]),
            ],

            'grade' => [
                'nullable',
                'string',
                'max:255',
            ],

            'diplome' => [
                'nullable',
                'string',
                'max:255',
            ],

            'date_embauche' => [
                'nullable',
                'date',
            ],

            'date_prise_service' => [
                'nullable',
                'date',
            ],

            'statut' => [
                'required',
                Rule::in([
                    'Actif',
                    'Suspendu',
                    'Retraité',
                ]),
            ],

            'actif' => [
                'required',
                'boolean',
            ],
        ];
    }
}