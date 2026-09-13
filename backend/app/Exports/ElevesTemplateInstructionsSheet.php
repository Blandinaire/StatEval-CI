<?php

namespace App\Exports;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Etablissement;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\NamedRange;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ElevesTemplateInstructionsSheet implements
    FromArray,
    WithTitle,
    WithStyles,
    WithColumnWidths,
    WithEvents
{
    private string $etablissement;
    private string $anneeScolaire;

    public function __construct(
        private int $etablissementId,
        private int $anneeScolaireId
    ) {
        $this->etablissement =
            Etablissement::find($this->etablissementId)?->nom
            ?? 'Établissement non trouvé';

        $annee = AnneeScolaire::find($this->anneeScolaireId);

        $this->anneeScolaire =
            $annee?->libelle
            ?? trim(
                ($annee?->date_debut ?? '') .
                    ' - ' .
                    ($annee?->date_fin ?? '')
            );
    }

    public function title(): string
    {
        return 'Instructions';
    }

    public function array(): array
    {
        return [
            [
                'MODÈLE PROFESSIONNEL D’IMPORTATION DES ÉLÈVES',
            ],

            [],

            [
                'Établissement',
                $this->etablissement,
            ],

            [
                'Année scolaire',
                $this->anneeScolaire,
            ],

            [],

            [
                'RÈGLES IMPORTANTES',
            ],

            [
                '1.',
                'Ne modifiez jamais les noms des colonnes de la feuille « Élèves ».'
            ],

            [
                '2.',
                'L’établissement et l’année scolaire sont déjà sélectionnés dans StatEval-CI.'
            ],

            [
                '3.',
                'La classe de chaque élève doit être sélectionnée dans la liste déroulante.'
            ],

            [
                '4.',
                'Les champs disposant d’une liste déroulante doivent être renseignés à partir de cette liste.'
            ],

            [
                '5.',
                'Les champs Oui/Non doivent également être sélectionnés dans leur liste déroulante.'
            ],

            [
                '6.',
                'La date de naissance doit être saisie au format JJ/MM/AAAA.'
            ],

            [
                '7.',
                'Ne supprimez pas les colonnes du modèle.'
            ],

            [
                '8.',
                'Ne laissez pas de ligne vide au milieu des élèves.'
            ],

            [
                '9.',
                'Le fichier doit être enregistré au format XLSX avant son importation.'
            ],

            [
                '10.',
                'Le modèle est prévu pour environ 2 000 élèves.'
            ],

            [],

            [
                'CHAMPS OBLIGATOIRES',
            ],

            [
                'Champ',
                'Obligation',
                'Description',
            ],

            [
                'classe',
                'OBLIGATOIRE',
                'Classe de l’élève.',
            ],

            [
                'nom',
                'OBLIGATOIRE',
                'Nom de famille.',
            ],

            [
                'prenoms',
                'OBLIGATOIRE',
                'Prénoms.',
            ],

            [
                'sexe',
                'OBLIGATOIRE',
                'Masculin ou Féminin.',
            ],

            [
                'regime',
                'OBLIGATOIRE',
                'Externe, Demi-pensionnaire ou Interne.',
            ],

            [
                'statut_affectation',
                'OBLIGATOIRE',
                'Affecté ou Non affecté.',
            ],

            [
                'type_tuteur',
                'OBLIGATOIRE',
                'Père, Mère ou Autre.',
            ],

            [],

            [
                'LISTES DÉROULANTES',
            ],

            [
                'Champ',
                'Valeurs autorisées',
            ],

            [
                'classe',
                'Classes actives de l’établissement et de l’année scolaire sélectionnés.',
            ],

            [
                'sexe',
                'Masculin / Féminin',
            ],

            [
                'redoublant',
                'Oui / Non',
            ],

            [
                'boursier',
                'Oui / Non',
            ],

            [
                'regime',
                'Externe / Demi-pensionnaire / Interne',
            ],

            [
                'statut',
                'Actif / Transféré / Exclu / Abandonné / Diplômé',
            ],

            [
                'statut_affectation',
                'Affecté / Non affecté',
            ],

            [
                'type_tuteur',
                'Père / Mère / Autre',
            ],

            [
                'groupe_sanguin',
                'A+ / A- / B+ / B- / AB+ / AB- / O+ / O-',
            ],

            [],

            [
                'IMPORTANT',
            ],

            [
                'Les listes déroulantes sont générées automatiquement par StatEval-CI.',
            ],

            [
                'La liste des classes correspond uniquement à l’établissement et à l’année scolaire sélectionnés.',
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {

                $sheet = $event->sheet->getDelegate();

                $spreadsheet = $sheet->getParent();

                /*
                |--------------------------------------------------------------------------
                | Récupération des classes
                |--------------------------------------------------------------------------
                */

                $classes = Classe::query()
                    ->where(
                        'etablissement_id',
                        $this->etablissementId
                    )
                    ->where(
                        'annee_scolaire_id',
                        $this->anneeScolaireId
                    )
                    ->where('active', true)
                    ->orderBy('libelle')
                    ->pluck('libelle')
                    ->filter()
                    ->values()
                    ->all();

                if (empty($classes)) {
                    $classes = [
                        'Aucune classe disponible',
                    ];
                }

                /*
                |--------------------------------------------------------------------------
                | Listes utilisées par les menus déroulants
                |--------------------------------------------------------------------------
                */

                $listes = [

                    'ListeClasses' => [
                        'colonne' => 'J',
                        'valeurs' => $classes,
                    ],

                    'ListeSexes' => [
                        'colonne' => 'K',
                        'valeurs' => [
                            'Masculin',
                            'Féminin',
                        ],
                    ],

                    'ListeRegimes' => [
                        'colonne' => 'L',
                        'valeurs' => [
                            'Externe',
                            'Demi-pensionnaire',
                            'Interne',
                        ],
                    ],

                    'ListeStatuts' => [
                        'colonne' => 'M',
                        'valeurs' => [
                            'Actif',
                            'Transféré',
                            'Exclu',
                            'Abandonné',
                            'Diplômé',
                        ],
                    ],

                    'ListeStatutAffectation' => [
                        'colonne' => 'N',
                        'valeurs' => [
                            'Affecté',
                            'Non affecté',
                        ],
                    ],

                    'ListeTypesTuteur' => [
                        'colonne' => 'O',
                        'valeurs' => [
                            'Père',
                            'Mère',
                            'Autre',
                        ],
                    ],

                    'ListeGroupesSanguins' => [
                        'colonne' => 'P',
                        'valeurs' => [
                            'A+',
                            'A-',
                            'B+',
                            'B-',
                            'AB+',
                            'AB-',
                            'O+',
                            'O-',
                        ],
                    ],

                    'ListeOuiNon' => [
                        'colonne' => 'Q',
                        'valeurs' => [
                            'Oui',
                            'Non',
                        ],
                    ],
                ];

                /*
                |--------------------------------------------------------------------------
                | Écriture des listes techniques
                |--------------------------------------------------------------------------
                */

                foreach ($listes as $nom => $configuration) {

                    $colonne = $configuration['colonne'];
                    $valeurs = $configuration['valeurs'];

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

                    $premiereLigne = 2;

                    $derniereLigne =
                        count($valeurs) + 1;

                    /*
                    |--------------------------------------------------------------------------
                    | Plage nommée Excel
                    |--------------------------------------------------------------------------
                    */

                    $spreadsheet->addNamedRange(
                        new NamedRange(
                            $nom,
                            $sheet,
                            '$' . $colonne . '$' . $premiereLigne .
                                ':$' . $colonne . '$' . $derniereLigne,
                            false
                        )
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Masquer la colonne technique
                    |--------------------------------------------------------------------------
                    */

                    $sheet
                        ->getColumnDimension($colonne)
                        ->setVisible(false);
                }

                /*
                |--------------------------------------------------------------------------
                | Formatage des informations techniques
                |--------------------------------------------------------------------------
                */

                $sheet
                    ->getStyle('J1:Q100')
                    ->getAlignment()
                    ->setVertical(
                        Alignment::VERTICAL_CENTER
                    );
            },
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->mergeCells('A1:G1');

        $sheet->mergeCells('A6:G6');

        $sheet->mergeCells('A18:G18');

        $sheet->mergeCells('A28:G28');

        $sheet->mergeCells('A40:G40');

        $sheet->getRowDimension(1)->setRowHeight(32);

        $sheet
            ->getStyle('A1:G1')
            ->applyFromArray([
                'font' => [
                    'bold' => true,
                    'size' => 16,
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
                ],
            ]);

        foreach (
            [
                'A6:G6',
                'A18:G18',
                'A28:G28',
                'A40:G40',
            ] as $range
        ) {

            $sheet
                ->getStyle($range)
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
                            'argb' => 'FF2563EB',
                        ],
                    ],
                ]);
        }

        $sheet
            ->getStyle('A1:G60')
            ->getAlignment()
            ->setWrapText(true);

        $sheet
            ->getStyle('A1:G60')
            ->getAlignment()
            ->setVertical(
                Alignment::VERTICAL_CENTER
            );

        $sheet->freezePane('A7');

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 28,
            'B' => 42,
            'C' => 60,
            'D' => 20,
            'E' => 20,
            'F' => 20,
            'G' => 20,

            'J' => 25,
            'K' => 20,
            'L' => 25,
            'M' => 25,
            'N' => 25,
            'O' => 20,
            'P' => 20,
            'Q' => 15,
        ];
    }
}
