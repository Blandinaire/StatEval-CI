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
     * Nombre d'élèves effectivement importés.
     */
    public function __get(string $name): mixed
    {
        if ($name === 'nombreImportes') {
            return $this->sheetImport?->nombreImportes ?? 0;
        }

        return null;
    }

    /**
     * Rapport des erreurs d'importation.
     */
    public function getErreurs(): array
    {
        return $this->sheetImport?->getErreurs() ?? [];
    }

    /**
     * Nombre d'erreurs.
     */
    public function getNombreErreurs(): int
    {
        return count($this->getErreurs());
    }

    public function getLignesRejetees(): array
    {
        return $this->sheetImport?->getLignesRejetees() ?? [];
    }
}
