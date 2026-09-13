<?php

namespace App\Http\Controllers;

use App\Exports\ElevesTemplateExport;
use App\Imports\ElevesImport;
use App\Http\Requests\StoreEleveRequest;
use App\Models\Affectation;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\EducateurClasse;
use App\Models\Etablissement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class EleveController extends Controller
{
    /**
     * =========================================================================
     * LISTE DES ÉLÈVES
     * =========================================================================
     *
     * SuperAdmin :
     *     Tous les élèves.
     *
     * Administrateur / Direction :
     *     Élèves de leur établissement.
     *
     * Educateur :
     *     Élèves de son établissement pour le moment.
     *
     * Professeur :
     *     Uniquement les élèves de ses classes affectées.
     */
    public function index(): Response
    {
        $user = auth()->user();

        $query = Eleve::with([
            'etablissement',
            'anneeScolaire',
            'classe.niveau',
            'classe.cycle',
            'classe.serie',
        ]);

        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('SuperAdmin')) {
            // Aucun filtrage.
        }

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR
        |--------------------------------------------------------------------------
        */ elseif ($user->hasRole('Professeur')) {

            $this->verifierCompteProfesseur();

            $this->appliquerAccesProfesseur($query, $user);
        }

        /*
        |--------------------------------------------------------------------------
        | AUTRES UTILISATEURS
        |--------------------------------------------------------------------------
        */ else {

            $this->verifierEtablissementUtilisateur();

            $query->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        $eleves = $query
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | CLASSES ACCESSIBLES POUR LES FILTRES
        |--------------------------------------------------------------------------
        */

        $classesQuery = Classe::query()
            ->orderBy('libelle');

        if ($user->hasRole('SuperAdmin')) {

            // Toutes les classes.
        } elseif ($user->hasRole('Professeur')) {

            $this->verifierCompteProfesseur();

            $classesQuery
                ->where('etablissement_id', $user->etablissement_id)
                ->whereIn(
                    'id',
                    Affectation::query()
                        ->where('enseignant_id', $user->enseignant_id)
                        ->where('etablissement_id', $user->etablissement_id)
                        ->where('actif', true)
                        ->pluck('classe_id')
                        ->unique()
                );
        } else {

            $this->verifierEtablissementUtilisateur();

            $classesQuery->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        $classes = $classesQuery
            ->get([
                'id',
                'libelle',
                'etablissement_id',
                'annee_scolaire_id',
            ]);

        return Inertia::render('Eleves/Index', [
            'eleves' => $eleves,
            'classes' => $classes,
            'elevesModifiables' => $user->hasRole('Educateur')
                ? $this->elevesModifiablesPourEducateur($user, $eleves)
                : null,
            'peutSupprimer' => $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Directeur',
            ]),
        ]);
    }


    /**
     * =========================================================================
     * FORMULAIRE DE CRÉATION
     * =========================================================================
     */
    public function create(): Response
    {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR : PAS DE CRÉATION D'ÉLÈVE
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Professeur')) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENTS ACCESSIBLES
        |--------------------------------------------------------------------------
        */

        $etablissementsQuery = Etablissement::query()
            ->where('actif', true)
            ->orderBy('nom');

        if (!$user->hasRole('SuperAdmin')) {

            $this->verifierEtablissementUtilisateur();

            $etablissementsQuery->where(
                'id',
                $user->etablissement_id
            );
        }

        $etablissements = $etablissementsQuery->get();

        /*
        |--------------------------------------------------------------------------
        | ANNÉES SCOLAIRES
        |--------------------------------------------------------------------------
        */

        $annees = AnneeScolaire::query()
            ->orderByDesc('date_debut')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | CLASSES ACCESSIBLES
        |--------------------------------------------------------------------------
        */

        $classesQuery = Classe::query()
            ->orderBy('libelle');

        if (!$user->hasRole('SuperAdmin')) {

            $classesQuery->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        $classes = $classesQuery->get();

        return Inertia::render('Eleves/Create', [
            'etablissements' => $etablissements,
            'annees' => $annees,
            'classes' => $classes,
        ]);
    }


    /**
     * =========================================================================
     * ENREGISTRER UN ÉLÈVE
     * =========================================================================
     */
    public function store(StoreEleveRequest $request)
    {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR INTERDIT
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Professeur')) {
            abort(403);
        }

        $validated = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (!$user->hasRole('SuperAdmin')) {

            $this->verifierEtablissementUtilisateur();

            $validated['etablissement_id'] =
                $user->etablissement_id;
        }

        /*
        |--------------------------------------------------------------------------
        | RESPONSABLE LÉGAL
        |--------------------------------------------------------------------------
        */

        $validated = $this->preparerResponsableLegal(
            $validated
        );

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT EXISTANT
        |--------------------------------------------------------------------------
        */

        $etablissement = Etablissement::findOrFail(
            $validated['etablissement_id']
        );

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (!$user->hasRole('SuperAdmin')) {

            abort_unless(
                (int) $etablissement->id ===
                    (int) $user->etablissement_id,
                403
            );
        }

        /*
        |--------------------------------------------------------------------------
        | CLASSE
        |--------------------------------------------------------------------------
        */

        $classe = Classe::findOrFail(
            $validated['classe_id']
        );

        if (
            (int) $classe->etablissement_id !==
            (int) $validated['etablissement_id']
        ) {
            return back()
                ->withErrors([
                    'classe_id' =>
                    "La classe sélectionnée n'appartient pas à l'établissement choisi.",
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | ANNÉE SCOLAIRE / CLASSE
        |--------------------------------------------------------------------------
        */

        if (
            isset($classe->annee_scolaire_id) &&
            isset($validated['annee_scolaire_id']) &&
            (int) $classe->annee_scolaire_id !==
            (int) $validated['annee_scolaire_id']
        ) {
            return back()
                ->withErrors([
                    'classe_id' =>
                    "La classe sélectionnée n'appartient pas à l'année scolaire choisie.",
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | CRÉATION
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use ($validated) {

                $eleve = Eleve::create($validated);

                $eleve->update([
                    'code_eleve' =>
                    'ELV-' .
                        str_pad(
                            $eleve->id,
                            6,
                            '0',
                            STR_PAD_LEFT
                        ),
                ]);
            }
        );

        return redirect()
            ->route('eleves.index')
            ->with(
                'success',
                'Élève enregistré avec succès.'
            );
    }


    /**
     * =========================================================================
     * FICHE DÉTAILLÉE D'UN ÉLÈVE
     * =========================================================================
     */
    public function show(Eleve $eleve)
    {
        $this->verifierAccesEleve($eleve);

        $eleve->load([
            'etablissement',
            'anneeScolaire',
            'classe',

            'absences.educateur',
            'absences.anneeScolaire',
            'absences.classe',

            'retards.educateur',
            'retards.anneeScolaire',
            'retards.classe',

            'conduites.educateur',
            'conduites.anneeScolaire',
            'conduites.classe',
            'conduites.evaluation',

            'notes.evaluation.matiere',
            'notes.evaluation.enseignant',
            'notes.evaluation.anneeScolaire',
            'notes.evaluation.classe',
        ]);

        /*
        |--------------------------------------------------------------------------
        | HISTORIQUE
        |--------------------------------------------------------------------------
        */

        $historique = collect();

        /*
        |--------------------------------------------------------------------------
        | ABSENCES
        |--------------------------------------------------------------------------
        */

        foreach ($eleve->absences as $absence) {

            $historique->push([
                'type' => 'absence',
                'libelle' => 'Absence',

                'date' =>
                $absence->date_absence?->format('Y-m-d'),

                'date_formatee' =>
                $absence->date_absence?->format('d/m/Y'),

                'annee_scolaire' =>
                $absence->anneeScolaire?->libelle,

                'classe' =>
                $absence->classe?->libelle,

                'duree' =>
                $absence->duree_heures,

                'justifiee' =>
                $absence->justifiee,

                'motif' =>
                $absence->motif,

                'educateur' =>
                $absence->educateur
                    ?->nom . ' ' .
                    $absence->educateur
                    ?->prenoms,

                'observation' =>
                $absence->observation,

                'numero_billet' =>
                $absence->numero_billet,

                'billet_edite' =>
                $absence->billet_edite,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | RETARDS
        |--------------------------------------------------------------------------
        */

        foreach ($eleve->retards as $retard) {

            $historique->push([
                'type' => 'retard',
                'libelle' => 'Retard',

                'date' =>
                $retard->date_retard?->format('Y-m-d'),

                'date_formatee' =>
                $retard->date_retard?->format('d/m/Y'),

                'annee_scolaire' =>
                $retard->anneeScolaire?->libelle,

                'classe' =>
                $retard->classe?->libelle,

                'duree' =>
                $retard->duree_minutes,

                'heure_prevue' =>
                $retard->heure_prevue,

                'heure_arrivee' =>
                $retard->heure_arrivee,

                'motif' =>
                $retard->motif,

                'educateur' =>
                $retard->educateur
                    ?->nom . ' ' .
                    $retard->educateur
                    ?->prenoms,

                'observation' =>
                $retard->observation,

                'numero_billet' =>
                $retard->numero_billet,

                'billet_edite' =>
                $retard->billet_edite,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | CONDUITE
        |--------------------------------------------------------------------------
        */

        foreach ($eleve->conduites as $conduite) {

            $date =
                $conduite
                ->evaluation
                ?->date_evaluation;

            $historique->push([
                'type' => 'conduite',
                'libelle' => 'Conduite',

                'date' =>
                $date?->format('Y-m-d'),

                'date_formatee' =>
                $date?->format('d/m/Y'),

                'annee_scolaire' =>
                $conduite->anneeScolaire?->libelle,

                'classe' =>
                $conduite->classe?->libelle,

                'note' =>
                $conduite->note,

                'motif' => null,

                'educateur' =>
                $conduite->educateur
                    ?->nom . ' ' .
                    $conduite->educateur
                    ?->prenoms,

                'observation' =>
                $conduite->observation,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | NOTES
        |--------------------------------------------------------------------------
        */

        foreach ($eleve->notes as $note) {

            $evaluation = $note->evaluation;

            $historique->push([
                'type' => 'note',
                'libelle' => 'Évaluation',

                'date' =>
                $evaluation
                    ?->date_evaluation
                    ?->format('Y-m-d'),

                'date_formatee' =>
                $evaluation
                    ?->date_evaluation
                    ?->format('d/m/Y'),

                'annee_scolaire' =>
                $evaluation
                    ?->anneeScolaire
                    ?->libelle,

                'classe' =>
                $evaluation
                    ?->classe
                    ?->libelle,

                'matiere' =>
                $evaluation
                    ?->matiere
                    ?->libelle,

                'evaluation' =>
                $evaluation?->libelle,

                'type_evaluation' =>
                $evaluation?->type,

                'note' =>
                $note->note,

                'bareme' =>
                $evaluation?->bareme,

                'coefficient' =>
                $evaluation?->coefficient,

                'absent' =>
                $note->absent,

                'appreciation' =>
                $note->appreciation,

                'observation' =>
                $note->observation,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | TRI
        |--------------------------------------------------------------------------
        */

        $historique = $historique
            ->sortByDesc(
                fn($item) => $item['date'] ?? ''
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | STATISTIQUES
        |--------------------------------------------------------------------------
        */

        $statistiques = [

            'absences' =>
            $eleve->absences->count(),

            'heures_absence' =>
            round(
                $eleve->absences->sum(
                    fn($absence) =>
                    (float) $absence->duree_heures
                ),
                2
            ),

            'absences_justifiees' =>
            $eleve->absences
                ->where('justifiee', true)
                ->count(),

            'absences_non_justifiees' =>
            $eleve->absences
                ->where('justifiee', false)
                ->count(),

            'retards' =>
            $eleve->retards->count(),

            'minutes_retard' =>
            $eleve->retards->sum('duree_minutes'),

            'conduites' =>
            $eleve->conduites->count(),

            'notes' =>
            $eleve->notes->count(),
        ];

        return Inertia::render(
            'Eleves/Show',
            [
                'eleve' => $eleve,
                'historique' => $historique,
                'statistiques' => $statistiques,
            ]
        );
    }


    /**
     * =========================================================================
     * FORMULAIRE DE MODIFICATION
     * =========================================================================
     */
    public function edit(Eleve $eleve)
    {
        $this->verifierAccesEleve($eleve);

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR : PAS DE MODIFICATION
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Professeur')) {
            abort(403);
        }

        $eleve->load([
            'etablissement',
            'anneeScolaire',
            'classe',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENTS
        |--------------------------------------------------------------------------
        */

        $etablissementsQuery =
            Etablissement::query()
            ->where('actif', true)
            ->orderBy('nom');

        if (!$user->hasRole('SuperAdmin')) {

            $etablissementsQuery->where(
                'id',
                $user->etablissement_id
            );
        }

        /*
        |--------------------------------------------------------------------------
        | CLASSES
        |--------------------------------------------------------------------------
        */

        $classesQuery =
            Classe::query()
            ->orderBy('libelle');

        if (!$user->hasRole('SuperAdmin')) {

            $classesQuery->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        if ($user->hasRole('Educateur')) {
            $classesQuery->whereIn(
                'id',
                EducateurClasse::query()
                    ->where('educateur_id', $user->educateur_id)
                    ->where('annee_scolaire_id', AnneeScolaire::activeId())
                    ->where('actif', true)
                    ->pluck('classe_id')
                    ->unique()
            );
        }

        return Inertia::render(
            'Eleves/Edit',
            [
                'eleve' => $eleve,

                'etablissements' =>
                $etablissementsQuery->get(),

                'annees' =>
                AnneeScolaire::query()
                    ->orderByDesc('date_debut')
                    ->get(),

                'classes' =>
                $classesQuery->get(),
            ]
        );
    }


    /**
     * =========================================================================
     * MODIFIER UN ÉLÈVE
     * =========================================================================
     */
    public function update(
        StoreEleveRequest $request,
        Eleve $eleve
    ) {
        $this->verifierAccesEleve($eleve);

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR INTERDIT
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Professeur')) {
            abort(403);
        }

        $validated = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (!$user->hasRole('SuperAdmin')) {

            $this->verifierEtablissementUtilisateur();

            $validated['etablissement_id'] =
                $user->etablissement_id;
        }

        /*
        |--------------------------------------------------------------------------
        | RESPONSABLE LÉGAL
        |--------------------------------------------------------------------------
        */

        $validated =
            $this->preparerResponsableLegal(
                $validated
            );

        /*
        |--------------------------------------------------------------------------
        | CLASSE
        |--------------------------------------------------------------------------
        */

        $classe =
            Classe::findOrFail(
                $validated['classe_id']
            );

        if (
            (int) $classe->etablissement_id !==
            (int) $validated['etablissement_id']
        ) {
            return back()
                ->withErrors([
                    'classe_id' =>
                    "La classe sélectionnée n'appartient pas à l'établissement choisi.",
                ])
                ->withInput();
        }

        if ($user->hasRole('Educateur')) {
            $autorise = EducateurClasse::query()
                ->where('educateur_id', $user->educateur_id)
                ->where('classe_id', $classe->id)
                ->where('annee_scolaire_id', $validated['annee_scolaire_id'])
                ->where('actif', true)
                ->exists();

            abort_unless($autorise, 403);
        }

        /*
        |--------------------------------------------------------------------------
        | ANNÉE SCOLAIRE
        |--------------------------------------------------------------------------
        */

        if (
            isset($classe->annee_scolaire_id) &&
            isset($validated['annee_scolaire_id']) &&
            (int) $classe->annee_scolaire_id !==
            (int) $validated['annee_scolaire_id']
        ) {
            return back()
                ->withErrors([
                    'classe_id' =>
                    "La classe sélectionnée n'appartient pas à l'année scolaire choisie.",
                ])
                ->withInput();
        }

        DB::transaction(
            function () use (
                $eleve,
                $validated
            ) {
                $eleve->update($validated);
            }
        );

        return redirect()
            ->route('eleves.index')
            ->with(
                'success',
                'Élève modifié avec succès.'
            );
    }


    /**
     * =========================================================================
     * CLASSES PAR ÉTABLISSEMENT + ANNÉE
     * =========================================================================
     */
    public function classesParEtablissement()
    {
        $user = auth()->user();

        $etablissementId =
            request('etablissement_id');

        $anneeScolaireId =
            request('annee_scolaire_id');

        if (
            !$etablissementId ||
            !$anneeScolaireId
        ) {
            return response()->json([]);
        }

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (!$user->hasRole('SuperAdmin')) {

            $this->verifierEtablissementUtilisateur();

            if (
                (int) $etablissementId !==
                (int) $user->etablissement_id
            ) {
                abort(403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | CLASSES
        |--------------------------------------------------------------------------
        */

        $classesQuery =
            Classe::query()
            ->where(
                'etablissement_id',
                $etablissementId
            )
            ->where(
                'annee_scolaire_id',
                $anneeScolaireId
            )
            ->orderBy('libelle');

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Professeur')) {

            $this->verifierCompteProfesseur();

            $classesQuery->whereIn(
                'id',
                Affectation::query()
                    ->where(
                        'enseignant_id',
                        $user->enseignant_id
                    )
                    ->where(
                        'etablissement_id',
                        $user->etablissement_id
                    )
                    ->where(
                        'annee_scolaire_id',
                        $anneeScolaireId
                    )
                    ->where('actif', true)
                    ->pluck('classe_id')
                    ->unique()
            );
        }

        $classes = $classesQuery->get([
            'id',
            'libelle',
            'etablissement_id',
            'annee_scolaire_id',
        ]);

        return response()->json($classes);
    }


    /**
     * =========================================================================
     * PRÉPARER LE RESPONSABLE LÉGAL
     * =========================================================================
     */
    private function preparerResponsableLegal(
        array $data
    ): array {

        $type =
            $data['type_tuteur'] ?? null;

        /*
        |--------------------------------------------------------------------------
        | PÈRE
        |--------------------------------------------------------------------------
        */

        if ($type === 'Père') {

            $data['type_tuteur_legal'] = 'PERE';

            $data['responsable_nom'] =
                $data['pere_nom'] ?? null;

            $data['responsable_prenoms'] =
                $data['pere_prenoms'] ?? null;

            $data['responsable_telephone'] =
                $data['pere_telephone'] ?? null;

            $data['responsable_email'] =
                $data['pere_email'] ?? null;

            $data['responsable_profession'] =
                $data['pere_profession'] ?? null;

            $data['responsable_adresse'] =
                $data['pere_adresse'] ?? null;
        }

        /*
        |--------------------------------------------------------------------------
        | MÈRE
        |--------------------------------------------------------------------------
        */ elseif ($type === 'Mère') {

            $data['type_tuteur_legal'] = 'MERE';

            $data['responsable_nom'] =
                $data['mere_nom'] ?? null;

            $data['responsable_prenoms'] =
                $data['mere_prenoms'] ?? null;

            $data['responsable_telephone'] =
                $data['mere_telephone'] ?? null;

            $data['responsable_email'] =
                $data['mere_email'] ?? null;

            $data['responsable_profession'] =
                $data['mere_profession'] ?? null;

            $data['responsable_adresse'] =
                $data['mere_adresse'] ?? null;
        }

        /*
        |--------------------------------------------------------------------------
        | AUTRE
        |--------------------------------------------------------------------------
        */ elseif ($type === 'Autre') {

            $data['type_tuteur_legal'] = 'AUTRE';

            $data['responsable_nom'] =
                $data['tuteur_nom'] ?? null;

            $data['responsable_prenoms'] =
                $data['tuteur_prenoms'] ?? null;

            $data['responsable_telephone'] =
                $data['tuteur_telephone'] ?? null;

            $data['responsable_email'] =
                $data['tuteur_email'] ?? null;

            $data['responsable_profession'] =
                $data['tuteur_profession'] ?? null;

            $data['responsable_adresse'] =
                $data['tuteur_adresse'] ?? null;
        }

        return $data;
    }


    /**
     * =========================================================================
     * FORMULAIRE D'IMPORTATION
     * =========================================================================
     */
    public function importForm()
    {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR : PAS D'IMPORT
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Professeur')) {
            abort(403);
        }

        $etablissementsQuery =
            Etablissement::query()
            ->where('actif', true)
            ->orderBy('nom');

        if (!$user->hasRole('SuperAdmin')) {

            $this->verifierEtablissementUtilisateur();

            $etablissementsQuery->where(
                'id',
                $user->etablissement_id
            );
        }

        return Inertia::render(
            'Eleves/Import',
            [
                'etablissements' =>
                $etablissementsQuery->get(),

                'annees' =>
                AnneeScolaire::query()
                    ->orderByDesc('date_debut')
                    ->get(),
            ]
        );
    }


    /**
     * =========================================================================
     * IMPORT EXCEL / CSV
     * =========================================================================
     */
    public function import(Request $request)
    {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR INTERDIT
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Professeur')) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate(
            [
                'etablissement_id' => [
                    'required',
                    'exists:etablissements,id',
                ],

                'annee_scolaire_id' => [
                    'required',
                    'exists:annee_scolaires,id',
                ],

                'fichier' => [
                    'required',
                    'file',
                    'mimes:xlsx,xls,csv',
                    'max:10240',
                ],
            ],
            [
                'etablissement_id.required' =>
                "Veuillez sélectionner un établissement.",

                'etablissement_id.exists' =>
                "L'établissement sélectionné n'existe pas.",

                'annee_scolaire_id.required' =>
                "Veuillez sélectionner une année scolaire.",

                'annee_scolaire_id.exists' =>
                "L'année scolaire sélectionnée n'existe pas.",

                'fichier.required' =>
                "Veuillez sélectionner un fichier Excel.",

                'fichier.file' =>
                "Le fichier transmis est invalide.",

                'fichier.mimes' =>
                "Le fichier doit être au format Excel (.xlsx, .xls) ou CSV.",

                'fichier.max' =>
                "Le fichier ne doit pas dépasser 10 Mo.",
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (!$user->hasRole('SuperAdmin')) {

            $this->verifierEtablissementUtilisateur();

            if (
                (int) $validated['etablissement_id'] !==
                (int) $user->etablissement_id
            ) {
                abort(403);
            }

            $validated['etablissement_id'] =
                $user->etablissement_id;
        }

        /*
        |--------------------------------------------------------------------------
        | IMPORT
        |--------------------------------------------------------------------------
        */

        try {

            $import =
                new ElevesImport(
                    (int) $validated['etablissement_id'],
                    (int) $validated['annee_scolaire_id']
                );

            Excel::import(
                $import,
                $validated['fichier']
            );

            return redirect()
                ->route('eleves.index')
                ->with(
                    'success',
                    $import->nombreImportes .
                        ' élève(s) importé(s) avec succès.'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | ERREURS EXCEL
        |--------------------------------------------------------------------------
        */ catch (
            \Maatwebsite\Excel\Validators\ValidationException $e
        ) {

            $erreurs = [];

            foreach ($e->failures() as $failure) {

                $valeurs =
                    $failure->values();

                $attribute =
                    $failure->attribute();

                $erreurs[] = [
                    'ligne' =>
                    $failure->row(),

                    'champ' =>
                    $attribute,

                    'erreurs' =>
                    $failure->errors(),

                    'valeur' =>
                    $valeurs[$attribute] ?? null,
                ];
            }

            return back()
                ->with(
                    'import_errors',
                    $erreurs
                )
                ->withErrors([
                    'fichier' =>
                    "Le fichier contient des erreurs. Aucun élève n'a été importé.",
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | AUTRE ERREUR
        |--------------------------------------------------------------------------
        */ catch (\Throwable $e) {

            return back()
                ->withErrors([
                    'fichier' =>
                    $e->getMessage(),
                ])
                ->withInput();
        }
    }


    /**
     * =========================================================================
     * MODÈLE EXCEL
     * =========================================================================
     */
    public function importTemplate(Request $request)
    {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR INTERDIT
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Professeur')) {
            abort(403);
        }

        $validated =
            $request->validate(
                [
                    'etablissement_id' => [
                        'required',
                        'exists:etablissements,id',
                    ],

                    'annee_scolaire_id' => [
                        'required',
                        'exists:annee_scolaires,id',
                    ],
                ]
            );

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (!$user->hasRole('SuperAdmin')) {

            $this->verifierEtablissementUtilisateur();

            if (
                (int) $validated['etablissement_id'] !==
                (int) $user->etablissement_id
            ) {
                abort(403);
            }

            $validated['etablissement_id'] =
                $user->etablissement_id;
        }

        return Excel::download(
            new ElevesTemplateExport(
                (int) $validated['etablissement_id'],
                (int) $validated['annee_scolaire_id']
            ),
            'modele_importation_eleves.xlsx'
        );
    }


    /**
     * =========================================================================
     * SUPPRIMER
     * =========================================================================
     */
    public function destroy(Eleve $eleve)
    {
        abort_unless(
            auth()->user()->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Directeur',
            ]),
            403,
            'Vous n’avez pas l’autorisation de supprimer un élève.'
        );

        $this->verifierAccesEleve($eleve);

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR INTERDIT
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Professeur')) {
            abort(403);
        }

        $eleve->delete();

        return redirect()
            ->route('eleves.index')
            ->with(
                'success',
                'Élève supprimé avec succès.'
            );
    }


    /**
     * =========================================================================
     * VÉRIFIER L'ACCÈS À UN ÉLÈVE
     * =========================================================================
     */
    private function verifierAccesEleve(
        Eleve $eleve
    ): Eleve {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('SuperAdmin')) {
            return $eleve;
        }

        /*
        |--------------------------------------------------------------------------
        | COMPTE SANS ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        $this->verifierEtablissementUtilisateur();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        abort_unless(
            (int) $eleve->etablissement_id ===
                (int) $user->etablissement_id,
            403
        );

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Professeur')) {

            $this->verifierCompteProfesseur();

            $autorise = Affectation::query()
                ->where(
                    'enseignant_id',
                    $user->enseignant_id
                )
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->where(
                    'classe_id',
                    $eleve->classe_id
                )
                ->where(
                    'annee_scolaire_id',
                    $eleve->annee_scolaire_id
                )
                ->where('actif', true)
                ->exists();

            abort_unless($autorise, 403);
        }

        if ($user->hasRole('Educateur')) {
            abort_unless(
                $user->educateur_id &&
                    EducateurClasse::query()
                    ->where('educateur_id', $user->educateur_id)
                    ->where('classe_id', $eleve->classe_id)
                    ->where('annee_scolaire_id', $eleve->annee_scolaire_id)
                    ->where('actif', true)
                    ->exists(),
                403
            );
        }

        return $eleve;
    }

    private function elevesModifiablesPourEducateur($user, $eleves): array
    {
        if (!$user->educateur_id) {
            return [];
        }

        $affectations = EducateurClasse::query()
            ->where('educateur_id', $user->educateur_id)
            ->where('actif', true)
            ->get(['classe_id', 'annee_scolaire_id']);

        return $eleves
            ->filter(function ($eleve) use ($affectations) {
                return $affectations->contains(
                    fn($affectation) =>
                    (int) $affectation->classe_id === (int) $eleve->classe_id &&
                        (int) $affectation->annee_scolaire_id === (int) $eleve->annee_scolaire_id
                );
            })
            ->pluck('id')
            ->values()
            ->all();
    }


    /**
     * =========================================================================
     * APPLIQUER LE PÉRIMÈTRE DU PROFESSEUR À UNE REQUÊTE ÉLÈVES
     * =========================================================================
     */
    private function appliquerAccesProfesseur(
        $query,
        $user
    ): void {

        /*
        |--------------------------------------------------------------------------
        | RÉCUPÉRATION DES AFFECTATIONS ACTIVES
        |--------------------------------------------------------------------------
        */

        $affectations = Affectation::query()
            ->where(
                'enseignant_id',
                $user->enseignant_id
            )
            ->where(
                'etablissement_id',
                $user->etablissement_id
            )
            ->where('actif', true)
            ->get([
                'classe_id',
                'annee_scolaire_id',
            ]);

        /*
        |--------------------------------------------------------------------------
        | AUCUNE AFFECTATION
        |--------------------------------------------------------------------------
        */

        if ($affectations->isEmpty()) {

            $query->whereRaw('1 = 0');

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CLASSE + ANNÉE
        |--------------------------------------------------------------------------
        |
        | On associe bien la classe ET l'année scolaire afin d'éviter
        | qu'un professeur voie une classe d'une autre année.
        |
        */

        $query->where(function ($q) use ($affectations) {

            foreach ($affectations as $affectation) {

                $q->orWhere(function ($subQuery) use (
                    $affectation
                ) {

                    $subQuery
                        ->where(
                            'classe_id',
                            $affectation->classe_id
                        )
                        ->where(
                            'annee_scolaire_id',
                            $affectation->annee_scolaire_id
                        );
                });
            }
        });

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        $query->where(
            'etablissement_id',
            $user->etablissement_id
        );
    }


    /**
     * =========================================================================
     * VÉRIFIER LE COMPTE PROFESSEUR
     * =========================================================================
     */
    private function verifierCompteProfesseur(): void
    {
        $user = auth()->user();

        abort_unless(
            $user->enseignant_id &&
                $user->etablissement_id,
            403,
            "Votre compte professeur n'est pas correctement rattaché à un enseignant ou à un établissement."
        );
    }


    /**
     * =========================================================================
     * VÉRIFIER L'ÉTABLISSEMENT DE L'UTILISATEUR
     * =========================================================================
     */
    private function verifierEtablissementUtilisateur(): void
    {
        $user = auth()->user();

        abort_unless(
            $user->etablissement_id,
            403,
            "Votre compte n'est associé à aucun établissement."
        );
    }
}
