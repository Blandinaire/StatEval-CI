<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEtablissementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            /*
            |--------------------------------------------------------------------------
            | Informations générales
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
                'string',
                'size:6',
                'unique:etablissements,code',
            ],

            'type' => [
                'nullable',
                'in:Public,Privé,Confessionnel',
            ],

            /*
            |--------------------------------------------------------------------------
            | Identité
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
            | Localisation
            |--------------------------------------------------------------------------
            */

            'adresse' => [
                'nullable',
                'string',
                'max:255',
            ],

            'commune' => [
                'nullable',
                'string',
                'max:150',
            ],

            'ville' => [
                'required',
                'string',
                'max:150',
            ],

            'quartier' => [
                'nullable',
                'string',
                'max:150',
            ],

            'region' => [
                'nullable',
                'string',
                'max:150',
            ],

            /*
            |--------------------------------------------------------------------------
            | Administration éducative
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
            | Contacts
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
            | Logo
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
            | Statut
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
                "La ville est obligatoire.",

            'code.size' =>
                "Le code établissement doit comporter exactement 6 chiffres.",

            'code.unique' =>
                "Ce code établissement existe déjà.",

            'email.email' =>
                "L'adresse e-mail n'est pas valide.",

            'site_web.url' =>
                "L'adresse du site internet n'est pas valide.",

            'logo.image' =>
                "Le logo doit être une image.",

            'logo.max' =>
                "Le logo ne doit pas dépasser 2 Mo.",
        ];
    }
}