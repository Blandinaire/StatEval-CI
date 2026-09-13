<?php

namespace App\Imports;

use App\Models\Enseignant;
use App\Models\Etablissement;
use App\Models\Matiere;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class EnseignantsSheetImport implements
    ToCollection,
    WithHeadingRow,
    WithValidation,
    SkipsEmptyRows
{
    protected int $etablissementId;

    public int $nombreImportes = 0;

    public function __construct(int $etablissementId)
    {
        $this->etablissementId = $etablissementId;
    }

    /**
     * Importation des enseignants.
     */
    public function collection(Collection $rows): void
    {
        /*
        |--------------------------------------------------------------------------
        | VÉRIFICATION DE L'ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        $etablissement = Etablissement::find($this->etablissementId);

        if (!$etablissement) {
            throw new \RuntimeException(
                "L'établissement sélectionné n'existe pas."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | IMPORTATION TRANSACTIONNELLE
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use ($rows) {

            foreach ($rows as $index => $row) {

                $numeroLigne = $index + 2;

                /*
                |--------------------------------------------------------------------------
                | INFORMATIONS OBLIGATOIRES
                |--------------------------------------------------------------------------
                */

                $nom = $this->majuscule(
                    $this->valeur($row['nom'] ?? null)
                );

                $prenoms = $this->majuscule(
                    $this->valeur($row['prenoms'] ?? null)
                );

                $sexe = $this->valeur(
                    $row['sexe'] ?? null
                );

                /*
                |--------------------------------------------------------------------------
                | ÉTABLISSEMENT
                |--------------------------------------------------------------------------
                |
                | L'établissement est normalement celui sélectionné
                | dans SchoolManager.
                |
                | La colonne Excel est néanmoins vérifiée lorsqu'elle
                | est renseignée.
                |--------------------------------------------------------------------------
                */

                $libelleEtablissement = $this->valeur(
                    $row['etablissement'] ?? null
                );

                if ($libelleEtablissement) {

                    $etablissement = Etablissement::whereRaw(
                        'LOWER(TRIM(nom)) = ?',
                        [mb_strtolower($libelleEtablissement)]
                    )->find($this->etablissementId);

                    if (!$etablissement) {
                        throw new \RuntimeException(
                            "Ligne {$numeroLigne} : l'établissement "
                            . "« {$libelleEtablissement} » ne correspond pas "
                            . "à l'établissement sélectionné."
                        );
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | MATIÈRE PRINCIPALE
                |--------------------------------------------------------------------------
                */

                $matierePrincipaleId =
                    $this->chercherMatiere(
                        $row['matiere_principale'] ?? null,
                        $numeroLigne
                    );

                /*
                |--------------------------------------------------------------------------
                | MATIÈRE SECONDAIRE
                |--------------------------------------------------------------------------
                */

                $matiereSecondaireId =
                    $this->chercherMatiere(
                        $row['matiere_secondaire'] ?? null,
                        $numeroLigne
                    );

                /*
                |--------------------------------------------------------------------------
                | CRÉATION
                |--------------------------------------------------------------------------
                */

                $enseignant = Enseignant::create([

                    'etablissement_id' =>
                        $this->etablissementId,

                    'matiere_principale_id' =>
                        $matierePrincipaleId,

                    'matiere_secondaire_id' =>
                        $matiereSecondaireId,

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

                    'matricule_fonction_publique' =>
                        $this->valeur(
                            $row['matricule_fonction_publique'] ?? null
                        ),

                    'type' =>
                        $this->valeur(
                            $row['type'] ?? null
                        ) ?: 'Vacataire',

                    'grade' =>
                        $this->valeur(
                            $row['grade'] ?? null
                        ),

                    'diplome' =>
                        $this->valeur(
                            $row['diplome'] ?? null
                        ),

                    'date_embauche' =>
                        $this->normaliserDate(
                            $row['date_embauche'] ?? null
                        ),

                    'date_prise_service' =>
                        $this->normaliserDate(
                            $row['date_prise_service'] ?? null
                        ),

                    'volume_horaire' =>
                        $this->entier(
                            $row['volume_horaire'] ?? null,
                            0
                        ),

                    'nb_classes_max' =>
                        $this->entier(
                            $row['nb_classes_max'] ?? null,
                            10
                        ),

                    'statut' =>
                        $this->valeur(
                            $row['statut'] ?? null
                        ) ?: 'Actif',

                    'actif' =>
                        $this->convertirOuiNon(
                            $row['actif'] ?? 'Oui'
                        ),
                ]);

                /*
                |--------------------------------------------------------------------------
                | MATRICULE INTERNE AUTOMATIQUE
                |--------------------------------------------------------------------------
                */

                $enseignant->update([
                    'matricule' => 'ENS-' . str_pad(
                        $enseignant->id,
                        5,
                        '0',
                        STR_PAD_LEFT
                    ),
                ]);

                $this->nombreImportes++;
            }
        });
    }

    /**
     * Préparation avant validation.
     */
    public function prepareForValidation($data, $index)
    {
        foreach ([
            'nom',
            'prenoms',
            'sexe',
            'etablissement',
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
        ] as $champ) {

            if (isset($data[$champ])) {
                $data[$champ] = is_string($data[$champ])
                    ? trim($data[$champ])
                    : $data[$champ];
            }
        }

        return $data;
    }

    /**
     * Validation minimale.
     *
     * Seulement 4 champs sont obligatoires :
     * nom, prenoms, sexe, établissement.
     */
    public function rules(): array
    {
        return [

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

            '*.etablissement' => [
                'required',
                'string',
            ],

            '*.email' => [
                'nullable',
                'email',
                'max:255',
            ],

            '*.type' => [
                'nullable',
                'in:Permanent,Vacataire,Contractuel',
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

    /**
     * Messages en français.
     */
    public function customValidationMessages(): array
    {
        return [

            '*.nom.required' =>
                'Le nom est obligatoire.',

            '*.prenoms.required' =>
                'Les prénoms sont obligatoires.',

            '*.sexe.required' =>
                'Le sexe est obligatoire.',

            '*.sexe.in' =>
                'Le sexe doit être Masculin ou Féminin.',

            '*.etablissement.required' =>
                "L'établissement est obligatoire.",

            '*.email.email' =>
                "L'adresse e-mail n'est pas valide.",

            '*.type.in' =>
                "Le type d'enseignant doit être Permanent, Vacataire ou Contractuel.",

            '*.statut.in' =>
                "Le statut doit être Actif, Suspendu ou Retraité.",

            '*.actif.in' =>
                "Le champ actif doit être Oui ou Non.",
        ];
    }

    /**
     * Rechercher une matière.
     */
    private function chercherMatiere(
        mixed $valeur,
        int $ligne
    ): ?int {

        $valeur = $this->valeur($valeur);

        if (!$valeur) {
            return null;
        }

        $matiere = Matiere::whereRaw(
            'LOWER(TRIM(libelle)) = ?',
            [mb_strtolower($valeur)]
        )->first();

        if (!$matiere) {
            throw new \RuntimeException(
                "Ligne {$ligne} : la matière "
                . "« {$valeur} » n'existe pas dans StatEval-CI."
            );
        }

        return $matiere->id;
    }

    /**
     * Transformer en majuscules.
     */
    private function majuscule(?string $valeur): ?string
    {
        if (!$valeur) {
            return null;
        }

        return mb_strtoupper(
            trim($valeur),
            'UTF-8'
        );
    }

    /**
     * Nettoyage des valeurs.
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
     * Conversion Oui / Non.
     */
    private function convertirOuiNon(mixed $valeur): bool
    {
        $valeur = $this->valeur($valeur);

        return $valeur !== 'Non';
    }

    /**
     * Conversion entière.
     */
    private function entier(
        mixed $valeur,
        int $defaut
    ): int {

        if ($valeur === null || $valeur === '') {
            return $defaut;
        }

        return max(
            0,
            (int) $valeur
        );
    }

    /**
     * Normalisation des dates Excel.
     */
    private function normaliserDate(mixed $date): ?string
    {
        if ($date === null || $date === '') {
            return null;
        }

        if (
            is_string($date) &&
            preg_match(
                '/^\d{4}-\d{2}-\d{2}$/',
                trim($date)
            )
        ) {
            return trim($date);
        }

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