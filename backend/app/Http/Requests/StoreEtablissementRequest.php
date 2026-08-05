<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEtablissementRequest extends FormRequest
{
    /**
     * Autoriser la requête.
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
            'nom'        => 'required|string|max:255',
            'code'       => 'nullable|string|max:20|unique:etablissements,code',
            'ville'      => 'required|string|max:255',
            'adresse'    => 'nullable|string|max:255',
            'telephone'  => 'nullable|string|max:30',
            'email'      => 'nullable|email|max:255',
            'logo'       => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ];
    }

    /**
     * Messages personnalisés.
     */
    public function messages(): array
    {
        return [
            'nom.required' => "Le nom de l'établissement est obligatoire.",
            'ville.required' => "La ville est obligatoire.",
            'code.unique' => "Ce code existe déjà.",
            'email.email' => "L'adresse e-mail n'est pas valide.",
            'logo.image' => "Le logo doit être une image.",
        ];
    }
}