<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMaquetteMatiereRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
   public function rules(): array
{
    return [

        'maquette_id' => [
            'required',
            'exists:maquettes,id',
        ],

        'matiere_id' => [
            'required',
            'exists:matieres,id',
        ],

        'coefficient' => [
            'required',
            'numeric',
            'min:0.5',
        ],

        'volume_horaire' => [
            'required',
            'numeric',
            'min:0',
        ],

        'ordre' => [
            'nullable',
            'integer',
            'min:1',
        ],

        'obligatoire' => [
            'nullable',
            'boolean',
        ],

        'prise_en_compte_moyenne' => [
            'nullable',
            'boolean',
        ],

        'note_sur' => [
            'nullable',
            'numeric',
            'min:1',
            'max:100',
        ],

        'active' => [
            'nullable',
            'boolean',
        ],

    ];
}
}
