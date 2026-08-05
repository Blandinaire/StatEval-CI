<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMatiereRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'libelle' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:matieres,code',
            'coefficient' => 'required|integer|min:1|max:20',
            'couleur' => 'required|string|max:20',
            'active' => 'boolean',
        ];
    }
}