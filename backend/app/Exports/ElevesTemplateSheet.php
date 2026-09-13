<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\Conditional;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ElevesTemplateSheet implements
    FromArray,
    WithHeadings,
    WithTitle,
    WithStyles,
    WithColumnWidths,
    WithEvents
{
    /**
     * Nombre maximum de lignes prévues dans le modèle.
     */
    private const MAX_ROWS = 2001;

    /**
     * Le modèle ne contient aucun faux élève.
     */
    public function array(): array
    {
        return [];
    }

    public function title(): string
    {
        return 'Élèves';
    }

    public function headings(): array
    {
        return [
            'classe',
            'matricule',
            'nom',
            'prenoms',
            'sexe',
            'date_naissance',
            'lieu_naissance',
            'nationalite',
            'adresse',
            'telephone',
            'email',
            'redoublant',
            'boursier',
            'regime',
            'statut',
            'statut_affectation',

            'pere_nom',
            'pere_prenoms',
            'pere_telephone',
            'pere_email',
            'pere_profession',
            'pere_adresse',

            'mere_nom',
            'mere_prenoms',
            'mere_telephone',
            'mere_email',
            'mere_profession',
            'mere_adresse',

            'type_tuteur',
            'tuteur_nom',
            'tuteur_prenoms',
            'tuteur_telephone',
            'tuteur_email',
            'tuteur_profession',
            'tuteur_adresse',

            'groupe_sanguin',
            'allergies',
            'observations_medicales',
            'contact_urgence_nom',
            'contact_urgence_telephone',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {

                /** @var Worksheet $sheet */
                $sheet = $event->sheet->getDelegate();

                /*
                |--------------------------------------------------------------------------
                | LISTES DÉROULANTES
                |--------------------------------------------------------------------------
                |
                | IMPORTANT :
                | Une validation est maintenant créée pour CHAQUE cellule.
                | Cela évite les problèmes de compatibilité Excel liés à
                | l'utilisation de setSqref() sur une seule cellule.
                |
                */

                $this->ajouterListe(
                    $sheet,
                    'A',
                    '=ListeClasses',
                    false
                );

                $this->ajouterListe(
                    $sheet,
                    'E',
                    '=ListeSexes',
                    false
                );

                $this->ajouterListe(
                    $sheet,
                    'L',
                    '=ListeOuiNon',
                    false
                );

                $this->ajouterListe(
                    $sheet,
                    'M',
                    '=ListeOuiNon',
                    false
                );

                $this->ajouterListe(
                    $sheet,
                    'N',
                    '=ListeRegimes',
                    false
                );

                $this->ajouterListe(
                    $sheet,
                    'O',
                    '=ListeStatuts',
                    true
                );

                $this->ajouterListe(
                    $sheet,
                    'P',
                    '=ListeStatutAffectation',
                    false
                );

                $this->ajouterListe(
                    $sheet,
                    'AC',
                    '=ListeTypesTuteur',
                    false
                );

                $this->ajouterListe(
                    $sheet,
                    'AJ',
                    '=ListeGroupesSanguins',
                    true
                );

                /*
|--------------------------------------------------------------------------
| Détection visuelle des doublons de matricule
|--------------------------------------------------------------------------
*/

                $conditional = new Conditional();

                $conditional->setConditionType(
                    Conditional::CONDITION_EXPRESSION
                );

                $conditional->setOperatorType(
                    Conditional::OPERATOR_NONE
                );

                $conditional->setConditions([
                    'COUNTIF($B$2:$B$2001,B2)>1',
                ]);

                $conditional
                    ->getStyle()
                    ->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()
                    ->setARGB('FFFFC7CE');

                $conditional
                    ->getStyle()
                    ->getFont()
                    ->getColor()
                    ->setARGB('FF9C0006');

                $sheet
                    ->getStyle('B2:B2001')
                    ->setConditionalStyles([$conditional]);

                /*
                |--------------------------------------------------------------------------
                | DATE DE NAISSANCE
                |--------------------------------------------------------------------------
                */

                $sheet
                    ->getStyle('F2:F' . self::MAX_ROWS)
                    ->getNumberFormat()
                    ->setFormatCode('dd/mm/yyyy');

                /*
|--------------------------------------------------------------------------
| COLONNES TÉLÉPHONE
|--------------------------------------------------------------------------
|
| Les numéros doivent être traités comme du texte afin de :
| - conserver les zéros initiaux ;
| - éviter qu'Excel les transforme en nombres ;
| - éviter les erreurs de validation Laravel.
|
*/

                $sheet
                    ->getStyle('J2:J' . self::MAX_ROWS)
                    ->getNumberFormat()
                    ->setFormatCode('@');

                $sheet
                    ->getStyle('S2:S' . self::MAX_ROWS)
                    ->getNumberFormat()
                    ->setFormatCode('@');

                $sheet
                    ->getStyle('Y2:Y' . self::MAX_ROWS)
                    ->getNumberFormat()
                    ->setFormatCode('@');

                $sheet
                    ->getStyle('AF2:AF' . self::MAX_ROWS)
                    ->getNumberFormat()
                    ->setFormatCode('@');

                $sheet
                    ->getStyle('AM2:AM' . self::MAX_ROWS)
                    ->getNumberFormat()
                    ->setFormatCode('@');
                /*
                |--------------------------------------------------------------------------
                | FILTRE AUTOMATIQUE
                |--------------------------------------------------------------------------
                */

                $sheet->setAutoFilter(
                    'A1:AN' . self::MAX_ROWS
                );

                /*
                |--------------------------------------------------------------------------
                | FIGER LA PREMIÈRE LIGNE
                |--------------------------------------------------------------------------
                */

                $sheet->freezePane('A2');

                /*
                |--------------------------------------------------------------------------
                | FEUILLE ÉLÈVES ACTIVE À L'OUVERTURE
                |--------------------------------------------------------------------------
                */

                $spreadsheet = $sheet->getParent();

                $index = $spreadsheet->getIndex(
                    $sheet
                );

                $spreadsheet->setActiveSheetIndex($index);
            },
        ];
    }

    /**
     * Ajouter une validation de type liste à toute une colonne.
     *
     * Exemple :
     * A2:A2001 → =ListeClasses
     */
    /**
     * Ajouter une validation de type liste à toute une plage.
     */
    /**
     * Ajouter une validation de type liste sur chaque cellule de la plage.
     */
    /**
     * Ajouter une validation de type liste.
     *
     * Accepte :
     * - A2:A2001
     * - A
     */
    private function ajouterListe(
        Worksheet $sheet,
        string $range,
        string $formula,
        bool $allowBlank = true
    ): void {

        /*
     * Si seule la colonne est fournie
     * (exemple : "A"), on applique automatiquement
     * la validation de A2 à A2001.
     */
        if (!str_contains($range, ':')) {
            $colonne = strtoupper(trim($range));

            if ($colonne === '') {
                throw new \InvalidArgumentException(
                    'Colonne Excel vide.'
                );
            }

            $range = $colonne . '2:' . $colonne . '2001';
        }

        /*
     * Découpage de la plage.
     *
     * Exemple :
     * A2:A2001
     */
        [$debut, $fin] = explode(':', $range, 2);

        /*
     * Récupération de la colonne.
     *
     * A2:A2001 -> A
     */
        $colonne = preg_replace('/\d+$/', '', $debut);

        /*
     * Récupération des numéros de ligne.
     */
        $ligneDebut = (int) preg_replace('/\D/', '', $debut);
        $ligneFin = (int) preg_replace('/\D/', '', $fin);

        if (
            $colonne === '' ||
            $ligneDebut < 1 ||
            $ligneFin < $ligneDebut
        ) {
            throw new \InvalidArgumentException(
                "Plage Excel invalide : {$range}"
            );
        }

        /*
     * Création de la validation pour chaque cellule.
     */
        for (
            $ligne = $ligneDebut;
            $ligne <= $ligneFin;
            $ligne++
        ) {

            $cellule = $sheet->getCell(
                $colonne . $ligne
            );

            $validation = $cellule->getDataValidation();

            $validation->setType(
                DataValidation::TYPE_LIST
            );

            $validation->setErrorStyle(
                DataValidation::STYLE_STOP
            );

            $validation->setAllowBlank(
                $allowBlank
            );

            $validation->setShowInputMessage(
                true
            );

            $validation->setShowErrorMessage(
                true
            );

            /*
         * IMPORTANT :
         * false permet à Excel d'afficher la flèche
         * de la liste déroulante.
         */
            $validation->setShowDropDown(
                true
            );

            $validation->setErrorTitle(
                'Valeur incorrecte'
            );

            $validation->setError(
                'Veuillez sélectionner une valeur dans la liste proposée.'
            );

            $validation->setPromptTitle(
                'Liste autorisée'
            );

            $validation->setPrompt(
                'Sélectionnez une valeur dans la liste déroulante.'
            );

            $validation->setFormula1(
                $formula
            );
        }
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->getRowDimension(1)->setRowHeight(42);

        $sheet
            ->getStyle('A1:AN1')
            ->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => [
                        'argb' => 'FFFFFFFF',
                    ],
                ],

                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => [
                        'argb' => 'FF1D4ED8',
                    ],
                ],

                'alignment' => [
                    'horizontal' =>
                    Alignment::HORIZONTAL_CENTER,

                    'vertical' =>
                    Alignment::VERTICAL_CENTER,

                    'wrapText' => true,
                ],

                'borders' => [
                    'bottom' => [
                        'borderStyle' =>
                        Border::BORDER_MEDIUM,

                        'color' => [
                            'argb' => 'FF1E3A8A',
                        ],
                    ],
                ],
            ]);

        /*
        |--------------------------------------------------------------------------
        | Mise en évidence des colonnes utilisant une liste.
        |--------------------------------------------------------------------------
        */

        foreach (
            [
                'A',
                'E',
                'L',
                'M',
                'N',
                'O',
                'P',
                'AC',
                'AJ',
            ] as $colonne
        ) {

            $sheet
                ->getStyle(
                    "{$colonne}1:" .
                        "{$colonne}" .
                        self::MAX_ROWS
                )
                ->getFill()
                ->setFillType(Fill::FILL_SOLID);

            $sheet
                ->getStyle("{$colonne}1")
                ->getFont()
                ->setBold(true);
        }

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 22,
            'B' => 16,
            'C' => 20,
            'D' => 28,
            'E' => 14,
            'F' => 17,
            'G' => 24,
            'H' => 18,
            'I' => 30,
            'J' => 18,
            'K' => 28,

            'L' => 14,
            'M' => 14,
            'N' => 23,
            'O' => 18,
            'P' => 23,

            'Q' => 20,
            'R' => 28,
            'S' => 20,
            'T' => 28,
            'U' => 24,
            'V' => 30,

            'W' => 20,
            'X' => 28,
            'Y' => 20,
            'Z' => 28,
            'AA' => 24,
            'AB' => 30,

            'AC' => 18,
            'AD' => 20,
            'AE' => 28,
            'AF' => 20,
            'AG' => 28,
            'AH' => 24,
            'AI' => 30,

            'AJ' => 18,
            'AK' => 30,
            'AL' => 40,
            'AM' => 25,
            'AN' => 25,
        ];
    }
}
