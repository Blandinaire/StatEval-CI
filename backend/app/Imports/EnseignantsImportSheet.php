<?php

namespace App\Imports;

use App\Models\Enseignant;
use App\Models\Matiere;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class EnseignantsImportSheet implements
    ToCollection,
    WithHeadingRow,
    WithValidation,
    SkipsEmptyRows
{
    protected int $etablissementId;

    protected EnseignantsImport $importPrincipal;

    public function __construct(
        int $etablissementId,
        EnseignantsImport $importPrincipal
    ) {
        $this->etablissementId = $etablissementId;
        $this->importPrincipal = $importPrincipal;
    }

    /**
     * -------------------------------------------------------------------------
     * IMPORTATION
     * -------------------------------------------------------------------------
     */
    public function collection(Collection $rows): void
    {
        /*
        |--------------------------------------------------------------------------
        | CONTRÔLE DES DOUBLONS
        |--------------------------------------------------------------------------
        */

        $matriculesFonctionPublique = [];

        foreach ($rows as $index => $row) {

            /*
             * Avec WithHeadingRow :
             *
             * ligne Excel 1 = en-têtes
             * ligne Excel 2 = index 0
             *
             * Donc :
             */
            $numeroLigne = $index + 2;

            /*
            |--------------------------------------------------------------------------
            | MATRICULE FONCTION PUBLIQUE
            |--------------------------------------------------------------------------
            */

            $matriculeFP = $this->valeur(
                $row['matricule_fonction_publique'] ?? null
            );

            /*
             * Si aucun matricule fonction publique n'est fourni,
             * on ne contrôle pas ce champ.
             */
            if ($matriculeFP) {

                /*
                |------------------------------------------------------------------
                | Doublon dans le fichier Excel
                |------------------------------------------------------------------
                */

                if (isset($matriculesFonctionPublique[$matriculeFP])) {

                    throw new \RuntimeException(
                        "Importation impossible : le matricule fonction publique "
                        . "« {$matriculeFP} » apparaît plusieurs fois dans le fichier "
                        . "(lignes "
                        . $matriculesFonctionPublique[$matriculeFP]
                        . " et {$numeroLigne})."
                    );
                }

                $matriculesFonctionPublique[$matriculeFP] = $numeroLigne;

                /*
                |------------------------------------------------------------------
                | Doublon dans SchoolManager
                |------------------------------------------------------------------
                */

                $existant = Enseignant::where(
                    'matricule_fonction_publique',
                    $matriculeFP
                )->first();

                if ($existant) {

                    throw new \RuntimeException(
                        "Importation impossible : le matricule fonction publique "
                        . "« {$matriculeFP} » existe déjà pour l'enseignant "
                        . "{$existant->nom} {$existant->prenoms}."
                    );
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | IMPORTATION EN TRANSACTION
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use ($rows) {

            foreach ($rows as $index => $row) {

                $numeroLigne = $index + 2;

                /*
                |--------------------------------------------------------------------------
                | IDENTITÉ
                |--------------------------------------------------------------------------
                */

                $nom = $this->valeur(
                    $row['nom'] ?? null
                );

                $prenoms = $this->valeur(
                    $row['prenoms'] ?? null
                );

                $sexe = $this->normaliserSexe(
                    $row['sexe'] ?? null
                );

                /*
                |--------------------------------------------------------------------------
                | CRÉATION DE L'ENSEIGNANT
                |--------------------------------------------------------------------------
                */

                $enseignant = Enseignant::create([

                    /*
                    |--------------------------------------------------------------------------
                    | ÉTABLISSEMENT
                    |--------------------------------------------------------------------------
                    */

                    'etablissement_id' =>
                        $this->etablissementId,

                    /*
                    |--------------------------------------------------------------------------
                    | IDENTITÉ
                    |--------------------------------------------------------------------------
                    */

                    'nom' =>
                        $nom,

                    'prenoms' =>
                        $prenoms,

                    'sexe' =>
                        $sexe,

                    'date_naissance' =>
                        $this->normaliserDate(
                            $row['date_naissance'] ?? null
                        ),

                    'lieu_naissance' =>
                        $this->valeur(
                            $row['lieu_naissance'] ?? null
                        ),

                    'nationalite' =>
                        $this->valeur(
                            $row['nationalite'] ?? null
                        ) ?: 'Ivoirienne',

                    /*
                    |--------------------------------------------------------------------------
                    | COORDONNÉES
                    |--------------------------------------------------------------------------
                    */

                    'telephone' =>
                        $this->valeur(
                            $row['telephone'] ?? null
                        ),

                    'email' =>
                        $this->valeur(
                            $row['email'] ?? null
                        ),

                    'adresse' =>
                        $this->valeur(
                            $row['adresse'] ?? null
                        ),

                    /*
                    |--------------------------------------------------------------------------
                    | INFORMATIONS ADMINISTRATIVES
                    |--------------------------------------------------------------------------
                    */

                    'matricule_fonction_publique' =>
                        $this->valeur(
                            $row['matricule_fonction_publique'] ?? null
                        ),

                    'type' =>
                        $this->normaliserType(
                            $row['type'] ?? null
                        ),

                    'grade' =>
                        $this->valeur(
                            $row['grade'] ?? null
                        ),

                    'diplome' =>
                        $this->valeur(
                            $row['diplome'] ?? null
                        ),

                    /*
                    |--------------------------------------------------------------------------
                    | DATES ADMINISTRATIVES
                    |--------------------------------------------------------------------------
                    */

                    'date_embauche' =>
                        $this->normaliserDate(
                            $row['date_embauche'] ?? null
                        ),

                    'date_prise_service' =>
                        $this->normaliserDate(
                            $row['date_prise_service'] ?? null
                        ),

                    /*
                    |--------------------------------------------------------------------------
                    | PÉDAGOGIE
                    |--------------------------------------------------------------------------
                    */

                    'matiere_principale_id' =>
                        $this->matiereId(
                            $row['matiere_principale'] ?? null
                        ),

                    'matiere_secondaire_id' =>
                        $this->matiereId(
                            $row['matiere_secondaire'] ?? null
                        ),

                    'volume_horaire' =>
                        $this->entier(
                            $row['volume_horaire'] ?? 0
                        ),

                    'nb_classes_max' =>
                        $this->entier(
                            $row['nb_classes_max'] ?? 10
                        ),

                    /*
                    |--------------------------------------------------------------------------
                    | STATUT
                    |--------------------------------------------------------------------------
                    */

                    'statut' =>
                        $this->normaliserStatut(
                            $row['statut'] ?? null
                        ),

                    'actif' =>
                        $this->convertirOuiNon(
                            $row['actif'] ?? 'Oui'
                        ),

                    /*
                    |--------------------------------------------------------------------------
                    | MATRICULE INTERNE
                    |--------------------------------------------------------------------------
                    |
                    | Généré après création grâce à l'ID.
                    |
                    */

                    'matricule' => null,
                ]);

                /*
                |--------------------------------------------------------------------------
                | MATRICULE INTERNE AUTOMATIQUE
                |--------------------------------------------------------------------------
                */

                $enseignant->update([
                    'matricule' => 'ENS-' . str_pad(
                        (string) $enseignant->id,
                        5,
                        '0',
                        STR_PAD_LEFT
                    ),
                ]);

                /*
                |--------------------------------------------------------------------------
                | COMPTEUR
                |--------------------------------------------------------------------------
                */

                $this->importPrincipal->nombreImportes++;
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    public function rules(): array
    {
        return [

            /*
            |--------------------------------------------------------------------------
            | CHAMPS OBLIGATOIRES
            |--------------------------------------------------------------------------
            */

            '*.nom' => [
                'required',
                'string',
                'max:100',
            ],

            '*.prenoms' => [
                'required',
                'string',
                'max:150',
            ],

            '*.sexe' => [
                'required',
                'in:Masculin,Féminin',
            ],

            /*
            |--------------------------------------------------------------------------
            | CHAMPS FACULTATIFS
            |--------------------------------------------------------------------------
            */

            '*.date_naissance' => [
                'nullable',
            ],

            '*.lieu_naissance' => [
                'nullable',
                'string',
                'max:150',
            ],

            '*.nationalite' => [
                'nullable',
                'string',
                'max:100',
            ],

            '*.telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            '*.email' => [
                'nullable',
                'email',
                'max:255',
            ],

            '*.adresse' => [
                'nullable',
                'string',
            ],

            '*.matricule_fonction_publique' => [
                'nullable',
                'string',
                'max:100',
            ],

            '*.type' => [
                'nullable',
                'in:Permanent,Vacataire,Contractuel',
            ],

            '*.grade' => [
                'nullable',
                'string',
                'max:100',
            ],

            '*.diplome' => [
                'nullable',
                'string',
                'max:150',
            ],

            '*.matiere_principale' => [
                'nullable',
                'string',
                'max:150',
            ],

            '*.matiere_secondaire' => [
                'nullable',
                'string',
                'max:150',
            ],

            '*.volume_horaire' => [
                'nullable',
                'integer',
                'min:0',
            ],

            '*.nb_classes_max' => [
                'nullable',
                'integer',
                'min:0',
            ],

            '*.statut' => [
                'nullable',
                'in:Actif,Suspendu,Retraité',
            ],

            '*.actif' => [
                'nullable',
                'in:Oui,Non',
            ],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | MESSAGES DE VALIDATION
    |--------------------------------------------------------------------------
    */

    public function customValidationMessages(): array
    {
        return [

            /*
            | Identité
            */

            '*.nom.required' =>
                'Le nom est obligatoire.',

            '*.nom.string' =>
                'Le nom doit être une chaîne de caractères.',

            '*.nom.max' =>
                'Le nom ne doit pas dépasser 100 caractères.',

            '*.prenoms.required' =>
                'Les prénoms sont obligatoires.',

            '*.prenoms.string' =>
                'Les prénoms doivent être une chaîne de caractères.',

            '*.prenoms.max' =>
                'Les prénoms ne doivent pas dépasser 150 caractères.',

            '*.sexe.required' =>
                'Le sexe est obligatoire.',

            '*.sexe.in' =>
                'Le sexe doit être Masculin ou Féminin.',

            /*
            | Coordonnées
            */

            '*.email.email' =>
                "L'adresse e-mail n'est pas valide.",

            '*.email.max' =>
                "L'adresse e-mail ne doit pas dépasser 255 caractères.",

            /*
            | Administration
            */

            '*.type.in' =>
                "Le type d'enseignant doit être Permanent, Vacataire ou Contractuel.",

            '*.statut.in' =>
                "Le statut doit être Actif, Suspendu ou Retraité.",

            '*.actif.in' =>
                'Le champ actif doit être Oui ou Non.',

            /*
            | Pédagogie
            */

            '*.volume_horaire.integer' =>
                'Le volume horaire doit être un nombre entier.',

            '*.volume_horaire.min' =>
                'Le volume horaire ne peut pas être négatif.',

            '*.nb_classes_max.integer' =>
                'Le nombre maximal de classes doit être un nombre entier.',

            '*.nb_classes_max.min' =>
                'Le nombre maximal de classes ne peut pas être négatif.',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | PRÉPARATION DES DONNÉES
    |--------------------------------------------------------------------------
    */

    public function prepareForValidation($data, $index)
    {
        /*
        |--------------------------------------------------------------------------
        | Champs texte
        |--------------------------------------------------------------------------
        */

        $champsTexte = [
            'nom',
            'prenoms',
            'sexe',
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
            'statut',
            'actif',
        ];

        foreach ($champsTexte as $champ) {

            if (!array_key_exists($champ, $data)) {
                continue;
            }

            if ($data[$champ] === null) {
                continue;
            }

            $data[$champ] = trim(
                (string) $data[$champ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SEXE
        |--------------------------------------------------------------------------
        */

        if (
            isset($data['sexe']) &&
            $data['sexe'] !== ''
        ) {
            $data['sexe'] = $this->normaliserSexe(
                $data['sexe']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | TYPE
        |--------------------------------------------------------------------------
        */

        if (
            isset($data['type']) &&
            $data['type'] !== ''
        ) {
            $data['type'] = $this->normaliserType(
                $data['type']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | STATUT
        |--------------------------------------------------------------------------
        */

        if (
            isset($data['statut']) &&
            $data['statut'] !== ''
        ) {
            $data['statut'] = $this->normaliserStatut(
                $data['statut']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ACTIF
        |--------------------------------------------------------------------------
        */

        if (
            isset($data['actif']) &&
            $data['actif'] !== ''
        ) {
            $data['actif'] = $this->normaliserOuiNonTexte(
                $data['actif']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Champs numériques
        |--------------------------------------------------------------------------
        */

        foreach ([
            'volume_horaire',
            'nb_classes_max',
        ] as $champ) {

            if (
                isset($data[$champ]) &&
                $data[$champ] !== ''
            ) {
                $data[$champ] = (int) $data[$champ];
            }
        }

        return $data;
    }

    /*
    |--------------------------------------------------------------------------
    | OUTILS
    |--------------------------------------------------------------------------
    */

    /**
     * Nettoyage général d'une valeur.
     */
    private function valeur(mixed $valeur): ?string
    {
        if ($valeur === null) {
            return null;
        }

        $valeur = trim((string) $valeur);

        return $valeur === ''
            ? null
            : $valeur;
    }

    /**
     * Conversion en entier.
     */
    private function entier(mixed $valeur): int
    {
        if ($valeur === null || $valeur === '') {
            return 0;
        }

        return (int) $valeur;
    }

    /**
     * Conversion Oui / Non en booléen.
     */
    private function convertirOuiNon(mixed $valeur): bool
    {
        if ($valeur === null || $valeur === '') {
            return true;
        }

        $valeur = mb_strtolower(
            trim((string) $valeur),
            'UTF-8'
        );

        return match ($valeur) {
            'oui',
            'yes',
            '1',
            'true',
            'vrai' => true,

            'non',
            'no',
            '0',
            'false',
            'faux' => false,

            default => true,
        };
    }

    /**
     * Normalisation du champ Oui / Non avant validation.
     */
    private function normaliserOuiNonTexte(mixed $valeur): ?string
    {
        if ($valeur === null || $valeur === '') {
            return null;
        }

        $valeur = mb_strtolower(
            trim((string) $valeur),
            'UTF-8'
        );

        return match ($valeur) {
            'oui',
            'yes',
            '1',
            'true',
            'vrai' => 'Oui',

            'non',
            'no',
            '0',
            'false',
            'faux' => 'Non',

            default => (string) $valeur,
        };
    }

    /**
     * Normalisation du sexe.
     */
    private function normaliserSexe(mixed $sexe): ?string
    {
        if ($sexe === null || $sexe === '') {
            return null;
        }

        $sexe = mb_strtolower(
            trim((string) $sexe),
            'UTF-8'
        );

        return match ($sexe) {

            'masculin',
            'm' => 'Masculin',

            'féminin',
            'feminin',
            'f' => 'Féminin',

            default => null,
        };
    }

    /**
     * Normalisation du type d'enseignant.
     */
    private function normaliserType(mixed $type): string
    {
        if ($type === null || trim((string) $type) === '') {
            return 'Vacataire';
        }

        $type = mb_strtolower(
            trim((string) $type),
            'UTF-8'
        );

        return match ($type) {

            'permanent' =>
                'Permanent',

            'vacataire' =>
                'Vacataire',

            'contractuel' =>
                'Contractuel',

            default =>
                (string) $type,
        };
    }

    /**
     * Normalisation du statut.
     */
    private function normaliserStatut(mixed $statut): string
    {
        if ($statut === null || trim((string) $statut) === '') {
            return 'Actif';
        }

        $statut = mb_strtolower(
            trim((string) $statut),
            'UTF-8'
        );

        return match ($statut) {

            'actif' =>
                'Actif',

            'suspendu' =>
                'Suspendu',

            'retraité',
            'retraite' =>
                'Retraité',

            default =>
                (string) $statut,
        };
    }

    /**
     * Conversion des dates.
     *
     * Accepte :
     *
     * - YYYY-MM-DD
     * - DD/MM/YYYY
     * - date Excel numérique
     */
    private function normaliserDate(mixed $date): ?string
    {
        if ($date === null || $date === '') {
            return null;
        }

        /*
        |--------------------------------------------------------------------------
        | Date déjà au format YYYY-MM-DD
        |--------------------------------------------------------------------------
        */

        if (
            is_string($date) &&
            preg_match(
                '/^\d{4}-\d{2}-\d{2}$/',
                trim($date)
            )
        ) {
            return trim($date);
        }

        /*
        |--------------------------------------------------------------------------
        | Date DD/MM/YYYY
        |--------------------------------------------------------------------------
        */

        if (
            is_string($date) &&
            preg_match(
                '/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/',
                trim($date),
                $matches
            )
        ) {
            return sprintf(
                '%04d-%02d-%02d',
                $matches[3],
                $matches[2],
                $matches[1]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Date Excel
        |--------------------------------------------------------------------------
        */

        if (is_numeric($date)) {

            try {

                return ExcelDate::excelToDateTimeObject(
                    $date
                )->format('Y-m-d');

            } catch (\Throwable) {

                return null;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Dernière tentative avec DateTime
        |--------------------------------------------------------------------------
        */

        if (is_string($date)) {

            try {

                return \Carbon\Carbon::parse(
                    trim($date)
                )->format('Y-m-d');

            } catch (\Throwable) {

                return null;
            }
        }

        return null;
    }

    /**
     * Recherche l'identifiant d'une matière à partir de son libellé.
     *
     * Exemple :
     *
     * "Mathématiques"
     * "mathématiques"
     * " MATHEMATIQUES "
     *
     * sont considérés comme la même matière.
     */
    private function matiereId(mixed $libelle): ?int
    {
        $libelle = $this->valeur($libelle);

        if (!$libelle) {
            return null;
        }

        $matiere = Matiere::whereRaw(
            'LOWER(TRIM(libelle)) = ?',
            [
                mb_strtolower(
                    $libelle,
                    'UTF-8'
                ),
            ]
        )->first();

        return $matiere?->id;
    }
}