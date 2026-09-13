<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EnseignantsTemplateInstructionsSheet implements
    FromArray,
    WithStyles
{
    public function array(): array
    {
        return [

            ['MODE D’EMPLOI — IMPORTATION MASSIVE DES ENSEIGNANTS'],

            [''],

            ['CHAMPS OBLIGATOIRES'],

            ['1. nom'],
            ['2. prenoms'],
            ['3. sexe'],
            ['4. etablissement'],

            [''],

            ['CHAMPS FACULTATIFS'],

            [
                'Tous les autres champs peuvent être laissés vides.'
            ],

            [''],

            ['RÈGLES IMPORTANTES'],

            [
                'Le nom et les prénoms seront automatiquement enregistrés en majuscules.'
            ],

            [
                'Le matricule interne est généré automatiquement par SchoolManager.'
            ],

            [
                'Ne renseignez donc jamais la colonne matricule interne.'
            ],

            [
                'L’établissement indiqué doit correspondre à l’établissement sélectionné dans SchoolManager.'
            ],

            [
                'Les matières doivent déjà exister dans SchoolManager.'
            ],

            [
                'Une ligne contenant une erreur empêche l’importation du fichier.'
            ],

            [''],

            ['VALEURS AUTORISÉES'],

            ['Sexe : Masculin / Féminin'],

            ['Type : Permanent / Vacataire / Contractuel'],

            ['Statut : Actif / Suspendu / Retraité'],

            ['Actif : Oui / Non'],

            [''],

            [
                'CONSEIL : commencez par renseigner uniquement les 4 champs obligatoires.'
            ],

            [
                'Les informations complémentaires pourront être complétées ultérieurement.'
            ],
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getColumnDimension('A')->setWidth(110);

        $sheet->getRowDimension(1)->setRowHeight(35);

        $sheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => [
                    'rgb' => 'FFFFFF',
                ],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => [
                    'rgb' => '1D4ED8',
                ],
            ],
            'alignment' => [
                'vertical' => 'center',
            ],
        ]);

        foreach ([3, 9, 13, 21] as $row) {

            $sheet->getStyle("A{$row}")->getFont()->setBold(true);
        }

        $sheet->getStyle('A1:A30')->getAlignment()
            ->setWrapText(true);

        return $sheet;
    }
}
