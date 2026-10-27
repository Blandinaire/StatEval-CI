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
            if (isset($ligne->active) && !(bool) $ligne->active) {
                continue;
            }

            if (
                isset($ligne->prise_en_compte_moyenne) &&
                !(bool) $ligne->prise_en_compte_moyenne
            ) {
                continue;
            }

            $matiereId = (int) $ligne->matiere_id;
            $coefficient = (float) ($ligne->coefficient ?? 0);

            if (
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
}
