<?php

namespace App\Http\Requests;

use App\Models\Retard;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRetardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $retard = $this->route('retard');

        $retardId = $retard instanceof Retard
            ? $retard->id
            : $retard;

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

            'date_retard' => [
                'required',
                'date',
            ],

            'heure_prevue' => [
                'nullable',
                'date_format:H:i',
            ],

            'heure_arrivee' => [
                'nullable',
                'date_format:H:i',
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
                Rule::unique('retards', 'numero_billet')
                    ->ignore($retardId),
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