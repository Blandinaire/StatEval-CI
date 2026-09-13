<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        /*
        |--------------------------------------------------------------------------
        | Récupération de l'année scolaire concernée
        |--------------------------------------------------------------------------
        |
        | Avec Route::resource(), Laravel utilise généralement le paramètre
        | "annee_scolaire".
        |
        | On prévoit également le cas où le paramètre aurait été nommé
        | "anneeScolaire".
        |
        */

        $anneeScolaire = $this->route('annee_scolaire')
            ?? $this->route('anneeScolaire');

        $anneeId = null;

        if ($anneeScolaire) {
            $anneeId = is_object($anneeScolaire)
                ? $anneeScolaire->id
                : $anneeScolaire;
        }

        return [
            'libelle' => [
                'required',
                'string',
                'max:20',

                Rule::unique(
                    'annee_scolaires',
                    'libelle'
                )->ignore($anneeId),
            ],

            'date_debut' => [
                'required',
                'date',
            ],

            'date_fin' => [
                'required',
                'date',
                'after:date_debut',
            ],

            'active' => [
                'boolean',
            ],
        ];
    }

    /**
     * Messages personnalisés.
     */
    public function messages(): array
    {
        return [
            'libelle.required' =>
                "Le libellé est obligatoire.",

            'libelle.string' =>
                "Le libellé doit être une chaîne de caractères.",

            'libelle.max' =>
                "Le libellé ne peut pas dépasser 20 caractères.",

            'libelle.unique' =>
                "Cette année scolaire existe déjà.",

            'date_debut.required' =>
                "La date de début est obligatoire.",

            'date_debut.date' =>
                "La date de début n'est pas valide.",

            'date_fin.required' =>
                "La date de fin est obligatoire.",

            'date_fin.date' =>
                "La date de fin n'est pas valide.",

            'date_fin.after' =>
                "La date de fin doit être postérieure à la date de début.",
        ];
    }
}