<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAbsenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'eleve_id' => [
                'required',
                'integer',
                'exists:eleves,id',
            ],

            'educateur_id' => [
                'nullable',
                'integer',
                'exists:educateurs,id',
            ],

            'annee_scolaire_id' => [
                'required',
                'integer',
                'exists:annee_scolaires,id',
            ],

            'classe_id' => [
                'nullable',
                'integer',
                'exists:classes,id',
            ],

            'date_absence' => [
                'required',
                'date',
            ],

            'heure_debut' => [
                'nullable',
                'date_format:H:i',
            ],

            'heure_fin' => [
                'nullable',
                'date_format:H:i',
                'after:heure_debut',
            ],

            'duree_heures' => [
                'nullable',
                'numeric',
                'min:0',
                'max:24',
            ],

            'justifiee' => [
                'required',
                'boolean',
            ],

            'motif' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'numero_billet' => [
                'nullable',
                'string',
                'max:255',
                'unique:absences,numero_billet',
            ],

            'billet_edite' => [
                'required',
                'boolean',
            ],

            'billet_edite_le' => [
                'nullable',
                'date',
            ],

            'observation' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }
}