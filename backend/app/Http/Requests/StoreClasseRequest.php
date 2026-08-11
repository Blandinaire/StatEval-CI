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

        'etablissement_id' => [
            'required',
            'exists:etablissements,id',
        ],

        'annee_scolaire_id' => [
            'required',
            'exists:annee_scolaires,id',
        ],

        'cycle_id' => [
            'required',
            'exists:cycles,id',
        ],

        'niveau_id' => [
            'required',
            'exists:niveaux,id',
        ],

        'serie_id' => [
            'nullable',
            'exists:series,id',
        ],

        'maquette_id' => [
            'required',
            'exists:maquettes,id',
        ],

        'libelle' => [
            'required',
            'string',
            'max:100',
        ],

        'capacite' => [
            'required',
            'integer',
            'min:1',
            'max:100',
        ],

        'active' => [
            'boolean',
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