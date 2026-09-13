<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAffectationRequest extends FormRequest
{
    /**
     * Autorisation.
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
        $affectation = $this->route('affectation');

        return [

            /*
            |--------------------------------------------------------------------------
            | Établissement
            |--------------------------------------------------------------------------
            */

            'etablissement_id' => [
                'required',
                'exists:etablissements,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | Année scolaire
            |--------------------------------------------------------------------------
            |
            | Les années scolaires sont actuellement globales.
            | La table annee_scolaires ne contient PAS etablissement_id.
            |
            */

            'annee_scolaire_id' => [
                'required',
                'exists:annee_scolaires,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | Classe
            |--------------------------------------------------------------------------
            */

            'classe_id' => [
                'required',
                'exists:classes,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | Matière
            |--------------------------------------------------------------------------
            */

            'matiere_id' => [

                'required',

                'exists:matieres,id',

                Rule::unique('affectations')
                    ->where(function ($query) {

                        $query
                            ->where(
                                'etablissement_id',
                                $this->etablissement_id
                            )
                            ->where(
                                'annee_scolaire_id',
                                $this->annee_scolaire_id
                            )
                            ->where(
                                'classe_id',
                                $this->classe_id
                            );
                    })
                    ->ignore($affectation),

            ],

            /*
            |--------------------------------------------------------------------------
            | Enseignant
            |--------------------------------------------------------------------------
            */

            'enseignant_id' => [
                'required',
                'exists:enseignants,id',
            ],

            /*
            |--------------------------------------------------------------------------
            | Paramètres
            |--------------------------------------------------------------------------
            */

            'coefficient' => [
                'required',
                'numeric',
                'min:0',
            ],

            'volume_horaire' => [
                'required',
                'integer',
                'min:0',
            ],

            'actif' => [
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

            'matiere_id.unique' =>
            'Cette matière est déjà affectée à cette classe pour cette année scolaire dans cet établissement.',

        ];
    }
}
