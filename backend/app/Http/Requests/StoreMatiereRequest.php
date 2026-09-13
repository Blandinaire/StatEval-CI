<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMatiereRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'matiere_parent_id' => [
                'nullable',
                'integer',
                'exists:matieres,id',
                Rule::notIn([
                    $this->route('matiere')?->id,
                ]),
            ],
            'libelle' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:matieres,code',
            'couleur' => 'required|string|max:20',
            'active' => 'boolean',
        ];
    }
}
