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
            | ÉTABLISSEMENT ET SCOLARITÉ
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
            | IDENTIFICATION DE L'ÉLÈVE
            |--------------------------------------------------------------------------
            */

            'matricule' => [
                'nullable',
                'string',
                'regex:/^[0-9]{8}[A-Z]$/',
                Rule::unique('eleves', 'matricule')
                    ->ignore($this->route('eleve')),
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
                'before:today',
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
            | COORDONNÉES
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
            | SITUATION SCOLAIRE
            |--------------------------------------------------------------------------
            */

            'redoublant' => [
                'nullable',
                'boolean',
            ],

            'boursier' => [
                'nullable',
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

            'statut_affectation' => [
                'required',
                'in:AFFECTÉ,NON AFFECTÉ',
            ],

            /*
            |--------------------------------------------------------------------------
            | PÈRE
            |--------------------------------------------------------------------------
            */

            'pere_nom' => [
                'nullable',
                'string',
                'max:100',
            ],

            'pere_prenoms' => [
                'nullable',
                'string',
                'max:150',
            ],

            'pere_telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'pere_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'pere_profession' => [
                'nullable',
                'string',
                'max:150',
            ],

            'pere_adresse' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | MÈRE
            |--------------------------------------------------------------------------
            */

            'mere_nom' => [
                'nullable',
                'string',
                'max:100',
            ],

            'mere_prenoms' => [
                'nullable',
                'string',
                'max:150',
            ],

            'mere_telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'mere_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'mere_profession' => [
                'nullable',
                'string',
                'max:150',
            ],

            'mere_adresse' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | TUTEUR LÉGAL
            |--------------------------------------------------------------------------
            |
            | Le formulaire utilise type_tuteur :
            | Père / Mère / Autre
            |
            */

            'type_tuteur' => [
                'required',
                'in:Père,Mère,Autre',
            ],

            /*
            |--------------------------------------------------------------------------
            | AUTRE TUTEUR
            |--------------------------------------------------------------------------
            */

            'tuteur_nom' => [
                'nullable',
                'required_if:type_tuteur,Autre',
                'string',
                'max:100',
            ],

            'tuteur_prenoms' => [
                'nullable',
                'required_if:type_tuteur,Autre',
                'string',
                'max:150',
            ],

            'tuteur_telephone' => [
                'nullable',
                'required_if:type_tuteur,Autre',
                'string',
                'max:30',
            ],

            'tuteur_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'tuteur_profession' => [
                'nullable',
                'string',
                'max:150',
            ],

            'tuteur_adresse' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | RESPONSABLE LÉGAL
            |--------------------------------------------------------------------------
            |
            | Ces champs sont générés automatiquement par le contrôleur.
            |
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
            | INFORMATIONS MÉDICALES
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
            | STATUT SYSTÈME
            |--------------------------------------------------------------------------
            */

            'actif' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    /**
     * Validation complémentaire.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            /*
            |--------------------------------------------------------------------------
            | Père
            |--------------------------------------------------------------------------
            */

            if (
                $this->type_tuteur === 'Père' &&
                empty($this->pere_nom)
            ) {
                $validator->errors()->add(
                    'pere_nom',
                    "Le nom du Père est obligatoire puisqu'il est le tuteur légal."
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Mère
            |--------------------------------------------------------------------------
            */

            if (
                $this->type_tuteur === 'Mère' &&
                empty($this->mere_nom)
            ) {
                $validator->errors()->add(
                    'mere_nom',
                    "Le nom de la Mère est obligatoire puisqu'elle est la tutrice légale."
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Autre tuteur
            |--------------------------------------------------------------------------
            */

            if (
                $this->type_tuteur === 'Autre' &&
                empty($this->tuteur_nom)
            ) {
                $validator->errors()->add(
                    'tuteur_nom',
                    "Le nom du tuteur légal est obligatoire."
                );
            }

            if (
                $this->type_tuteur === 'Autre' &&
                empty($this->tuteur_prenoms)
            ) {
                $validator->errors()->add(
                    'tuteur_prenoms',
                    "Les prénoms du tuteur légal sont obligatoires."
                );
            }

            if (
                $this->type_tuteur === 'Autre' &&
                empty($this->tuteur_telephone)
            ) {
                $validator->errors()->add(
                    'tuteur_telephone',
                    "Le numéro de téléphone du tuteur légal est obligatoire."
                );
            }
        });
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [

            'matricule.regex' =>
                'Le matricule doit contenir 8 chiffres suivis d’une lettre majuscule.',

            'matricule.unique' =>
                'Ce matricule est déjà attribué à un autre élève.',

            'date_naissance.before' =>
                'La date de naissance doit être antérieure à aujourd’hui.',

            'statut_affectation.required' =>
                'Le statut d’affectation est obligatoire.',

            'statut_affectation.in' =>
                'Le statut d’affectation doit être AFFECTÉ ou NON AFFECTÉ.',

            'type_tuteur.required' =>
                'Veuillez sélectionner le tuteur légal de l’élève.',

            'type_tuteur.in' =>
                'Le tuteur légal doit être le Père, la Mère ou une autre personne.',

            'tuteur_nom.required_if' =>
                'Le nom du tuteur est obligatoire lorsque vous sélectionnez AUTRE.',

            'tuteur_prenoms.required_if' =>
                'Les prénoms du tuteur sont obligatoires lorsque vous sélectionnez AUTRE.',

            'tuteur_telephone.required_if' =>
                'Le numéro de téléphone du tuteur est obligatoire lorsque vous sélectionnez AUTRE.',

            'email.email' =>
                'Veuillez saisir une adresse e-mail valide.',

            'pere_email.email' =>
                'Veuillez saisir une adresse e-mail valide pour le Père.',

            'mere_email.email' =>
                'Veuillez saisir une adresse e-mail valide pour la Mère.',

            'tuteur_email.email' =>
                'Veuillez saisir une adresse e-mail valide pour le tuteur légal.',
        ];
    }
}