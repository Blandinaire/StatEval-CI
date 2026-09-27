<?php

namespace App\Exports;

use App\Models\Classe;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ElevesCorrectionSheet implements
    FromArray,
    WithHeadings,
    WithTitle,
    WithStyles,
    WithColumnWidths,
    WithEvents
{
    private const MAX_ROWS = 2001;

    private array $headings = [
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
        'erreur_importation',
        'correction_a_apporter',
    ];

    public function __construct(
        private array $lignes,
        private int $etablissementId,
        private int $anneeScolaireId
    ) {}

    public function title(): string
    {
        return 'Élèves';
    }

    public function headings(): array
    {
        return $this->headings;
    }

    public function array(): array
    {
        return array_map(function (array $ligne) {

            $row = [];

            foreach (array_slice($this->headings, 0, 40) as $champ) {
                $row[] = $ligne['donnees'][$champ]
                    ?? $ligne[$champ]
                    ?? null;
            }

            $row[] = $ligne['erreur_importation'] ?? '';
            $row[] = $ligne['correction_a_apporter'] ?? '';

            return $row;
        }, $this->lignes);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {

                /** @var Worksheet $sheet */
                $sheet = $event->sheet->getDelegate();

                $this->ajouterListesTechniques($sheet);
                $this->ajouterValidations($sheet);
                $this->appliquerFormats($sheet);
                $this->appliquerMiseEnForme($sheet);

                $derniereLigne = max(2, count($this->lignes) + 1);

                $sheet->setAutoFilter(
                    'A1:AP' . $derniereLigne
                );

                $sheet->freezePane('A2');

                /*
                 * Les colonnes d'erreur restent visibles.
                 */
                $sheet->getColumnDimension('AO')->setWidth(50);
                $sheet->getColumnDimension('AP')->setWidth(50);
            },
        ];
    }

    private function ajouterValidations(Worksheet $sheet): void
    {
        $this->ajouterListe(
            $sheet,
            'A',
            $this->formulaListe($sheet, 'classes')
        );

        $this->ajouterListe(
            $sheet,
            'E',
            $this->formulaListe($sheet, 'sexes')
        );

        $this->ajouterListe(
            $sheet,
            'L',
            $this->formulaListe($sheet, 'oui_non')
        );

        $this->ajouterListe(
            $sheet,
            'M',
            $this->formulaListe($sheet, 'oui_non')
        );

        $this->ajouterListe(
            $sheet,
            'N',
            $this->formulaListe($sheet, 'regimes')
        );

        $this->ajouterListe(
            $sheet,
            'O',
            $this->formulaListe($sheet, 'statuts')
        );

        $this->ajouterListe(
            $sheet,
            'P',
            $this->formulaListe($sheet, 'statut_affectation')
        );

        $this->ajouterListe(
            $sheet,
            'AC',
            $this->formulaListe($sheet, 'types_tuteur')
        );

        $this->ajouterListe(
            $sheet,
            'AJ',
            $this->formulaListe($sheet, 'groupes_sanguins')
        );
    }

    private function ajouterListesTechniques(Worksheet $sheet): void
    {
        $classes = Classe::query()
            ->where('etablissement_id', $this->etablissementId)
            ->where('annee_scolaire_id', $this->anneeScolaireId)
            ->where('active', true)
            ->orderBy('libelle')
            ->pluck('libelle')
            ->filter()
            ->values()
            ->all();

        if (!$classes) {
            $classes = ['Aucune classe disponible'];
        }

        $listes = [
            'classes' => $classes,

            'sexes' => [
                'Masculin',
                'Féminin',
            ],

            'oui_non' => [
                'Oui',
                'Non',
            ],

            'regimes' => [
                'Externe',
                'Demi-pensionnaire',
                'Interne',
            ],

            'statuts' => [
                'Actif',
                'Transféré',
                'Exclu',
                'Abandonné',
                'Diplômé',
            ],

            'statut_affectation' => [
                'Affecté',
                'Non affecté',
            ],

            'types_tuteur' => [
                'Père',
                'Mère',
                'Autre',
            ],

            'groupes_sanguins' => [
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-',
            ],
        ];

        /*
         * AQ:AX = colonnes techniques masquées.
         */
        $colonnes = [
            'classes' => 'AQ',
            'sexes' => 'AR',
            'oui_non' => 'AS',
            'regimes' => 'AT',
            'statuts' => 'AU',
            'statut_affectation' => 'AV',
            'types_tuteur' => 'AW',
            'groupes_sanguins' => 'AX',
        ];

        foreach ($listes as $nom => $valeurs) {

            $colonne = $colonnes[$nom];

            $sheet->setCellValue(
                "{$colonne}1",
                $nom
            );

            foreach ($valeurs as $index => $valeur) {
                $sheet->setCellValue(
                    "{$colonne}" . ($index + 2),
                    $valeur
                );
            }

            $sheet
                ->getColumnDimension($colonne)
                ->setVisible(false);
        }
    }

    private function formulaListe(
        Worksheet $sheet,
        string $liste
    ): string {

        $colonnes = [
            'classes' => 'AQ',
            'sexes' => 'AR',
            'oui_non' => 'AS',
            'regimes' => 'AT',
            'statuts' => 'AU',
            'statut_affectation' => 'AV',
            'types_tuteur' => 'AW',
            'groupes_sanguins' => 'AX',
        ];

        $colonne = $colonnes[$liste];

        $highestRow = $sheet
            ->getHighestRow();

        /*
         * Les listes techniques sont écrites avant
         * l'application des validations.
         */
        $nbValeurs = match ($liste) {
            'classes' => max(
                1,
                Classe::query()
                    ->where('etablissement_id', $this->etablissementId)
                    ->where('annee_scolaire_id', $this->anneeScolaireId)
                    ->where('active', true)
                    ->count()
            ),

            'sexes' => 2,
            'oui_non' => 2,
            'regimes' => 3,
            'statuts' => 5,
            'statut_affectation' => 2,
            'types_tuteur' => 3,
            'groupes_sanguins' => 8,
        };

        return "=\${$colonne}\$2:\${$colonne}\$" .
            ($nbValeurs + 1);
    }

    private function ajouterListe(
        Worksheet $sheet,
        string $colonne,
        string $formula,
        bool $allowBlank = true
    ): void {

        for ($ligne = 2; $ligne <= self::MAX_ROWS; $ligne++) {

            $validation = $sheet
                ->getCell("{$colonne}{$ligne}")
                ->getDataValidation();

            $validation->setType(
                DataValidation::TYPE_LIST
            );

            $validation->setErrorStyle(
                DataValidation::STYLE_STOP
            );

            $validation->setAllowBlank(
                $allowBlank
            );

            $validation->setShowInputMessage(true);
            $validation->setShowErrorMessage(true);
            $validation->setShowDropDown(true);

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

            $validation->setFormula1($formula);
        }
    }

    private function appliquerFormats(Worksheet $sheet): void
    {
        $sheet
            ->getStyle('F2:F' . self::MAX_ROWS)
            ->getNumberFormat()
            ->setFormatCode('dd/mm/yyyy');

        foreach (
            [
                'J',
                'S',
                'Y',
                'AF',
                'AN',
            ] as $colonne
        ) {

            $sheet
                ->getStyle(
                    "{$colonne}2:{$colonne}" . self::MAX_ROWS
                )
                ->getNumberFormat()
                ->setFormatCode('@');
        }
    }

    private function appliquerMiseEnForme(Worksheet $sheet): void
    {
        $sheet->getRowDimension(1)->setRowHeight(45);

        $sheet
            ->getStyle('A1:AP1')
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
         * Colonnes d'erreur.
         */
        $sheet
            ->getStyle('AO1:AP' . self::MAX_ROWS)
            ->getAlignment()
            ->setWrapText(true);
    }

    public function styles(Worksheet $sheet): array
    {
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
            'AO' => 50,
            'AP' => 50,
        ];
    }
}
