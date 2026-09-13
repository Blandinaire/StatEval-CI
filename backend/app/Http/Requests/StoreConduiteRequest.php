<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConduiteRequest extends FormRequest
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
                'integer',
                'exists:etablissements,id',
            ],

            'annee_scolaire_id' => [
                'required',
                'integer',
                'exists:annee_scolaires,id',
            ],

            'classe_id' => [
                'required',
                'integer',
                'exists:classes,id',
            ],

            'educateur_id' => [
                'nullable',
                'integer',
                'exists:educateurs,id',
            ],

            'periode' => [
                'required',
                'string',
                'in:trimestre_1,trimestre_2,trimestre_3,semestre_1,semestre_2',
            ],

            'notes' => [
                'required',
                'array',
                'min:1',
            ],

            'notes.*.eleve_id' => [
                'required',
                'integer',
                'exists:eleves,id',
            ],

            'notes.*.note' => [
                'nullable',
                'numeric',
                'min:0',
                'max:20',
            ],

            'notes.*.observation' => [
                'nullable',
                'string',
                'max:2000',
            ],

        ];
    }

    public function messages(): array
    {
        return [

            'etablissement_id.required' =>
                'Veuillez sélectionner un établissement.',

            'annee_scolaire_id.required' =>
                'Veuillez sélectionner une année scolaire.',

            'classe_id.required' =>
                'Veuillez sélectionner une classe.',

            'periode.required' =>
                'Veuillez sélectionner une période.',

            'notes.required' =>
                'Aucun élève à enregistrer.',

            'notes.*.note.max' =>
                'La note ne peut pas dépasser 20.',

            'notes.*.note.min' =>
                'La note ne peut pas être inférieure à 0.',
        ];
    }
}