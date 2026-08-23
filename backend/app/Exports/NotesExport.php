<?php

namespace App\Exports;

use App\Models\Note;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class NotesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $classeId;
    protected $matiereId;

    public function __construct($classeId, $matiereId)
    {
        $this->classeId = $classeId;
        $this->matiereId = $matiereId;
    }

    public function collection()
    {
        return Note::with(['eleve', 'evaluation'])
            ->whereHas('eleve', function($q) {
                $q->where('classe_id', $this->classeId);
            })
            ->whereHas('evaluation', function($q) {
                $q->where('matiere_id', $this->matiereId);
            })
            ->get();
    }

    public function headings(): array
    {
        return [
            'Élève',
            'Évaluation',
            'Note',
            'Coefficient',
            'Date',
        ];
    }

    public function map($note): array
    {
        return [
            $note->eleve->nom . ' ' . $note->eleve->prenom,
            $note->evaluation->titre,
            $note->valeur ?? 'Absent',
            $note->evaluation->coefficient,
            $note->evaluation->date_evaluation->format('d/m/Y'),
        ];
    }
}