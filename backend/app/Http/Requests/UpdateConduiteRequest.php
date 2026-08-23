<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConduiteRequest extends FormRequest
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

            'evaluation_id' => [
                'nullable',
                'integer',
                'exists:evaluations,id',
            ],

            'note' => [
                'required',
                'numeric',
                'min:0',
                'max:20',
            ],

            'observation' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }
}