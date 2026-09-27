<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ElevesCorrectionExport implements WithMultipleSheets
{
    public function __construct(
        private array $lignes,
        private int $etablissementId,
        private int $anneeScolaireId
    ) {
    }

    public function sheets(): array
    {
        return [
            new ElevesCorrectionSheet(
                $this->lignes,
                $this->etablissementId,
                $this->anneeScolaireId
            ),
        ];
    }
}