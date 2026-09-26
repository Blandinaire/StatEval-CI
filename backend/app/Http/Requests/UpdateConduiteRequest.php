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

    public function messages(): array
    {
        return [

            'note.required' =>
            'Veuillez saisir une note.',

            'note.numeric' =>
            'La note doit être numérique.',

            'note.min' =>
            'La note ne peut pas être inférieure à 0.',

            'note.max' =>
            'La note ne peut pas dépasser 20.',

            'observation.max' =>
            'L’observation ne peut pas dépasser 2000 caractères.',
        ];
    }
}
