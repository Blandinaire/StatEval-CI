<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMaquetteRequest extends FormRequest
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
            'annee_scolaire_id' => ['required', 'exists:annee_scolaires,id'],
            'cycle_id' => ['required', 'exists:cycles,id'],
            'niveau_id' => ['required', 'exists:niveaux,id'],
            'serie_id' => ['nullable', 'exists:series,id'],

            'libelle' => ['required', 'string', 'max:255'],
        ];
    }
}
