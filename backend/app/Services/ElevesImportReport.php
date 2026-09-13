<?php

namespace App\Services;

class ElevesImportReport
{
    protected array $errors = [];

    protected int $totalRows = 0;

    protected int $validRows = 0;

    public function setTotalRows(int $totalRows): void
    {
        $this->totalRows = $totalRows;
    }

    public function addError(
        int $ligne,
        ?string $eleve,
        ?string $champ,
        mixed $valeur,
        string $message
    ): void {
        $this->errors[] = [
            'ligne' => $ligne,
            'eleve' => $eleve,
            'champ' => $champ,
            'valeur' => $valeur,
            'message' => $message,
        ];
    }

    public function addValidRow(): void
    {
        $this->validRows++;
    }

    public function hasErrors(): bool
    {
        return count($this->errors) > 0;
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function totalRows(): int
    {
        return $this->totalRows;
    }

    public function validRows(): int
    {
        return $this->validRows;
    }

    public function errorCount(): int
    {
        return count($this->errors);
    }

    public function toArray(): array
    {
        return [
            'total_rows' => $this->totalRows,
            'valid_rows' => $this->validRows,
            'error_count' => $this->errorCount(),
            'has_errors' => $this->hasErrors(),
            'errors' => $this->errors(),
        ];
    }
}