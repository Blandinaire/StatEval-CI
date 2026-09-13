<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ElevesTemplateExport implements WithMultipleSheets
{
    public function __construct(
        private int $etablissementId,
        private int $anneeScolaireId
    ) {
    }

    public function sheets(): array
    {
        /*
         * IMPORTANT :
         * Instructions est générée en premier afin que les plages nommées
         * soient créées avant la génération de la feuille Élèves.
         */
        return [
            new ElevesTemplateInstructionsSheet(
                $this->etablissementId,
                $this->anneeScolaireId
            ),

            new ElevesTemplateSheet(),
        ];
    }
}