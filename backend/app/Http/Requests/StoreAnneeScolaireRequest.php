<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnneeScolaireRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation.
     */
    public function rules(): array
    {
        return [
            'libelle' => 'required|string|max:20|unique:annee_scolaires,libelle',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'active' => 'boolean',
        ];
    }

    /**
     * Messages personnalisés.
     */
    public function messages(): array
    {
        return [
            'libelle.required' => 'Le libellé est obligatoire.',
            'libelle.unique' => 'Cette année scolaire existe déjà.',
            'date_debut.required' => 'La date de début est obligatoire.',
            'date_fin.required' => 'La date de fin est obligatoire.',
            'date_fin.after' => 'La date de fin doit être postérieure à la date de début.',
        ];
    }
}