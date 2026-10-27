<?php

namespace App\Services;

use Illuminate\Support\Collection;

class CalculMoyennesService
{
    /**
     * Calcule la moyenne pondérée des évaluations
     * d'une même matière pour un élève.
     *
     * Chaque note est normalisée sur 20.
     * Les évaluations exclues, les absences et les
     * notes non renseignées ne sont pas comptabilisées.
     */
    public function moyenneMatiere(Collection $notes): ?float
    {
        $sommePonderee = 0.0;
        $sommeCoefficients = 0.0;

        foreach ($notes as $note) {
            $evaluation = $note->evaluation_reference
                ?? $note->evaluation
                ?? null;

            if (!$evaluation) {
                continue;
            }

            if (!(bool) ($evaluation->prise_en_compte_moyenne ?? true)) {
                continue;
            }

            if ((bool) ($note->absent ?? false) || $note->note === null) {
                continue;
            }

            $bareme = (float) ($evaluation->bareme ?? 0);
            $coefficient = (float) ($evaluation->coefficient ?? 1);

            if ($bareme <= 0 || $coefficient <= 0) {
                continue;
            }

            $noteSur20 = ((float) $note->note / $bareme) * 20;

            $sommePonderee += $noteSur20 * $coefficient;
            $sommeCoefficients += $coefficient;
        }

        if ($sommeCoefficients <= 0) {
            return null;
        }

        return round($sommePonderee / $sommeCoefficients, 2);
    }

    /**
     * Calcule la moyenne générale à partir des moyennes
     * par matière et des coefficients de la maquette.
     *
     * $moyennesMatieres : collection indexée par matière_id.
     * $lignesMaquette : lignes de maquette avec matiere_id,
     * coefficient, prise_en_compte_moyenne et active.
     */
    public function moyenneGenerale(
        array $moyennesMatieres,
        Collection $lignesMaquette
    ): ?float {
        $sommePonderee = 0.0;
        $sommeCoefficients = 0.0;


        foreach ($lignesMaquette as $ligne) {
            if (!(bool) ($ligne->active ?? true)) {
                continue;
            }

            if (!(bool) ($ligne->prise_en_compte_moyenne ?? true)) {
                continue;
            }

            $matiereId = (int) ($ligne->matiere_id ?? 0);
            $coefficient = (float) ($ligne->coefficient ?? 0);

            if (
                $matiereId <= 0 ||
                $coefficient <= 0 ||
                !array_key_exists($matiereId, $moyennesMatieres) ||
                $moyennesMatieres[$matiereId] === null
            ) {
                continue;
            }

            $sommePonderee +=
                (float) $moyennesMatieres[$matiereId] * $coefficient;

            $sommeCoefficients += $coefficient;
        }


        if ($sommeCoefficients <= 0) {
            return null;
        }

        return round($sommePonderee / $sommeCoefficients, 2);
    }


    /**
     * Calcule les moyennes par matière et la moyenne générale
     * d'un élève à partir de ses notes et de la maquette de sa classe.
     *
     * Chaque note doit disposer de son évaluation, chargée dans
     * evaluation_reference ou dans la relation evaluation.
     */
    public function calculerMoyennesEleve(
        Collection $notes,
        Collection $lignesMaquette
    ): array {
        $notesParMatiere = $notes->groupBy(function ($note) {
            $evaluation = $note->evaluation_reference
                ?? $note->evaluation
                ?? null;

            return $evaluation?->matiere_id;
        });

        $moyennesMatieres = [];

        foreach ($notesParMatiere as $matiereId => $notesMatiere) {
            if ($matiereId === '' || $matiereId === null) {
                continue;
            }

            $moyennesMatieres[(int) $matiereId] =
                $this->moyenneMatiere($notesMatiere);
        }

        return [
            'moyennes_matieres' => $moyennesMatieres,
            'moyenne_generale' => $this->moyenneGenerale(
                $moyennesMatieres,
                $lignesMaquette
            ),
        ];
    }
}
