<?php

namespace App\Exports;

use App\Models\Etablissement;
use App\Models\Matiere;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EnseignantsTemplateSheet implements
    FromArray,
    WithHeadings,
    WithStyles,
    WithColumnFormatting
{
    protected int $etablissementId;

    public function __construct(int $etablissementId)
    {
        $this->etablissementId = $etablissementId;
    }

    public function headings(): array
    {
        return [
            'nom',
            'prenoms',
            'sexe',
            'etablissement',
            'date_naissance',
            'lieu_naissance',
            'nationalite',
            'telephone',
            'email',
            'adresse',
            'matricule_fonction_publique',
            'type',
            'grade',
            'diplome',
            'matiere_principale',
            'matiere_secondaire',
            'date_embauche',
            'date_prise_service',
            'volume_horaire',
            'nb_classes_max',
            'statut',
            'actif',
        ];
    }

    public function array(): array
    {
        $etablissement = Etablissement::find($this->etablissementId);

        return [
            [
                '',
                '',
                '',
                $etablissement?->nom ?? '',
                '',
                '',
                'Ivoirienne',
                '',
                '',
                '',
                '',
                'Vacataire',
                '',
                '',
                '',
                '',
                '',
                '',
                0,
                10,
                'Actif',
                'Oui',
            ],
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->freezePane('A2');

        $sheet->getRowDimension(1)->setRowHeight(30);

        $sheet->getStyle('A1:V1')->applyFromArray([
            'font' => [
                'bold' => true,
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
                'horizontal' => 'center',
                'vertical' => 'center',
                'wrapText' => true,
            ],
        ]);

        foreach (range('A', 'V') as $column) {
            $sheet
                ->getColumnDimension($column)
                ->setAutoSize(true);
        }

        /*
        |----------------------------------------------------------------------
        | Largeur minimale
        |----------------------------------------------------------------------
        */

        $sheet->getColumnDimension('A')->setWidth(20);
        $sheet->getColumnDimension('B')->setWidth(25);
        $sheet->getColumnDimension('C')->setWidth(15);
        $sheet->getColumnDimension('D')->setWidth(30);

        /*
        |----------------------------------------------------------------------
        | Indication des champs obligatoires
        |----------------------------------------------------------------------
        */

        $sheet->getStyle('A1:D1')->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => [
                    'rgb' => '15803D',
                ],
            ],
        ]);

        /*
        |----------------------------------------------------------------------
        | Validation SEXE
        |----------------------------------------------------------------------
        */

        for ($row = 2; $row <= 1000; $row++) {

            $validation = $sheet
                ->getCell("C{$row}")
                ->getDataValidation();

            $validation->setType(
                DataValidation::TYPE_LIST
            );

            $validation->setErrorStyle(
                DataValidation::STYLE_STOP
            );

            $validation->setAllowBlank(false);

            $validation->setShowInputMessage(true);

            $validation->setShowErrorMessage(true);

            $validation->setErrorTitle(
                'Valeur incorrecte'
            );

            $validation->setError(
                'Choisissez Masculin ou Féminin.'
            );

            $validation->setFormula1(
                '"Masculin,Féminin"'
            );
        }

        /*
        |----------------------------------------------------------------------
        | TYPE ENSEIGNANT
        |----------------------------------------------------------------------
        */

        for ($row = 2; $row <= 1000; $row++) {

            $validation = $sheet
                ->getCell("L{$row}")
                ->getDataValidation();

            $validation->setType(
                DataValidation::TYPE_LIST
            );

            $validation->setAllowBlank(true);

            $validation->setShowErrorMessage(true);

            $validation->setFormula1(
                '"Permanent,Vacataire,Contractuel"'
            );
        }

        /*
        |----------------------------------------------------------------------
        | DIPLOME
        |----------------------------------------------------------------------
        */

        for ($row = 2; $row <= 1000; $row++) {

            $validation = $sheet
                ->getCell("N{$row}")
                ->getDataValidation();

            $validation->setType(
                DataValidation::TYPE_LIST
            );

            $validation->setAllowBlank(true);

            $validation->setShowErrorMessage(true);

            $validation->setFormula1(
                '"BEPC,BAC,DEUG,BTS,DUT,Licence,Maîtrise,Master,CAPES,CAP-CEG,CAES,Doctorat,Autre"'
            );
        }

        /*
        |----------------------------------------------------------------------
        | STATUT
        |----------------------------------------------------------------------
        */

        for ($row = 2; $row <= 1000; $row++) {

            $validation = $sheet
                ->getCell("U{$row}")
                ->getDataValidation();

            $validation->setType(
                DataValidation::TYPE_LIST
            );

            $validation->setAllowBlank(true);

            $validation->setShowErrorMessage(true);

            $validation->setFormula1(
                '"Actif,Suspendu,Retraité"'
            );
        }

        /*
        |----------------------------------------------------------------------
        | ACTIF
        |----------------------------------------------------------------------
        */

        for ($row = 2; $row <= 1000; $row++) {

            $validation = $sheet
                ->getCell("V{$row}")
                ->getDataValidation();

            $validation->setType(
                DataValidation::TYPE_LIST
            );

            $validation->setAllowBlank(true);

            $validation->setShowErrorMessage(true);

            $validation->setFormula1(
                '"Oui,Non"'
            );
        }

        return $sheet;
    }

    public function columnFormats(): array
    {
        return [
            'E' => 'dd/mm/yyyy',
            'Q' => 'dd/mm/yyyy',
            'R' => 'dd/mm/yyyy',
            'H' => '@',
            'K' => '@',
        ];
    }
}