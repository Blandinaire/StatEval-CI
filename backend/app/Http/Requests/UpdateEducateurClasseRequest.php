<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEducateurClasseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'etablissement_id' => [
                'required',
                'integer',
                'exists:etablissements,id',
            ],

            'annee_scolaire_id' => [
                'required',
                'integer',
                'exists:annee_scolaires,id',
            ],

            'educateur_id' => [
                'required',
                'integer',
                'exists:educateurs,id',
            ],

            'classe_id' => [
                'required',
                'integer',
                'exists:classes,id',
            ],

            'actif' => [
                'required',
                'boolean',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = auth()->user();

            if (! $user) {
                return;
            }

            if (
                ! $user->hasRole('SuperAdmin') &&
                (int) $this->etablissement_id !== (int) $user->etablissement_id
            ) {
                $validator->errors()->add(
                    'etablissement_id',
                    'Vous ne pouvez pas utiliser un autre établissement.'
                );
            }

            $affectation = $this->route('educateurClasse');

            if (! $affectation) {
                return;
            }

            $exists = \App\Models\EducateurClasse::query()
                ->where('annee_scolaire_id', $this->annee_scolaire_id)
                ->where('educateur_id', $this->educateur_id)
                ->where('classe_id', $this->classe_id)
                ->where('id', '!=', $affectation->id)
                ->exists();

            if ($exists) {
                $validator->errors()->add(
                    'classe_id',
                    'Cette affectation existe déjà.'
                );
            }
        });
    }
}
