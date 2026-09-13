<?php

namespace App\Http\Requests;

use App\Models\AnneeScolaire;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClasseRequest extends FormRequest
{
    /**
     * Autorisation.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Préparation des données avant validation.
     */
    protected function prepareForValidation(): void
    {
        $user = $this->user();

        /*
        |--------------------------------------------------------------------------
        | Établissement
        |--------------------------------------------------------------------------
        */

        if (
            $user &&
            !$user->hasRole('SuperAdmin')
        ) {
            $this->merge([
                'etablissement_id' => $user->etablissement_id,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Année scolaire
        |--------------------------------------------------------------------------
        */

        if (!$this->input('annee_scolaire_id')) {
            $this->merge([
                'annee_scolaire_id' => AnneeScolaire::activeId(),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Nettoyage du libellé
        |--------------------------------------------------------------------------
        */

        if ($this->has('libelle')) {
            $this->merge([
                'libelle' => preg_replace(
                    '/\s+/',
                    ' ',
                    trim($this->input('libelle'))
                ),
            ]);
        }
    }

    /**
     * Règles de validation.
     */
    public function rules(): array
    {
        /*
        |--------------------------------------------------------------------------
        | Classe actuellement modifiée
        |--------------------------------------------------------------------------
        */

        $classe = $this->route('classe');

        /*
        |--------------------------------------------------------------------------
        | Identifiant de la classe
        |--------------------------------------------------------------------------
        */

        $classeId = is_object($classe)
            ? $classe->id
            : $classe;

        return [

            'etablissement_id' => [
                'required',
                'exists:etablissements,id',
            ],

            'annee_scolaire_id' => [
                'required',
                'exists:annee_scolaires,id',
            ],

            'cycle_id' => [
                'required',
                'exists:cycles,id',
            ],

            'niveau_id' => [
                'required',
                'exists:niveaux,id',
            ],

            'serie_id' => [
                'nullable',
                'exists:series,id',
            ],

            'maquette_id' => [
                'required',
                'exists:maquettes,id',
            ],

            'libelle' => [
                'required',
                'string',
                'max:100',

                Rule::unique(
                    'classes',
                    'libelle'
                )
                    ->where(function ($query) {

                        return $query
                            ->where(
                                'etablissement_id',
                                $this->input(
                                    'etablissement_id'
                                )
                            )
                            ->where(
                                'annee_scolaire_id',
                                $this->input(
                                    'annee_scolaire_id'
                                )
                            );
                    })
                    ->ignore($classeId),
            ],

            'capacite' => [
                'required',
                'integer',
                'min:1',
                'max:200',
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

            'libelle.unique' =>
            'Cette classe existe déjà dans cet établissement pour cette année scolaire.',

        ];
    }
}
