<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class EnseignantsTemplateExport implements WithMultipleSheets
{
    protected int $etablissementId;

    public function __construct(int $etablissementId)
    {
        $this->etablissementId = $etablissementId;
    }

    public function sheets(): array
    {
        return [
            new EnseignantsTemplateSheet($this->etablissementId),
            new EnseignantsTemplateInstructionsSheet(),
        ];
    }
}
