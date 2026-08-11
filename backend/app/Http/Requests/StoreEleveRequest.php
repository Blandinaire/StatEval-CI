<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEleveRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation.
     */
    public function rules(): array
    {
        return [

            /*
            |--------------------------------------------------------------------------
            | Établissement et scolarité
            |--------------------------------------------------------------------------
            */

            'etablissement_id' => [
                'required',
                'exists:etablissements,id',
            ],

            'annee_scolaire_id' => [
                'required',
                'exists:annee_scolaires,id',
            ],

            'classe_id' => [
                'required',
                'exists:classes,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | Identification
            |--------------------------------------------------------------------------
            */

            'matricule' => [
                'nullable',
                'string',
                'regex:/^[0-9]{8}[A-Z]$/',
                Rule::unique('eleves', 'matricule')->ignore($this->route('eleve')),
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

            'sexe' => [
                'required',
                'in:Masculin,Féminin',
            ],

            'date_naissance' => [
                'nullable',
                'date',
            ],

            'lieu_naissance' => [
                'nullable',
                'string',
                'max:150',
            ],

            'nationalite' => [
                'nullable',
                'string',
                'max:100',
            ],

            'photo' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Informations complémentaires
            |--------------------------------------------------------------------------
            */

            'adresse' => [
                'nullable',
                'string',
            ],

            'telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | Situation scolaire
            |--------------------------------------------------------------------------
            */

            'redoublant' => [
                'boolean',
            ],

            'boursier' => [
                'boolean',
            ],

            'regime' => [
                'required',
                'in:Externe,Demi-pensionnaire,Interne',
            ],

            'statut' => [
                'required',
                'in:Actif,Transféré,Exclu,Abandonné,Diplômé',
            ],

            /*
            |--------------------------------------------------------------------------
            | Responsable légal
            |--------------------------------------------------------------------------
            */

            'responsable_nom' => [
                'nullable',
                'string',
                'max:100',
            ],

            'responsable_prenoms' => [
                'nullable',
                'string',
                'max:150',
            ],

            'responsable_telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'responsable_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'responsable_profession' => [
                'nullable',
                'string',
                'max:150',
            ],

            'responsable_adresse' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Informations médicales
            |--------------------------------------------------------------------------
            */

            'groupe_sanguin' => [
                'nullable',
                'in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            ],

            'allergies' => [
                'nullable',
                'string',
            ],

            'observations_medicales' => [
                'nullable',
                'string',
            ],

            'contact_urgence_nom' => [
                'nullable',
                'string',
                'max:150',
            ],

            'contact_urgence_telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            /*
            |--------------------------------------------------------------------------
            | Statut système
            |--------------------------------------------------------------------------
            */

            'actif' => [
                'boolean',
            ],
        ];
    }
}
