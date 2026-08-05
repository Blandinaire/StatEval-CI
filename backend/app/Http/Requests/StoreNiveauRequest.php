<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNiveauRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $niveau = $this->route('niveau');

        return [
            'libelle' => [
                'required',
                'string',
                'max:255',
            ],

            'code' => [
                'required',
                'string',
                'max:20',
                'unique:niveaux,code,' . optional($niveau)->id,
            ],

            'ordre' => [
                'required',
                'integer',
                'min:1',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'libelle.required' => 'Le libellé est obligatoire.',
            'code.required' => 'Le code est obligatoire.',
            'code.unique' => 'Ce code existe déjà.',
            'ordre.required' => "L'ordre est obligatoire.",
        ];
    }
}