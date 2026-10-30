<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreAnneeScolaireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
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
                Rule::unique('annee_scolaires', 'libelle')
                    ->ignore($anneeId),
            ],

            'date_debut' => [
                'required',
                'date_format:Y-m-d',
            ],

            'date_fin' => [
                'required',
                'date_format:Y-m-d',
                'after:date_debut',
            ],

            'active' => [
                'required',
                'boolean',
            ],

            'mode_periodes' => [
                'required',
                Rule::in(['trimestriel', 'semestriel']),
            ],

            'periodes' => [
                'required',
                'array',
                'min:2',
                'max:3',
            ],

            'periodes.*.libelle' => [
                'required',
                'string',
                'max:50',
            ],

            'periodes.*.ordre' => [
                'required',
                'integer',
                'min:1',
                'max:3',
                'distinct',
            ],

            'periodes.*.date_debut' => [
                'required',
                'date_format:Y-m-d',
            ],

            'periodes.*.date_fin' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:periodes.*.date_debut',
            ],

            'periodes.*.actif' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $mode = $this->input('mode_periodes');
            $periodes = $this->input('periodes', []);
            $debutAnnee = $this->input('date_debut');
            $finAnnee = $this->input('date_fin');

            if (!in_array($mode, ['trimestriel', 'semestriel'], true)) {
                return;
            }

            $nombreAttendu = $mode === 'trimestriel' ? 3 : 2;

            if (count($periodes) !== $nombreAttendu) {
                $validator->errors()->add(
                    'periodes',
                    "Le mode sélectionné nécessite exactement {$nombreAttendu} périodes."
                );

                return;
            }

            if (
                !$debutAnnee ||
                !$finAnnee ||
                !strtotime($debutAnnee) ||
                !strtotime($finAnnee)
            ) {
                return;
            }

            $periodesValides = [];

            foreach ($periodes as $index => $periode) {
                if (
                    empty($periode['date_debut']) ||
                    empty($periode['date_fin']) ||
                    !strtotime($periode['date_debut']) ||
                    !strtotime($periode['date_fin'])
                ) {
                    continue;
                }

                $debut = $periode['date_debut'];
                $fin = $periode['date_fin'];

                if ($debut < $debutAnnee || $fin > $finAnnee) {
                    $validator->errors()->add(
                        "periodes.{$index}.date_debut",
                        "Les dates de la période doivent être comprises dans l'année scolaire."
                    );
                }

                if ($fin < $debut) {
                    $validator->errors()->add(
                        "periodes.{$index}.date_fin",
                        "La fin de la période doit être postérieure ou égale à son début."
                    );
                }

                $periodesValides[] = [
                    'index' => $index,
                    'ordre' => (int) ($periode['ordre'] ?? 0),
                    'debut' => $debut,
                    'fin' => $fin,
                ];
            }

            usort(
                $periodesValides,
                fn($a, $b) => $a['ordre'] <=> $b['ordre']
            );

            foreach ($periodesValides as $index => $periode) {
                if ($index > 0) {
                    $precedente = $periodesValides[$index - 1];

                    if ($periode['debut'] <= $precedente['fin']) {
                        $validator->errors()->add(
                            "periodes.{$periode['index']}.date_debut",
                            "Les périodes doivent être chronologiques et ne pas se chevaucher."
                        );
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'libelle.required' => 'Le libellé est obligatoire.',
            'libelle.max' => 'Le libellé ne peut pas dépasser 20 caractères.',
            'libelle.unique' => 'Cette année scolaire existe déjà.',
            'date_debut.required' => 'La date de début est obligatoire.',
            'date_debut.date_format' => 'La date de début doit être valide.',
            'date_fin.required' => 'La date de fin est obligatoire.',
            'date_fin.date_format' => 'La date de fin doit être valide.',
            'date_fin.after' => 'La fin de l’année doit être postérieure au début.',
            'mode_periodes.required' => 'Veuillez choisir une organisation scolaire.',
            'mode_periodes.in' => 'Le mode doit être trimestriel ou semestriel.',
            'periodes.required' => 'Les périodes scolaires sont obligatoires.',
            'periodes.array' => 'Le format des périodes est incorrect.',
            'periodes.*.libelle.required' => 'Le nom de chaque période est obligatoire.',
            'periodes.*.date_debut.required' => 'La date de début de chaque période est obligatoire.',
            'periodes.*.date_fin.required' => 'La date de fin de chaque période est obligatoire.',
            'periodes.*.date_fin.after_or_equal' => 'La fin doit être postérieure ou égale au début de la période.',
        ];
    }
}
