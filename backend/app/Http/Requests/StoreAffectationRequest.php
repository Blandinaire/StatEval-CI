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

            'matiere_id' => [

                'required',

                'exists:matieres,id',

                Rule::unique('affectations')
                    ->where(fn ($query) => $query

                        ->where('annee_scolaire_id', $this->annee_scolaire_id)

                        ->where('classe_id', $this->classe_id)

                    )

                    ->ignore($affectation),

            ],

            'enseignant_id' => [
                'required',
                'exists:enseignants,id',
            ],

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
                'Cette matière est déjà affectée à cette classe pour cette année scolaire.',

        ];
    }
}