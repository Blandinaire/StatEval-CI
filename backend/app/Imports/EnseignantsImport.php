<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class EnseignantsImport implements WithMultipleSheets
{
    protected int $etablissementId;

    public int $nombreImportes = 0;

    public function __construct(int $etablissementId)
    {
        $this->etablissementId = $etablissementId;
    }

    /**
     * Définit les feuilles du classeur à importer.
     *
     * IMPORTANT :
     * Nous importons uniquement la première feuille (index 0).
     *
     * La feuille "Instructions" du modèle Excel est donc
     * complètement ignorée.
     */
    public function sheets(): array
    {
        return [
            0 => new EnseignantsImportSheet(
                $this->etablissementId,
                $this
            ),
        ];
    }
}
