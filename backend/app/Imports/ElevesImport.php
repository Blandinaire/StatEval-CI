<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ElevesImport implements WithMultipleSheets
{
    protected int $etablissementId;

    protected int $anneeScolaireId;

    /**
     * Instance réelle de l'importateur de la feuille Élèves.
     */
    protected ?ElevesSheetImport $sheetImport = null;

    public function __construct(
        int $etablissementId,
        int $anneeScolaireId
    ) {
        $this->etablissementId = $etablissementId;
        $this->anneeScolaireId = $anneeScolaireId;
    }

    /**
     * Sélectionner uniquement la feuille "Élèves".
     *
     * Toutes les autres feuilles du classeur sont ignorées.
     */
    public function sheets(): array
    {
        $this->sheetImport = new ElevesSheetImport(
            $this->etablissementId,
            $this->anneeScolaireId
        );

        return [
            'Élèves' => $this->sheetImport,
        ];
    }

    /**
     * Permet au contrôleur de récupérer le nombre
     * d'élèves effectivement importés.
     *
     * Le contrôleur utilise actuellement :
     *
     * $import->nombreImportes
     */
    public function __get(string $name): mixed
    {
        if ($name === 'nombreImportes') {
            return $this->sheetImport?->nombreImportes ?? 0;
        }

        return null;
    }
}