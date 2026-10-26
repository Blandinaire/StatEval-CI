<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAutrePersonnelRequest extends FormRequest
{
    /**
     * Vérifier les autorisations de l'utilisateur.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Directeur',
                'Direction',
            ]);
    }

    /**
     * Règles de validation des données.
     */
    public function rules(): array
    {
        return [
            'fonction_personnel_id' => [
                'required',
                'integer',
                Rule::exists('fonctions_personnel', 'id')
                    ->where('actif', true),
            ],


            'user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
                Rule::unique('autres_personnels', 'user_id')
                    ->ignore($this->route('autre_personnel')),
            ],


            'matricule' => [
                'nullable',
                'string',
                'max:50',
            ],

            'nom' => [
                'required',
                'string',
                'max:100',
            ],

            'prenoms' => [
                'required',
                'string',
                'max:150',
            ],

            'sexe' => [
                'required',
                'string',
                'max:20',
            ],

            'date_naissance' => [
                'nullable',
                'date',
                'before_or_equal:today',
            ],

            'lieu_naissance' => [
                'nullable',
                'string',
                'max:150',
            ],

            'nationalite' => [
                'nullable',
                'string',
                'max:100',
            ],

            'telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'adresse' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'photo' => [
                'nullable',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
                Rule::in([
                    'Fonctionnaire',
                    'Contractuel',
                    'Prestataire',
                    'Autre',
                ]),
            ],

            'grade' => [
                'nullable',
                'string',
                'max:100',
            ],

            'date_embauche' => [
                'nullable',
                'date',
            ],

            'date_prise_service' => [
                'nullable',
                'date',
            ],

            'statut' => [
                'required',
                Rule::in([
                    'Actif',
                    'Suspendu',
                    'En congé',
                    'Parti',
                ]),
            ],

            'actif' => [
                'sometimes',
                'boolean',
            ],

            'observations' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }

    /**
     * Messages de validation personnalisés.
     */
    public function messages(): array
    {
        return [
            'fonction_personnel_id.required'
            => 'Veuillez sélectionner une fonction.',

            'fonction_personnel_id.exists'
            => 'La fonction sélectionnée est inexistante ou inactive.',

            'user_id.unique'
            => 'Ce compte utilisateur est déjà associé à un personnel.',

            'nom.required'
            => 'Le nom est obligatoire.',

            'prenoms.required'
            => 'Les prénoms sont obligatoires.',

            'sexe.required'
            => 'Veuillez renseigner le sexe.',

            'date_naissance.before_or_equal'
            => 'La date de naissance ne peut pas être dans le futur.',

            'email.email'
            => 'Veuillez renseigner une adresse e-mail valide.',

            'type.in'
            => 'Le type de personnel sélectionné est invalide.',

            'statut.in'
            => 'Le statut sélectionné est invalide.',
        ];
    }
}
