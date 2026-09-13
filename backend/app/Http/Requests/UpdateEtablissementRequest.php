<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEtablissementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $etablissement = $this->route('etablissement');

        return [

            /*
            |--------------------------------------------------------------------------
            | IDENTITÉ
            |--------------------------------------------------------------------------
            */

            'nom' => [
                'required',
                'string',
                'max:255',
            ],

            'sigle' => [
                'nullable',
                'string',
                'max:100',
            ],

            'code' => [
                'nullable',
                'digits:6',
                Rule::unique('etablissements', 'code')
                    ->ignore($etablissement),
            ],

            'type' => [
                'nullable',
                Rule::in([
                    'Public',
                    'Privé',
                    'Confessionnel',
                ]),
            ],

            /*
            |--------------------------------------------------------------------------
            | IDENTITÉ COMPLÉMENTAIRE
            |--------------------------------------------------------------------------
            */

            'devise' => [
                'nullable',
                'string',
                'max:255',
            ],

            'slogan' => [
                'nullable',
                'string',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | LOCALISATION
            |--------------------------------------------------------------------------
            */

            'adresse' => [
                'nullable',
                'string',
                'max:255',
            ],

            'quartier' => [
                'nullable',
                'string',
                'max:255',
            ],

            'commune' => [
                'nullable',
                'string',
                'max:255',
            ],

            'ville' => [
                'required',
                'string',
                'max:255',
            ],

            'region' => [
                'nullable',
                'string',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | ADMINISTRATION
            |--------------------------------------------------------------------------
            */

            'direction_regionale' => [
                'nullable',
                'string',
                'max:255',
            ],

            'inspection' => [
                'nullable',
                'string',
                'max:255',
            ],

            'academie' => [
                'nullable',
                'string',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | CONTACTS
            |--------------------------------------------------------------------------
            */

            'telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'telephone_secondaire' => [
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
                'max:255',
            ],

            'site_web' => [
                'nullable',
                'url',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | LOGO
            |--------------------------------------------------------------------------
            */

            'logo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            /*
            |--------------------------------------------------------------------------
            | STATUT
            |--------------------------------------------------------------------------
            */

            'actif' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [

            'nom.required' =>
                "Le nom complet de l'établissement est obligatoire.",

            'ville.required' =>
                "La ville de l'établissement est obligatoire.",

            'code.digits' =>
                "Le code établissement doit comporter exactement 6 chiffres.",

            'code.unique' =>
                "Ce code établissement existe déjà.",

            'email.email' =>
                "L'adresse e-mail n'est pas valide.",

            'site_web.url' =>
                "L'adresse du site web n'est pas valide.",

            'logo.image' =>
                "Le logo doit être une image.",

            'logo.max' =>
                "Le logo ne doit pas dépasser 2 Mo.",
        ];
    }
}