<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClasseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'libelle' => [
                'required',
                'string',
                'max:255',
            ],

            'niveau_id' => [
                'required',
                'exists:niveaux,id',
            ],

            'annee_scolaire_id' => [
                'required',
                'exists:annee_scolaires,id',
            ],

            'capacite' => [
                'required',
                'integer',
                'min:1',
                'max:100',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'libelle.required' => 'Le libellé est obligatoire.',
            'niveau_id.required' => 'Veuillez sélectionner un niveau.',
            'annee_scolaire_id.required' => 'Veuillez sélectionner une année scolaire.',
            'capacite.required' => 'La capacité est obligatoire.',
        ];
    }
}