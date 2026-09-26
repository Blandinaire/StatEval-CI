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
                'in:Trimestre 1,Trimestre 2,Trimestre 3,Semestre 1,Semestre 2',
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

            'etablissement_id.exists' =>
            'L’établissement sélectionné est invalide.',

            'annee_scolaire_id.required' =>
            'Veuillez sélectionner une année scolaire.',

            'annee_scolaire_id.exists' =>
            'L’année scolaire sélectionnée est invalide.',

            'classe_id.required' =>
            'Veuillez sélectionner une classe.',

            'classe_id.exists' =>
            'La classe sélectionnée est invalide.',

            'educateur_id.exists' =>
            'L’éducateur sélectionné est invalide.',

            'periode.required' =>
            'Veuillez sélectionner une période.',

            'periode.in' =>
            'La période sélectionnée est invalide.',

            'notes.required' =>
            'Aucun élève à enregistrer.',

            'notes.array' =>
            'Le format des notes est invalide.',

            'notes.min' =>
            'Aucun élève à enregistrer.',

            'notes.*.eleve_id.required' =>
            'L’élève est obligatoire.',

            'notes.*.eleve_id.exists' =>
            'L’élève sélectionné est invalide.',

            'notes.*.note.numeric' =>
            'La note doit être numérique.',

            'notes.*.note.max' =>
            'La note ne peut pas dépasser 20.',

            'notes.*.note.min' =>
            'La note ne peut pas être inférieure à 0.',

            'notes.*.observation.max' =>
            'L’observation ne peut pas dépasser 2000 caractères.',
        ];
    }
}
