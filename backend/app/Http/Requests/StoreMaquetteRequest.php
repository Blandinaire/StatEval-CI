<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaquetteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('SuperAdmin') ?? false;
    }

    public function rules(): array
    {
        return [
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

            'libelle' => [
                'required',
                'string',
                'max:255',
            ],

            'nom_version' => [
                'required',
                'string',
                'max:150',
            ],

            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'active' => [
                'boolean',
            ],
        ];
    }
}