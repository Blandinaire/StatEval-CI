<?php

namespace App\Imports;

use App\Models\Classe;
use App\Models\Eleve;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ElevesSheetImport implements
    ToCollection,
    WithHeadingRow,
    WithValidation,
    SkipsEmptyRows
{
    protected int $etablissementId;

    protected int $anneeScolaireId;

    public int $nombreImportes = 0;

    public function __construct(
        int $etablissementId,
        int $anneeScolaireId
    ) {
        $this->etablissementId = $etablissementId;
        $this->anneeScolaireId = $anneeScolaireId;
    }

    /**
     * Importer les élèves depuis la feuille "Élèves".
     */
    public function collection(Collection $rows): void
    {
        /*
        |--------------------------------------------------------------------------
        | CONTRÔLE DES DOUBLONS DE MATRICULE
        |--------------------------------------------------------------------------
        |
        | 1. Vérification des doublons à l'intérieur du fichier Excel.
        | 2. Vérification des matricules déjà présents dans StatEval-CI.
        |
        | Un matricule vide est autorisé.
        |
        */

        $matricules = [];

        foreach ($rows as $index => $row) {

            /*
            |--------------------------------------------------------------------------
            | Numéro réel de ligne Excel
            |--------------------------------------------------------------------------
            |
            | La ligne 1 contient les en-têtes.
            | La première ligne de données est donc la ligne 2.
            |
            */

            $numeroLigne = $index + 2;

            $matricule = $this->valeur(
                $row['matricule'] ?? null
            );

            /*
            |--------------------------------------------------------------------------
            | Matricule vide
            |--------------------------------------------------------------------------
            */

            if (!$matricule) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Doublon dans le fichier Excel
            |--------------------------------------------------------------------------
            */

            if (isset($matricules[$matricule])) {

                throw new \RuntimeException(
                    "Importation impossible : le matricule "
                        . "« {$matricule} » apparaît plusieurs fois "
                        . "dans le fichier Excel "
                        . "(lignes {$matricules[$matricule]} et {$numeroLigne})."
                );
            }

            $matricules[$matricule] = $numeroLigne;

            /*
            |--------------------------------------------------------------------------
            | Doublon dans StatEval-CI
            |--------------------------------------------------------------------------
            */

            $eleveExistant = Eleve::where(
                'matricule',
                $matricule
            )->first();

            if ($eleveExistant) {

                throw new \RuntimeException(
                    "Importation impossible : le matricule "
                        . "« {$matricule} » existe déjà dans StatEval-CI "
                        . "pour l'élève "
                        . "{$eleveExistant->nom} "
                        . "{$eleveExistant->prenoms}."
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | IMPORTATION
        |--------------------------------------------------------------------------
        |
        | Toutes les validations et vérifications doivent être terminées
        | avant d'arriver ici.
        |
        | Si une erreur survient pendant l'importation, toute la transaction
        | est annulée.
        |
        */

        DB::transaction(function () use ($rows) {

            foreach ($rows as $index => $row) {

                $numeroLigne = $index + 2;

                /*
                |--------------------------------------------------------------------------
                | CLASSE
                |--------------------------------------------------------------------------
                */

                $libelleClasse = $this->valeur(
                    $row['classe'] ?? null
                );

                $classe = Classe::where(
                    'etablissement_id',
                    $this->etablissementId
                )
                    ->where(
                        'annee_scolaire_id',
                        $this->anneeScolaireId
                    )
                    ->whereRaw(
                        'LOWER(TRIM(libelle)) = ?',
                        [mb_strtolower($libelleClasse ?? '')]
                    )
                    ->first();

                if (!$classe) {

                    throw new \RuntimeException(
                        "Ligne {$numeroLigne} : la classe "
                            . "« {$libelleClasse} » n'existe pas "
                            . "dans l'établissement et l'année scolaire "
                            . "sélectionnés."
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | TYPE DE TUTEUR
                |--------------------------------------------------------------------------
                */

                $typeTuteur = $this->valeur(
                    $row['type_tuteur'] ?? null
                );

                /*
                |--------------------------------------------------------------------------
                | PRÉPARATION DU RESPONSABLE LÉGAL
                |--------------------------------------------------------------------------
                */

                $responsableNom = null;
                $responsablePrenoms = null;
                $responsableTelephone = null;
                $responsableEmail = null;
                $responsableProfession = null;
                $responsableAdresse = null;

                /*
                |--------------------------------------------------------------------------
                | PÈRE
                |--------------------------------------------------------------------------
                */

                if ($typeTuteur === 'Père') {

                    $responsableNom =
                        $this->valeur(
                            $row['pere_nom'] ?? null
                        );

                    $responsablePrenoms =
                        $this->valeur(
                            $row['pere_prenoms'] ?? null
                        );

                    $responsableTelephone =
                        $this->valeur(
                            $row['pere_telephone'] ?? null
                        );

                    $responsableEmail =
                        $this->valeur(
                            $row['pere_email'] ?? null
                        );

                    $responsableProfession =
                        $this->valeur(
                            $row['pere_profession'] ?? null
                        );

                    $responsableAdresse =
                        $this->valeur(
                            $row['pere_adresse'] ?? null
                        );
                }

                /*
                |--------------------------------------------------------------------------
                | MÈRE
                |--------------------------------------------------------------------------
                */ elseif ($typeTuteur === 'Mère') {

                    $responsableNom =
                        $this->valeur(
                            $row['mere_nom'] ?? null
                        );

                    $responsablePrenoms =
                        $this->valeur(
                            $row['mere_prenoms'] ?? null
                        );

                    $responsableTelephone =
                        $this->valeur(
                            $row['mere_telephone'] ?? null
                        );

                    $responsableEmail =
                        $this->valeur(
                            $row['mere_email'] ?? null
                        );

                    $responsableProfession =
                        $this->valeur(
                            $row['mere_profession'] ?? null
                        );

                    $responsableAdresse =
                        $this->valeur(
                            $row['mere_adresse'] ?? null
                        );
                }

                /*
                |--------------------------------------------------------------------------
                | AUTRE TUTEUR
                |--------------------------------------------------------------------------
                */ elseif ($typeTuteur === 'Autre') {

                    $responsableNom =
                        $this->valeur(
                            $row['tuteur_nom'] ?? null
                        );

                    $responsablePrenoms =
                        $this->valeur(
                            $row['tuteur_prenoms'] ?? null
                        );

                    $responsableTelephone =
                        $this->valeur(
                            $row['tuteur_telephone'] ?? null
                        );

                    $responsableEmail =
                        $this->valeur(
                            $row['tuteur_email'] ?? null
                        );

                    $responsableProfession =
                        $this->valeur(
                            $row['tuteur_profession'] ?? null
                        );

                    $responsableAdresse =
                        $this->valeur(
                            $row['tuteur_adresse'] ?? null
                        );
                }

                /*
                |--------------------------------------------------------------------------
                | CRÉATION DE L'ÉLÈVE
                |--------------------------------------------------------------------------
                */

                $eleve = Eleve::create([

                    'etablissement_id' =>
                    $this->etablissementId,

                    'annee_scolaire_id' =>
                    $this->anneeScolaireId,

                    'classe_id' =>
                    $classe->id,

                    'matricule' =>
                    $this->valeur(
                        $row['matricule'] ?? null
                    ),

                    /*
                    |--------------------------------------------------------------------------
                    | IDENTIFICATION
                    |--------------------------------------------------------------------------
                    */

                    'nationalite' =>
                    $this->valeur($row['nationalite'] ?? null)
                        ?: 'Ivoirienne',

                    'nom' =>
                    $this->valeur(
                        $row['nom'] ?? null
                    ),

                    'prenoms' =>
                    $this->valeur(
                        $row['prenoms'] ?? null
                    ),

                    'sexe' =>
                    $this->valeur(
                        $row['sexe'] ?? null
                    ),

                    'date_naissance' =>
                    $this->normaliserDate(
                        $row['date_naissance'] ?? null
                    ),

                    'lieu_naissance' =>
                    $this->valeur(
                        $row['lieu_naissance'] ?? null
                    ),


                    'photo' => null,

                    /*
                    |--------------------------------------------------------------------------
                    | INFORMATIONS COMPLÉMENTAIRES
                    |--------------------------------------------------------------------------
                    */

                    'adresse' =>
                    $this->valeur(
                        $row['adresse'] ?? null
                    ),

                    'telephone' =>
                    $this->valeur(
                        $row['telephone'] ?? null
                    ),

                    'email' =>
                    $this->valeur(
                        $row['email'] ?? null
                    ),

                    /*
                    |--------------------------------------------------------------------------
                    | SITUATION SCOLAIRE
                    |--------------------------------------------------------------------------
                    */

                    'redoublant' =>
                    $this->convertirOuiNon(
                        $row['redoublant'] ?? 'Non'
                    ),

                    'boursier' =>
                    $this->convertirOuiNon(
                        $row['boursier'] ?? 'Non'
                    ),

                    'regime' =>
                    $this->valeur($row['regime'] ?? null)
                        ?: 'Externe',

                    'statut' =>
                    $this->valeur($row['statut'] ?? null)
                        ?: 'Actif',

                    'statut_affectation' =>
                    $this->valeur($row['statut_affectation'] ?? null)
                        ?: 'Non affecté',

                    /*
                    |--------------------------------------------------------------------------
                    | PÈRE
                    |--------------------------------------------------------------------------
                    */

                    'pere_nom' =>
                    $this->valeur(
                        $row['pere_nom'] ?? null
                    ),

                    'pere_prenoms' =>
                    $this->valeur(
                        $row['pere_prenoms'] ?? null
                    ),

                    'pere_telephone' =>
                    $this->valeur(
                        $row['pere_telephone'] ?? null
                    ),

                    'pere_email' =>
                    $this->valeur(
                        $row['pere_email'] ?? null
                    ),

                    'pere_profession' =>
                    $this->valeur(
                        $row['pere_profession'] ?? null
                    ),

                    'pere_adresse' =>
                    $this->valeur(
                        $row['pere_adresse'] ?? null
                    ),

                    /*
                    |--------------------------------------------------------------------------
                    | MÈRE
                    |--------------------------------------------------------------------------
                    */

                    'mere_nom' =>
                    $this->valeur(
                        $row['mere_nom'] ?? null
                    ),

                    'mere_prenoms' =>
                    $this->valeur(
                        $row['mere_prenoms'] ?? null
                    ),

                    'mere_telephone' =>
                    $this->valeur(
                        $row['mere_telephone'] ?? null
                    ),

                    'mere_email' =>
                    $this->valeur(
                        $row['mere_email'] ?? null
                    ),

                    'mere_profession' =>
                    $this->valeur(
                        $row['mere_profession'] ?? null
                    ),

                    'mere_adresse' =>
                    $this->valeur(
                        $row['mere_adresse'] ?? null
                    ),

                    /*
                    |--------------------------------------------------------------------------
                    | TUTEUR LÉGAL
                    |--------------------------------------------------------------------------
                    */

                    'type_tuteur' =>
                    $typeTuteur,

                    'type_tuteur_legal' =>
                    $this->typeTuteurLegal(
                        $typeTuteur
                    ),

                    'responsable_nom' =>
                    $responsableNom,

                    'responsable_prenoms' =>
                    $responsablePrenoms,

                    'responsable_telephone' =>
                    $responsableTelephone,

                    'responsable_email' =>
                    $responsableEmail,

                    'responsable_profession' =>
                    $responsableProfession,

                    'responsable_adresse' =>
                    $responsableAdresse,

                    /*
                    |--------------------------------------------------------------------------
                    | INFORMATIONS MÉDICALES
                    |--------------------------------------------------------------------------
                    */

                    'groupe_sanguin' =>
                    $this->valeur(
                        $row['groupe_sanguin'] ?? null
                    ),

                    'allergies' =>
                    $this->valeur(
                        $row['allergies'] ?? null
                    ),

                    'observations_medicales' =>
                    $this->valeur(
                        $row['observations_medicales'] ?? null
                    ),

                    'contact_urgence_nom' =>
                    $this->valeur(
                        $row['contact_urgence_nom'] ?? null
                    ),

                    'contact_urgence_telephone' =>
                    $this->valeur(
                        $row['contact_urgence_telephone'] ?? null
                    ),

                    /*
                    |--------------------------------------------------------------------------
                    | STATUT SYSTÈME
                    |--------------------------------------------------------------------------
                    */

                    'actif' => true,
                ]);


                $eleve->update([
                    'code_eleve' => 'ELV-' . str_pad(
                        $eleve->id,
                        6,
                        '0',
                        STR_PAD_LEFT
                    ),
                ]);

                $this->nombreImportes++;
            }
        });
    }
    /**
     * Normaliser les données Excel avant la validation.
     *
     * Excel peut interpréter les numéros de téléphone comme des nombres.
     * On les convertit donc systématiquement en chaînes de caractères.
     */
    public function prepareForValidation($data, $index)
    {
        $telephones = [
            'telephone',
            'pere_telephone',
            'mere_telephone',
            'tuteur_telephone',
            'contact_urgence_telephone',
        ];

        foreach ($telephones as $champ) {

            if (!isset($data[$champ])) {
                continue;
            }

            if ($data[$champ] === '') {
                $data[$champ] = null;
                continue;
            }

            $data[$champ] = trim((string)$data[$champ]);
        }

        return $data;
    }

    /**
     * Règles de validation.
     */
    public function rules(): array
    {
        return [

            '*.classe' => [
                'required',
                'string',
            ],

            '*.matricule' => [
                'nullable',
                'string',
                'regex:/^[0-9]{8}[A-Z]$/',
            ],

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

            '*.adresse' => [
                'nullable',
                'string',
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

            '*.redoublant' => [
                'nullable',
                'in:Oui,Non',
            ],

            '*.boursier' => [
                'nullable',
                'in:Oui,Non',
            ],

            '*.regime' => [
                'nullable',
                'in:Externe,Demi-pensionnaire,Interne',
            ],

            '*.statut' => [
                'nullable',
                'in:Actif,Transféré,Exclu,Abandonné,Diplômé',
            ],

            '*.statut_affectation' => [
                'nullable',
                'in:Affecté,Non affecté',
            ],

            '*.type_tuteur' => [
                'nullable',
                'in:Père,Mère,Autre',
            ],

            /*
            |--------------------------------------------------------------------------
            | PÈRE
            |--------------------------------------------------------------------------
            */

            '*.pere_nom' => [
                'nullable',
                'string',
                'max:100',
            ],

            '*.pere_prenoms' => [
                'nullable',
                'string',
                'max:150',
            ],

            '*.pere_telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            '*.pere_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            '*.pere_profession' => [
                'nullable',
                'string',
                'max:150',
            ],

            '*.pere_adresse' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | MÈRE
            |--------------------------------------------------------------------------
            */

            '*.mere_nom' => [
                'nullable',
                'string',
                'max:100',
            ],

            '*.mere_prenoms' => [
                'nullable',
                'string',
                'max:150',
            ],

            '*.mere_telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            '*.mere_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            '*.mere_profession' => [
                'nullable',
                'string',
                'max:150',
            ],

            '*.mere_adresse' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | AUTRE TUTEUR
            |--------------------------------------------------------------------------
            */

            '*.tuteur_nom' => [
                'nullable',
                'string',
                'max:100',
            ],

            '*.tuteur_prenoms' => [
                'nullable',
                'string',
                'max:150',
            ],

            '*.tuteur_telephone' => [
                'nullable',
                'string',
                'max:30',
            ],

            '*.tuteur_email' => [
                'nullable',
                'email',
                'max:255',
            ],

            '*.tuteur_profession' => [
                'nullable',
                'string',
                'max:150',
            ],

            '*.tuteur_adresse' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | MÉDICAL
            |--------------------------------------------------------------------------
            */

            '*.groupe_sanguin' => [
                'nullable',
                'in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            ],

            '*.allergies' => [
                'nullable',
                'string',
            ],

            '*.observations_medicales' => [
                'nullable',
                'string',
            ],

            '*.contact_urgence_nom' => [
                'nullable',
                'string',
                'max:150',
            ],

            '*.contact_urgence_telephone' => [
                'nullable',
                'string',
                'max:30',
            ],
        ];
    }

    /**
     * Messages de validation en français.
     */
    public function customValidationMessages(): array
    {
        return [
            '*.classe.required' =>
            'Le champ classe est obligatoire.',

            '*.matricule.regex' =>
            'Le matricule doit contenir 8 chiffres suivis d’une lettre majuscule.',

            '*.nom.required' =>
            'Le nom est obligatoire.',

            '*.nom.max' =>
            'Le nom ne doit pas dépasser 100 caractères.',

            '*.prenoms.required' =>
            'Les prénoms sont obligatoires.',

            '*.prenoms.max' =>
            'Les prénoms ne doivent pas dépasser 150 caractères.',

            '*.sexe.required' =>
            'Le champ sexe est obligatoire.',

            '*.sexe.in' =>
            'Le sexe doit être Masculin ou Féminin.',

            '*.lieu_naissance.max' =>
            'Le lieu de naissance ne doit pas dépasser 150 caractères.',

            '*.nationalite.max' =>
            'La nationalité ne doit pas dépasser 100 caractères.',

            '*.telephone.max' =>
            'Le numéro de téléphone ne doit pas dépasser 30 caractères.',

            '*.email.email' =>
            'L’adresse e-mail n’est pas valide.',

            '*.email.max' =>
            'L’adresse e-mail ne doit pas dépasser 255 caractères.',

            '*.redoublant.in' =>
            'Le champ redoublant doit être Oui ou Non.',

            '*.boursier.in' =>
            'Le champ boursier doit être Oui ou Non.',

            '*.regime.in' =>
            'Le régime doit être Externe, Demi-pensionnaire ou Interne.',

            '*.statut.in' =>
            'Le statut sélectionné est invalide.',

            '*.statut_affectation.in' =>
            'Le statut d’affectation doit être Affecté ou Non affecté.',

            '*.type_tuteur.in' =>
            'Le type de tuteur doit être Père, Mère ou Autre.',

            '*.pere_email.email' =>
            'L’adresse e-mail du père n’est pas valide.',

            '*.mere_email.email' =>
            'L’adresse e-mail de la mère n’est pas valide.',

            '*.tuteur_email.email' =>
            'L’adresse e-mail du tuteur n’est pas valide.',

            '*.groupe_sanguin.in' =>
            'Le groupe sanguin sélectionné est invalide.',
        ];
    }

    /**
     * Nettoyer une valeur provenant d'Excel.
     */
    private function valeur(mixed $valeur): ?string
    {
        if ($valeur === null) {
            return null;
        }

        $valeur = trim((string) $valeur);

        return $valeur === '' ? null : $valeur;
    }

    /**
     * Convertir Oui/Non en booléen.
     */
    private function convertirOuiNon(mixed $valeur): bool
    {
        $valeur = $this->valeur($valeur);

        return $valeur === 'Oui';
    }

    /**
     * Déterminer le code du type de tuteur légal.
     */
    private function typeTuteurLegal(?string $typeTuteur): string
    {
        return match ($typeTuteur) {
            'Père' => 'PERE',
            'Mère' => 'MERE',
            'Autre' => 'AUTRE',
            default => 'AUTRE',
        };
    }

    /**
     * Normaliser une date provenant d'Excel.
     */
    private function normaliserDate(mixed $date): ?string
    {
        if ($date === null || $date === '') {
            return null;
        }

        /*
        |--------------------------------------------------------------------------
        | YYYY-MM-DD
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
        | JJ/MM/AAAA
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
        | Date Excel numérique
        |--------------------------------------------------------------------------
        */

        if (is_numeric($date)) {

            try {

                return \PhpOffice\PhpSpreadsheet\Shared\Date
                    ::excelToDateTimeObject($date)
                    ->format('Y-m-d');
            } catch (\Throwable) {

                return null;
            }
        }

        return null;
    }
}
