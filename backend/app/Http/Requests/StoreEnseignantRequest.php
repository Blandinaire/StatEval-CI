<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnseignantRequest extends FormRequest
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

            'etablissement_id' => [
                'required',
                'exists:etablissements,id',
            ],

            'matiere_principale_id' => [
                'nullable',
                'exists:matieres,id',
            ],

            'matiere_secondaire_id' => [
                'nullable',
                'exists:matieres,id',
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

            'adresse' => [
                'nullable',
                'string',
            ],

            'photo' => [
                'nullable',
                'string',
            ],

            'matricule' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('enseignants', 'matricule')
                    ->ignore($this->route('enseignant')),
            ],

            'matricule_fonction_publique' => [
                'nullable',
                'string',
                'max:50',
            ],

            'type' => [
                'required',
                'in:Permanent,Vacataire,Contractuel',
            ],

            'grade' => [
                'nullable',
                'string',
                'max:100',
            ],

            'diplome' => [
                'nullable',
                'string',
                'max:150',
            ],

            'date_embauche' => [
                'nullable',
                'date',
            ],

            'date_prise_service' => [
                'nullable',
                'date',
            ],

            'volume_horaire' => [
                'required',
                'integer',
                'min:0',
            ],

            'nb_classes_max' => [
                'required',
                'integer',
                'min:1',
            ],

            'statut' => [
                'required',
                'in:Actif,Suspendu,Retraité',
            ],

            'actif' => [
                'boolean',
            ],

        ];
    }
}
