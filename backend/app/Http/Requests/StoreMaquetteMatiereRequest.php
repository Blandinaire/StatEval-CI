<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMaquetteMatiereRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé
     * à effectuer cette opération.
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
         * Récupération de la ligne de maquette
         * concernée par la modification.
         *
         * Lors d'une création, cette valeur est null.
         */
        $maquetteMatiere = $this->route('maquetteMatiere');

        $idAModifier = is_object($maquetteMatiere)
            ? $maquetteMatiere->getKey()
            : $maquetteMatiere;

        /*
         * Récupération de l'identifiant de la maquette.
         */
        $maquetteId = $this->input('maquette_id');

        return [

            'maquette_id' => [
                'required',
                'integer',
                'exists:maquettes,id',
            ],

            'matiere_id' => [
                'required',
                'integer',
                'exists:matieres,id',

                Rule::unique(
                    'maquette_matieres',
                    'matiere_id'
                )
                    ->where(function ($query) use ($maquetteId) {
                        return $query->where(
                            'maquette_id',
                            $maquetteId
                        );
                    })
                    ->ignore($idAModifier),
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