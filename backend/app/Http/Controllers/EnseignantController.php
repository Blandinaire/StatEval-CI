<?php

namespace App\Http\Controllers;

use App\Exports\EnseignantsTemplateExport;
use App\Http\Requests\StoreEnseignantRequest;
use App\Imports\EnseignantsImport;
use App\Models\Etablissement;
use App\Models\Enseignant;
use App\Models\Matiere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;

class EnseignantController extends Controller
{
    /**
     * Retourne l'utilisateur connecté.
     */
    private function utilisateurConnecte()
    {
        return Auth::user();
    }

    /**
     * Vérifie si l'utilisateur connecté est SuperAdmin.
     */
    private function estSuperAdmin(): bool
    {
        return $this
            ->utilisateurConnecte()
            ->hasRole('SuperAdmin');
    }

    /**
     * Retourne l'identifiant de l'établissement
     * de l'utilisateur connecté.
     *
     * SuperAdmin : null (accès à tous les établissements).
     */
    private function etablissementUtilisateurId(): ?int
    {
        if ($this->estSuperAdmin()) {
            return null;
        }

        return $this
            ->utilisateurConnecte()
            ->etablissement_id;
    }

    /**
     * Vérifie qu'un enseignant appartient bien
     * à l'établissement de l'utilisateur connecté.
     */
    private function verifierAccesEnseignant(
        Enseignant $enseignant
    ): void {
        if ($this->estSuperAdmin()) {
            return;
        }

        if (
            $enseignant->etablissement_id !==
            $this->etablissementUtilisateurId()
        ) {
            abort(403, 'Vous n\'avez pas accès à cet enseignant.');
        }
    }

    /**
     * Liste des enseignants.
     */
    public function index(Request $request)
    {
        $user = $this->utilisateurConnecte();

        $isSuperAdmin = $this->estSuperAdmin();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if ($isSuperAdmin) {

            $etablissementId = $request->input(
                'etablissement_id'
            );
        } else {

            $etablissementId =
                $this->etablissementUtilisateurId();
        }

        /*
        |--------------------------------------------------------------------------
        | REQUÊTE ENSEIGNANTS
        |--------------------------------------------------------------------------
        */

        $query = Enseignant::query()
            ->with([
                'etablissement',
                'matierePrincipale',
                'matiereSecondaire',
            ])
            ->orderBy('nom')
            ->orderBy('prenoms');

        if ($etablissementId) {

            $query->where(
                'etablissement_id',
                $etablissementId
            );
        }

        $enseignants = $query->get();

        /*
        |--------------------------------------------------------------------------
        | STATISTIQUES
        |--------------------------------------------------------------------------
        */

        $statistiques =
            $this->calculerStatistiquesEnseignants(
                $etablissementId
                    ? (int) $etablissementId
                    : null
            );

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENTS
        |--------------------------------------------------------------------------
        */

        $etablissements = $isSuperAdmin
            ? Etablissement::query()
            ->orderBy('nom')
            ->get([
                'id',
                'nom',
            ])
            : [];

        /*
        |--------------------------------------------------------------------------
        | RÉPONSE
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Enseignants/Index',
            [
                'enseignants' => $enseignants,

                'etablissements' =>
                $etablissements,

                'etablissementSelectionne' =>
                $etablissementId
                    ? (int) $etablissementId
                    : null,

                'isSuperAdmin' =>
                $isSuperAdmin,

                'statistiques' =>
                $statistiques,
            ]
        );
    }

    /**
     * Formulaire de création.
     */
    public function create()
    {
        $user = $this->utilisateurConnecte();

        $isSuperAdmin = $this->estSuperAdmin();

        return Inertia::render(
            'Enseignants/Create',
            [
                /*
                |--------------------------------------------------------------------------
                | ÉTABLISSEMENTS
                |--------------------------------------------------------------------------
                |
                | Seul le SuperAdmin peut choisir un établissement.
                |
                */

                'etablissements' => $isSuperAdmin
                    ? Etablissement::query()
                    ->orderBy('nom')
                    ->get([
                        'id',
                        'nom',
                    ])
                    : [],

                /*
                |--------------------------------------------------------------------------
                | ÉTABLISSEMENT UTILISATEUR
                |--------------------------------------------------------------------------
                */

                'etablissementId' => $isSuperAdmin
                    ? null
                    : $user->etablissement_id,

                'isSuperAdmin' =>
                $isSuperAdmin,

                /*
                |--------------------------------------------------------------------------
                | MATIÈRES
                |--------------------------------------------------------------------------
                */

                'matieres' =>
                Matiere::orderBy('libelle')->get(),
            ]
        );
    }

    /**
     * Enregistrement d'un enseignant.
     */
    public function store(
        StoreEnseignantRequest $request
    ) {
        $data = $request->validated();

        $user = $this->utilisateurConnecte();

        $isSuperAdmin = $this->estSuperAdmin();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        |
        | La Direction ne choisit jamais l'établissement.
        | Il est automatiquement imposé.
        |
        */

        if (!$isSuperAdmin) {

            $data['etablissement_id'] =
                $user->etablissement_id;
        }

        /*
        |--------------------------------------------------------------------------
        | MATRICULE
        |--------------------------------------------------------------------------
        */

        unset($data['matricule']);

        /*
        |--------------------------------------------------------------------------
        | CRÉATION
        |--------------------------------------------------------------------------
        */

        $enseignant = Enseignant::create($data);

        /*
        |--------------------------------------------------------------------------
        | GÉNÉRATION DU MATRICULE
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

        return redirect()
            ->route('enseignants.index')
            ->with(
                'success',
                'Enseignant créé avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(
        Enseignant $enseignant
    ) {
        $isSuperAdmin = $this->estSuperAdmin();

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ
        |--------------------------------------------------------------------------
        */

        $this->verifierAccesEnseignant(
            $enseignant
        );

        /*
        |--------------------------------------------------------------------------
        | RÉPONSE
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Enseignants/Edit',
            [
                'enseignant' =>
                $enseignant,

                /*
                |--------------------------------------------------------------------------
                | Seul le SuperAdmin peut changer l'établissement
                |--------------------------------------------------------------------------
                */

                'etablissements' =>
                $isSuperAdmin
                    ? Etablissement::query()
                    ->orderBy('nom')
                    ->get([
                        'id',
                        'nom',
                    ])
                    : [],

                'etablissementId' =>
                $isSuperAdmin
                    ? $enseignant->etablissement_id
                    : $this->etablissementUtilisateurId(),

                'isSuperAdmin' =>
                $isSuperAdmin,

                'matieres' =>
                Matiere::orderBy('libelle')
                    ->get(),
            ]
        );
    }

    /**
     * Mise à jour d'un enseignant.
     */
    public function update(
        StoreEnseignantRequest $request,
        Enseignant $enseignant
    ) {
        $user = $this->utilisateurConnecte();

        $isSuperAdmin = $this->estSuperAdmin();

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ
        |--------------------------------------------------------------------------
        */

        $this->verifierAccesEnseignant(
            $enseignant
        );

        /*
        |--------------------------------------------------------------------------
        | DONNÉES
        |--------------------------------------------------------------------------
        */

        $data = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        |
        | La Direction ne peut pas déplacer un enseignant
        | vers un autre établissement.
        |
        */

        if (!$isSuperAdmin) {

            $data['etablissement_id'] =
                $user->etablissement_id;
        }

        /*
        |--------------------------------------------------------------------------
        | MISE À JOUR
        |--------------------------------------------------------------------------
        */

        $enseignant->update($data);

        return redirect()
            ->route('enseignants.index')
            ->with(
                'success',
                'Enseignant modifié avec succès.'
            );
    }

    /**
     * Formulaire d'importation massive.
     */
    public function importForm()
    {
        $user = $this->utilisateurConnecte();

        $isSuperAdmin = $this->estSuperAdmin();

        return Inertia::render(
            'Enseignants/Import',
            [
                /*
                |--------------------------------------------------------------------------
                | ÉTABLISSEMENTS
                |--------------------------------------------------------------------------
                */

                'etablissements' =>
                $isSuperAdmin
                    ? Etablissement::query()
                    ->orderBy('nom')
                    ->get([
                        'id',
                        'nom',
                    ])
                    : [],

                /*
                |--------------------------------------------------------------------------
                | ÉTABLISSEMENT UTILISATEUR
                |--------------------------------------------------------------------------
                */

                'etablissementId' =>
                $isSuperAdmin
                    ? null
                    : $user->etablissement_id,

                'isSuperAdmin' =>
                $isSuperAdmin,
            ]
        );
    }

    /**
     * Importation massive des enseignants.
     */
    public function import(
        Request $request
    ) {
        $user = $this->utilisateurConnecte();

        $isSuperAdmin = $this->estSuperAdmin();

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $request->validate(
            [
                'etablissement_id' => [
                    'nullable',
                    'integer',
                    'exists:etablissements,id',
                ],

                'fichier' => [
                    'required',
                    'file',
                    'mimes:xlsx,xls,csv',
                    'max:10240',
                ],
            ],
            [
                'fichier.required' =>
                'Veuillez sélectionner un fichier Excel ou CSV.',

                'fichier.file' =>
                'Le fichier sélectionné est invalide.',

                'fichier.mimes' =>
                'Le fichier doit être au format Excel (.xlsx, .xls) ou CSV.',

                'fichier.max' =>
                'Le fichier ne doit pas dépasser 10 Mo.',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        $etablissementId = $isSuperAdmin
            ? $request->input(
                'etablissement_id'
            )
            : $user->etablissement_id;

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ SUPERADMIN
        |--------------------------------------------------------------------------
        */

        if (
            $isSuperAdmin &&
            !$etablissementId
        ) {
            return back()
                ->withInput()
                ->withErrors([
                    'etablissement_id' =>
                    'Veuillez sélectionner un établissement.',
                ]);
        }

        try {

            $import =
                new EnseignantsImport(
                    (int) $etablissementId
                );

            Excel::import(
                $import,
                $request->file('fichier')
            );

            /*
            |--------------------------------------------------------------------------
            | AUCUNE LIGNE IMPORTÉE
            |--------------------------------------------------------------------------
            */

            if (
                $import->nombreImportes === 0
            ) {
                return back()
                    ->withInput()
                    ->with(
                        'import_error',
                        "Aucun enseignant n'a été importé. Vérifiez que le fichier contient des lignes de données valides."
                    );
            }

            return redirect()
                ->route('enseignants.index')
                ->with(
                    'success',
                    $import->nombreImportes .
                        ' enseignant(s) importé(s) avec succès.'
                );
        } catch (
            ValidationException $e
        ) {

            $messages = [];

            foreach (
                $e->failures()
                as $failure
            ) {

                $ligne =
                    $failure->row();

                $champ =
                    $failure->attribute();

                foreach (
                    $failure->errors()
                    as $error
                ) {

                    $messages[] =
                        "Ligne {$ligne} — {$champ} : {$error}";
                }
            }

            return back()
                ->withInput()
                ->with(
                    'import_error',
                    implode(
                        "\n",
                        $messages
                    )
                );
        } catch (
            \Throwable $e
        ) {

            return back()
                ->withInput()
                ->with(
                    'import_error',
                    "L'importation a échoué : " .
                        $e->getMessage()
                );
        }
    }

    /**
     * Télécharger le modèle Excel.
     */
    public function importTemplate(
        Request $request
    ) {
        $user = $this->utilisateurConnecte();

        $isSuperAdmin = $this->estSuperAdmin();

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $request->validate([
            'etablissement_id' => [
                'nullable',
                'integer',
                'exists:etablissements,id',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        $etablissementId = $isSuperAdmin
            ? $request->input(
                'etablissement_id'
            )
            : $user->etablissement_id;

        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        if (
            $isSuperAdmin &&
            !$etablissementId
        ) {
            return back()
                ->withErrors([
                    'etablissement_id' =>
                    'Veuillez sélectionner un établissement.',
                ]);
        }

        return Excel::download(
            new EnseignantsTemplateExport(
                (int) $etablissementId
            ),
            'modele_importation_enseignants.xlsx'
        );
    }

    /**
     * Suppression d'un enseignant.
     */
    public function destroy(
        Enseignant $enseignant
    ) {
        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ
        |--------------------------------------------------------------------------
        */

        $this->verifierAccesEnseignant(
            $enseignant
        );

        /*
        |--------------------------------------------------------------------------
        | SUPPRESSION
        |--------------------------------------------------------------------------
        */

        $enseignant->delete();

        return redirect()
            ->route('enseignants.index')
            ->with(
                'success',
                'Enseignant supprimé avec succès.'
            );
    }

    /**
     * Calcule les statistiques
     * du personnel enseignant.
     */
    private function calculerStatistiquesEnseignants(
        ?int $etablissementId = null
    ): array {

        /*
        |--------------------------------------------------------------------------
        | REQUÊTE DE BASE
        |--------------------------------------------------------------------------
        */

        $query = Enseignant::query();

        if ($etablissementId) {

            $query->where(
                'etablissement_id',
                $etablissementId
            );
        }

        /*
        |--------------------------------------------------------------------------
        | TOTAL
        |--------------------------------------------------------------------------
        */

        $total =
            (clone $query)->count();

        /*
        |--------------------------------------------------------------------------
        | RÉPARTITION PAR GENRE
        |--------------------------------------------------------------------------
        */

        $genre = (clone $query)
            ->select(
                'sexe',
                DB::raw(
                    'COUNT(*) as total'
                )
            )
            ->groupBy('sexe')
            ->get()
            ->map(
                function ($item) use ($total) {

                    $nombre =
                        (int) $item->total;

                    return [
                        'libelle' =>
                        $item->sexe
                            ?: 'Non renseigné',

                        'total' =>
                        $nombre,

                        'pourcentage' =>
                        $total > 0
                            ? round(
                                ($nombre / $total) * 100,
                                1
                            )
                            : 0,
                    ];
                }
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | RÉPARTITION PAR TYPE
        |--------------------------------------------------------------------------
        */

        $types = (clone $query)
            ->select(
                'type',
                DB::raw(
                    'COUNT(*) as total'
                )
            )
            ->groupBy('type')
            ->orderByDesc('total')
            ->get()
            ->map(
                function ($item) use ($total) {

                    $nombre =
                        (int) $item->total;

                    return [
                        'libelle' =>
                        $item->type
                            ?: 'Non renseigné',

                        'total' =>
                        $nombre,

                        'pourcentage' =>
                        $total > 0
                            ? round(
                                ($nombre / $total) * 100,
                                1
                            )
                            : 0,
                    ];
                }
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | RÉPARTITION PAR STATUT
        |--------------------------------------------------------------------------
        */

        $statuts = (clone $query)
            ->select(
                'statut',
                DB::raw(
                    'COUNT(*) as total'
                )
            )
            ->groupBy('statut')
            ->orderByDesc('total')
            ->get()
            ->map(
                function ($item) use ($total) {

                    $nombre =
                        (int) $item->total;

                    return [
                        'libelle' =>
                        $item->statut
                            ?: 'Non renseigné',

                        'total' =>
                        $nombre,

                        'pourcentage' =>
                        $total > 0
                            ? round(
                                ($nombre / $total) * 100,
                                1
                            )
                            : 0,
                    ];
                }
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | MATIÈRES PRINCIPALES
        |--------------------------------------------------------------------------
        */

        $matieres = (clone $query)
            ->leftJoin(
                'matieres',
                'enseignants.matiere_principale_id',
                '=',
                'matieres.id'
            )
            ->select(
                DB::raw(
                    "COALESCE(matieres.libelle, 'Non renseignée') as libelle"
                ),
                DB::raw(
                    'COUNT(enseignants.id) as total'
                )
            )
            ->groupBy(
                'matieres.id',
                'matieres.libelle'
            )
            ->orderByDesc('total')
            ->get()
            ->map(
                function ($item) {

                    return [
                        'libelle' =>
                        $item->libelle,

                        'total' =>
                        (int) $item->total,
                    ];
                }
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | DIPLÔMES
        |--------------------------------------------------------------------------
        */

        $diplomes = (clone $query)
            ->select(
                DB::raw(
                    "COALESCE(diplome, 'Non renseigné') as libelle"
                ),
                DB::raw(
                    'COUNT(*) as total'
                )
            )
            ->groupBy('diplome')
            ->orderByDesc('total')
            ->get()
            ->map(
                function ($item) {

                    return [
                        'libelle' =>
                        $item->libelle,

                        'total' =>
                        (int) $item->total,
                    ];
                }
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | ACTIFS
        |--------------------------------------------------------------------------
        */

        $actifs = (clone $query)
            ->where(
                'actif',
                true
            )
            ->count();

        /*
        |--------------------------------------------------------------------------
        | INACTIFS
        |--------------------------------------------------------------------------
        */

        $inactifs =
            $total - $actifs;

        /*
        |--------------------------------------------------------------------------
        | MATRICULES FONCTION PUBLIQUE
        |--------------------------------------------------------------------------
        */

        $avecMatriculeFonctionPublique =
            (clone $query)
            ->whereNotNull(
                'matricule_fonction_publique'
            )
            ->where(
                'matricule_fonction_publique',
                '!=',
                ''
            )
            ->count();

        $sansMatriculeFonctionPublique =
            $total -
            $avecMatriculeFonctionPublique;

        /*
        |--------------------------------------------------------------------------
        | VOLUME HORAIRE
        |--------------------------------------------------------------------------
        */

        $volumeHoraireTotal =
            (int) (
                (clone $query)
                ->sum(
                    'volume_horaire'
                )
            );

        $volumeHoraireMoyen =
            $total > 0
            ? round(
                $volumeHoraireTotal / $total,
                1
            )
            : 0;

        /*
        |--------------------------------------------------------------------------
        | ÂGES ET ANCIENNETÉS
        |--------------------------------------------------------------------------
        */

        $enseignantsDates =
            (clone $query)
            ->get([
                'date_naissance',
                'date_embauche',
            ]);

        $ages = [];

        $anciennetes = [];

        foreach (
            $enseignantsDates
            as $enseignant
        ) {

            /*
            |--------------------------------------------------------------------------
            | ÂGE
            |--------------------------------------------------------------------------
            */

            if (
                $enseignant->date_naissance
            ) {

                try {

                    $dateNaissance =
                        \Carbon\Carbon::parse(
                            $enseignant->date_naissance
                        );

                    $age =
                        $dateNaissance->age;

                    if (
                        $age >= 18 &&
                        $age <= 100
                    ) {
                        $ages[] = $age;
                    }
                } catch (
                    \Throwable $e
                ) {
                    // Date invalide.
                }
            }

            /*
            |--------------------------------------------------------------------------
            | ANCIENNETÉ
            |--------------------------------------------------------------------------
            */

            if (
                $enseignant->date_embauche
            ) {

                try {

                    $dateEmbauche =
                        \Carbon\Carbon::parse(
                            $enseignant->date_embauche
                        );

                    $anciennete =
                        $dateEmbauche
                        ->diffInYears(
                            now()
                        );

                    if (
                        $anciennete >= 0 &&
                        $anciennete <= 60
                    ) {
                        $anciennetes[] =
                            $anciennete;
                    }
                } catch (
                    \Throwable $e
                ) {
                    // Date invalide.
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ÂGE MOYEN
        |--------------------------------------------------------------------------
        */

        $ageMoyen =
            count($ages) > 0
            ? round(
                array_sum($ages) /
                    count($ages),
                1
            )
            : 0;

        /*
        |--------------------------------------------------------------------------
        | ANCIENNETÉ MOYENNE
        |--------------------------------------------------------------------------
        */

        $ancienneteMoyenne =
            count($anciennetes) > 0
            ? round(
                array_sum(
                    $anciennetes
                ) /
                    count(
                        $anciennetes
                    ),
                1
            )
            : 0;

        /*
        |--------------------------------------------------------------------------
        | RETOUR
        |--------------------------------------------------------------------------
        */

        return [

            /*
            | Indicateurs principaux
            */

            'total' =>
            $total,

            'actifs' =>
            $actifs,

            'inactifs' =>
            $inactifs,

            'avec_matricule_fp' =>
            $avecMatriculeFonctionPublique,

            'sans_matricule_fp' =>
            $sansMatriculeFonctionPublique,

            /*
            | Volume horaire
            */

            'volume_horaire_total' =>
            $volumeHoraireTotal,

            'volume_horaire_moyen' =>
            $volumeHoraireMoyen,

            /*
            | Âge / ancienneté
            */

            'age_moyen' =>
            $ageMoyen,

            'anciennete_moyenne' =>
            $ancienneteMoyenne,

            /*
            | Graphiques
            */

            'genre' =>
            $genre,

            'types' =>
            $types,

            'statuts' =>
            $statuts,

            'matieres' =>
            $matieres,

            'diplomes' =>
            $diplomes,
        ];
    }
}
