<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateElevesBulkRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation pour la modification groupée.
     *
     * Chaque élève peut ne modifier qu'une partie de ses informations.
     */
    public function rules(): array
    {
        return [

            /*
            |--------------------------------------------------------------------------
            | ÉLÈVES
            |--------------------------------------------------------------------------
            */

            'eleves' => [
                'required',
                'array',
                'min:1',
            ],

            'eleves.*.id' => [
                'required',
                'integer',
                'exists:eleves,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | ÉTABLISSEMENT ET SCOLARITÉ
            |--------------------------------------------------------------------------
            */

            'eleves.*.etablissement_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:etablissements,id',
            ],

            'eleves.*.annee_scolaire_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:annee_scolaires,id',
            ],

            'eleves.*.classe_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:classes,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | IDENTIFICATION
            |--------------------------------------------------------------------------
            */

            'eleves.*.matricule' => [
                'sometimes',
                'nullable',
                'string',
                'regex:/^[0-9]{8}[A-Z]$/',
            ],

            'eleves.*.nom' => [
                'sometimes',
                'string',
                'max:100',
            ],

            'eleves.*.prenoms' => [
                'sometimes',
                'string',
                'max:150',
            ],

            'eleves.*.sexe' => [
                'sometimes',
                'in:Masculin,Féminin',
            ],

            'eleves.*.date_naissance' => [
                'sometimes',
                'nullable',
                'date',
                'before:today',
            ],

            'eleves.*.lieu_naissance' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'eleves.*.nationalite' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            /*
            |--------------------------------------------------------------------------
            | COORDONNÉES
            |--------------------------------------------------------------------------
            */

            'eleves.*.adresse' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'eleves.*.telephone' => [
                'sometimes',
                'nullable',
                'string',
                'max:30',
            ],

            'eleves.*.email' => [
                'sometimes',
                'nullable',
                'email',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | SITUATION SCOLAIRE
            |--------------------------------------------------------------------------
            */

            'eleves.*.redoublant' => [
                'sometimes',
                'nullable',
                'boolean',
            ],

            'eleves.*.boursier' => [
                'sometimes',
                'nullable',
                'boolean',
            ],

            'eleves.*.regime' => [
                'sometimes',
                'in:Externe,Demi-pensionnaire,Interne',
            ],

            'eleves.*.statut' => [
                'sometimes',
                'in:Actif,Transféré,Exclu,Abandonné,Diplômé',
            ],

            'eleves.*.statut_affectation' => [
                'sometimes',
                'in:AFFECTÉ,NON AFFECTÉ',
            ],

            /*
            |--------------------------------------------------------------------------
            | PÈRE
            |--------------------------------------------------------------------------
            */

            'eleves.*.pere_nom' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'eleves.*.pere_prenoms' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'eleves.*.pere_telephone' => [
                'sometimes',
                'nullable',
                'string',
                'max:30',
            ],

            'eleves.*.pere_email' => [
                'sometimes',
                'nullable',
                'email',
                'max:255',
            ],

            'eleves.*.pere_profession' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'eleves.*.pere_adresse' => [
                'sometimes',
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | MÈRE
            |--------------------------------------------------------------------------
            */

            'eleves.*.mere_nom' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'eleves.*.mere_prenoms' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'eleves.*.mere_telephone' => [
                'sometimes',
                'nullable',
                'string',
                'max:30',
            ],

            'eleves.*.mere_email' => [
                'sometimes',
                'nullable',
                'email',
                'max:255',
            ],

            'eleves.*.mere_profession' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'eleves.*.mere_adresse' => [
                'sometimes',
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | TUTEUR
            |--------------------------------------------------------------------------
            */

            'eleves.*.type_tuteur' => [
                'sometimes',
                'in:Père,Mère,Autre',
            ],

            'eleves.*.tuteur_nom' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'eleves.*.tuteur_prenoms' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'eleves.*.tuteur_telephone' => [
                'sometimes',
                'nullable',
                'string',
                'max:30',
            ],

            'eleves.*.tuteur_email' => [
                'sometimes',
                'nullable',
                'email',
                'max:255',
            ],

            'eleves.*.tuteur_profession' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'eleves.*.tuteur_adresse' => [
                'sometimes',
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | INFORMATIONS MÉDICALES
            |--------------------------------------------------------------------------
            */

            'eleves.*.groupe_sanguin' => [
                'sometimes',
                'nullable',
                'in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            ],

            'eleves.*.allergies' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'eleves.*.observations_medicales' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'eleves.*.contact_urgence_nom' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'eleves.*.contact_urgence_telephone' => [
                'sometimes',
                'nullable',
                'string',
                'max:30',
            ],

            /*
            |--------------------------------------------------------------------------
            | STATUT SYSTÈME
            |--------------------------------------------------------------------------
            */

            'eleves.*.actif' => [
                'sometimes',
                'nullable',
                'boolean',
            ],
        ];
    }

    /**
     * Messages personnalisés.
     */
    public function messages(): array
    {
        return [

            'eleves.required' =>
                'Aucun élève n’a été sélectionné.',

            'eleves.min' =>
                'Veuillez sélectionner au moins un élève.',

            'eleves.*.id.required' =>
                'L’identifiant de l’élève est obligatoire.',

            'eleves.*.id.exists' =>
                'Un des élèves sélectionnés n’existe pas.',

            'eleves.*.matricule.regex' =>
                'Le matricule doit contenir 8 chiffres suivis d’une lettre majuscule.',

            'eleves.*.email.email' =>
                'Veuillez saisir une adresse e-mail valide.',

            'eleves.*.pere_email.email' =>
                'Veuillez saisir une adresse e-mail valide pour le Père.',

            'eleves.*.mere_email.email' =>
                'Veuillez saisir une adresse e-mail valide pour la Mère.',

            'eleves.*.tuteur_email.email' =>
                'Veuillez saisir une adresse e-mail valide pour le tuteur légal.',

            'eleves.*.date_naissance.before' =>
                'La date de naissance doit être antérieure à aujourd’hui.',
        ];
    }
}