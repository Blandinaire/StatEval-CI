<?php

namespace App\Http\Controllers;

use App\Exports\ElevesTemplateExport;
use App\Imports\ElevesImport;
use App\Http\Requests\StoreEleveRequest;
use App\Http\Requests\UpdateElevesBulkRequest;
use App\Models\Affectation;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Note;
use App\Models\Conduite;
use App\Models\Absence;
use App\Models\Retard;
use App\Models\EducateurClasse;
use App\Models\Etablissement;
use App\Exports\ElevesCorrectionExport;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
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

            /*
        |--------------------------------------------------------------------------
        | FILTRE ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

            if (request()->filled('etablissement_id')) {

                $query->where(
                    'etablissement_id',
                    request('etablissement_id')
                );
            }
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
    | CLASSES ACCESSIBLES POUR LES FILTRES ET LA MODIFICATION GROUPÉE
    |--------------------------------------------------------------------------
    |
    | On charge ici les relations cycle / niveau / série afin que le
    | frontend puisse construire les listes dépendantes :
    |
    | Établissement
    |      ↓
    | Année scolaire
    |      ↓
    | Cycle
    |      ↓
    | Niveau
    |      ↓
    | Classe
    |      ↓
    | Série
    |
    |--------------------------------------------------------------------------
    */

        $classesQuery = Classe::with([
            'niveau',
            'cycle',
            'serie',
        ])->orderBy('libelle');

        if ($user->hasRole('SuperAdmin')) {

            // Toutes les classes sont accessibles.

        } elseif ($user->hasRole('Professeur')) {

            $this->verifierCompteProfesseur();

            $classesQuery
                ->where('etablissement_id', $user->etablissement_id)
                ->whereIn(
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

        $classes = $classesQuery->get([
            'id',
            'libelle',
            'etablissement_id',
            'annee_scolaire_id',
            'cycle_id',
            'niveau_id',
            'serie_id',
        ]);

        /*
    |--------------------------------------------------------------------------
    | ANNÉES SCOLAIRES
    |--------------------------------------------------------------------------
    |
    | Elles sont utilisées par la modification groupée.
    |
    |--------------------------------------------------------------------------
    */

        $annees = AnneeScolaire::query()
            ->orderByDesc('id')
            ->get([
                'id',
                'libelle',
            ]);

        /*
    |--------------------------------------------------------------------------
    | ÉTABLISSEMENTS POUR LE SUPERADMIN
    |--------------------------------------------------------------------------
    */

        $etablissements = collect();

        if ($user->hasRole('SuperAdmin')) {

            $etablissements = Etablissement::query()
                ->orderBy('nom')
                ->get([
                    'id',
                    'nom',
                ]);
        }

        $elevesModifiables = $user->hasRole('Educateur')
            ? $this->elevesModifiablesPourEducateur($user, $eleves)
            : null;

        $peutModifierGroupe = !$user->hasRole('Professeur')
            && (
                !$user->hasRole('Educateur')
                || count($elevesModifiables) > 0
            );

        /*
    |--------------------------------------------------------------------------
    | RÉPONSE INERTIA
    |--------------------------------------------------------------------------
    */

        return Inertia::render('Eleves/Index', [

            /*
        |--------------------------------------------------------------------------
        | ÉLÈVES
        |--------------------------------------------------------------------------
        */

            'eleves' => $eleves,

            /*
        |--------------------------------------------------------------------------
        | CLASSES
        |--------------------------------------------------------------------------
        |
        | Les relations niveau / cycle / série sont maintenant disponibles
        | côté React.
        |
        |--------------------------------------------------------------------------
        */

            'classes' => $classes,

            /*
        |--------------------------------------------------------------------------
        | ANNÉES SCOLAIRES
        |--------------------------------------------------------------------------
        */

            'annees' => $annees,

            /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENTS
        |--------------------------------------------------------------------------
        */

            'etablissements' => $etablissements,

            /*
        |--------------------------------------------------------------------------
        | FILTRES
        |--------------------------------------------------------------------------
        */

            'filtres' => [
                'etablissement_id' => request('etablissement_id'),
            ],

            /*
        |--------------------------------------------------------------------------
        | DROITS
        |--------------------------------------------------------------------------
        */

            'peutModifierGroupe' => $peutModifierGroupe,

            'isSuperAdmin' => $user->hasRole('SuperAdmin'),

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
     * MODIFICATION GROUPÉE DES ÉLÈVES
     * =========================================================================
     */
    /**
     * =========================================================================
     * MODIFICATION GROUPÉE DES ÉLÈVES
     * =========================================================================
     */
    public function updateBulk(
        UpdateElevesBulkRequest $request
    ) {
        $user = auth()->user();

        /*
    |--------------------------------------------------------------------------
    | PROFESSEUR INTERDIT
    |--------------------------------------------------------------------------
    */

        if ($user->hasRole('Professeur')) {
            abort(403);
        }

        $eleves = $request->validated()['eleves'];

        /*
    |--------------------------------------------------------------------------
    | CHAMPS AUTORISÉS
    |--------------------------------------------------------------------------
    */

        $champsAutorises = [
            'matricule',
            'nom',
            'prenoms',
            'sexe',
            'date_naissance',
            'lieu_naissance',
            'nationalite',
            'telephone',
            'email',
            'adresse',
            'statut',
            'statut_affectation',
            'regime',
            'redoublant',
            'boursier',

            'type_tuteur',

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

            'tuteur_nom',
            'tuteur_prenoms',
            'tuteur_telephone',
            'tuteur_email',
            'tuteur_profession',
            'tuteur_adresse',

            'etablissement_id',
            'annee_scolaire_id',
            'classe_id',

            'actif',
        ];

        DB::transaction(function () use (
            $eleves,
            $user,
            $champsAutorises
        ) {
            foreach ($eleves as $index => $data) {

                /*
            |--------------------------------------------------------------------------
            | ÉLÈVE
            |--------------------------------------------------------------------------
            */

                $eleve = Eleve::findOrFail($data['id']);

                $this->verifierAccesEleve($eleve);

                /*
            |--------------------------------------------------------------------------
            | ÉTABLISSEMENT
            |--------------------------------------------------------------------------
            */

                if (!$user->hasRole('SuperAdmin')) {

                    $this->verifierEtablissementUtilisateur();

                    $etablissementId =
                        $user->etablissement_id;
                } else {

                    $etablissementId =
                        $data['etablissement_id']
                        ?? $eleve->etablissement_id;
                }

                /*
            |--------------------------------------------------------------------------
            | ANNÉE / CLASSE
            |--------------------------------------------------------------------------
            */

                $anneeScolaireId =
                    $data['annee_scolaire_id']
                    ?? $eleve->annee_scolaire_id;

                $classeId =
                    $data['classe_id']
                    ?? $eleve->classe_id;

                $classe = Classe::findOrFail($classeId);

                /*
            |--------------------------------------------------------------------------
            | COHÉRENCE ÉTABLISSEMENT / CLASSE
            |--------------------------------------------------------------------------
            */

                if (
                    (int) $classe->etablissement_id !==
                    (int) $etablissementId
                ) {
                    throw ValidationException::withMessages([
                        "eleves.$index.classe_id" =>
                        "La classe sélectionnée n'appartient pas à l'établissement choisi.",
                    ]);
                }

                /*
            |--------------------------------------------------------------------------
            | COHÉRENCE ANNÉE SCOLAIRE
            |--------------------------------------------------------------------------
            */

                if (
                    isset($classe->annee_scolaire_id) &&
                    (int) $classe->annee_scolaire_id !==
                    (int) $anneeScolaireId
                ) {
                    throw ValidationException::withMessages([
                        "eleves.$index.classe_id" =>
                        "La classe sélectionnée n'appartient pas à l'année scolaire choisie.",
                    ]);
                }

                /*
            |--------------------------------------------------------------------------
            | ÉDUCATEUR
            |--------------------------------------------------------------------------
            */

                if ($user->hasRole('Educateur')) {

                    $autorise =
                        EducateurClasse::query()
                        ->where(
                            'educateur_id',
                            $user->educateur_id
                        )
                        ->where(
                            'classe_id',
                            $classe->id
                        )
                        ->where(
                            'annee_scolaire_id',
                            $anneeScolaireId
                        )
                        ->where('actif', true)
                        ->exists();

                    abort_unless($autorise, 403);
                }

                /*
            |--------------------------------------------------------------------------
            | MATRICULE
            |--------------------------------------------------------------------------
            */

                if (
                    array_key_exists(
                        'matricule',
                        $data
                    ) &&
                    !empty($data['matricule'])
                ) {

                    $existe =
                        Eleve::query()
                        ->where(
                            'matricule',
                            $data['matricule']
                        )
                        ->where(
                            'id',
                            '!=',
                            $eleve->id
                        )
                        ->exists();

                    if ($existe) {
                        throw ValidationException::withMessages([
                            "eleves.$index.matricule" =>
                            "Ce matricule est déjà attribué à un autre élève.",
                        ]);
                    }
                }

                /*
            |--------------------------------------------------------------------------
            | FILTRAGE DES CHAMPS
            |--------------------------------------------------------------------------
            */

                $modifications = [];

                foreach ($champsAutorises as $champ) {
                    if (array_key_exists($champ, $data)) {
                        $modifications[$champ] = $data[$champ];
                    }
                }

                /*
            |--------------------------------------------------------------------------
            | FORCER L'ÉTABLISSEMENT POUR LES UTILISATEURS
            | QUI NE SONT PAS SUPERADMIN
            |--------------------------------------------------------------------------
            */

                if (!$user->hasRole('SuperAdmin')) {
                    $modifications['etablissement_id'] =
                        $etablissementId;
                }

                /*
            |--------------------------------------------------------------------------
            | RESPONSABLE LÉGAL
            |--------------------------------------------------------------------------
            */

                $champsTuteur = [
                    'type_tuteur',

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

                    'tuteur_nom',
                    'tuteur_prenoms',
                    'tuteur_telephone',
                    'tuteur_email',
                    'tuteur_profession',
                    'tuteur_adresse',
                ];

                $tuteurModifie = false;

                foreach ($champsTuteur as $champ) {
                    if (array_key_exists($champ, $data)) {
                        $tuteurModifie = true;
                        break;
                    }
                }

                if ($tuteurModifie) {

                    /*
                |--------------------------------------------------------------------------
                | On travaille uniquement avec les attributs
                | de la table, pas avec les relations.
                |--------------------------------------------------------------------------
                */

                    $donneesComplete =
                        array_merge(
                            $eleve->getAttributes(),
                            $modifications
                        );

                    $donneesComplete =
                        $this->preparerResponsableLegal(
                            $donneesComplete
                        );

                    /*
                |--------------------------------------------------------------------------
                | On ne conserve que les champs autorisés
                |--------------------------------------------------------------------------
                */

                    foreach (
                        array_keys($donneesComplete)
                        as $champ
                    ) {
                        if (
                            !in_array(
                                $champ,
                                array_merge(
                                    $champsAutorises,
                                    [
                                        'responsable_nom',
                                        'responsable_prenoms',
                                        'responsable_telephone',
                                        'responsable_email',
                                        'responsable_profession',
                                        'responsable_adresse',
                                        'type_tuteur_legal',
                                    ]
                                )
                            )
                        ) {
                            unset($donneesComplete[$champ]);
                        }
                    }

                    $modifications =
                        $donneesComplete;
                }

                /*
            |--------------------------------------------------------------------------
            | CLASSE / ANNÉE
            |--------------------------------------------------------------------------
            */

                if (
                    array_key_exists(
                        'classe_id',
                        $data
                    )
                ) {
                    $modifications['classe_id'] =
                        $classeId;
                }

                if (
                    array_key_exists(
                        'annee_scolaire_id',
                        $data
                    )
                ) {
                    $modifications['annee_scolaire_id'] =
                        $anneeScolaireId;
                }

                /*
            |--------------------------------------------------------------------------
            | ENREGISTREMENT
            |--------------------------------------------------------------------------
            */

                $eleve->update($modifications);
            }
        });

        return redirect()
            ->route('eleves.index')
            ->with(
                'success',
                count($eleves) .
                    ' élève(s) modifié(s) avec succès.'
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
    | VALIDATION DU FORMULAIRE
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

            $import = new ElevesImport(
                (int) $validated['etablissement_id'],
                (int) $validated['annee_scolaire_id']
            );

            Excel::import(
                $import,
                $validated['fichier']
            );

            /*
        |--------------------------------------------------------------------------
        | RÉCUPÉRATION DU RAPPORT
        |--------------------------------------------------------------------------
        */

            $nombreImportes =
                $import->nombreImportes;

            $erreursBrutes =
                $import->getErreurs();

            $lignesRejetees = $import->getLignesRejetees();

            /*
        |--------------------------------------------------------------------------
        | NORMALISATION DU RAPPORT POUR REACT
        |--------------------------------------------------------------------------
        */

            $erreurs = collect($erreursBrutes)
                ->map(function ($erreur) {

                    return [
                        'ligne' =>
                        $erreur['ligne'] ?? null,

                        'champ' =>
                        $erreur['champ'] ?? '—',

                        'valeur' =>
                        $erreur['valeur'] ?? null,

                        'erreurs' =>
                        is_array($erreur['erreurs'] ?? null)
                            ? $erreur['erreurs']
                            : [
                                (string) ($erreur['erreurs'] ?? 'Erreur inconnue.'),
                            ],

                        'matricule' =>
                        $erreur['matricule'] ?? null,

                        'nom' =>
                        $erreur['nom'] ?? null,

                        'prenoms' =>
                        $erreur['prenoms'] ?? null,

                        'statut' =>
                        $erreur['statut'] ?? 'Erreur',
                    ];
                })
                ->values()
                ->all();

            $correctionToken = null;

            if (count($lignesRejetees) > 0) {

                $correctionToken = Str::random(48);

                $directory = storage_path(
                    'app/import_corrections'
                );

                if (!is_dir($directory)) {
                    mkdir($directory, 0755, true);
                }

                $path = $directory . '/' . $correctionToken . '.xlsx';

                Excel::store(
                    new ElevesCorrectionExport(
                        $lignesRejetees,
                        (int) $validated['etablissement_id'],
                        (int) $validated['annee_scolaire_id']
                    ),
                    'import_corrections/' . $correctionToken . '.xlsx',
                    'local'
                );

                session()->put(
                    'import_correction_file',
                    $correctionToken
                );
            }
            /*
        |--------------------------------------------------------------------------
        | AUCUNE ERREUR
        |--------------------------------------------------------------------------
        */

            if (count($erreurs) === 0) {

                return redirect()
                    ->route('eleves.index')
                    ->with(
                        'success',
                        $nombreImportes .
                            ' élève(s) importé(s) avec succès.'
                    );
            }

            /*
        |--------------------------------------------------------------------------
        | IMPORT PARTIEL
        |--------------------------------------------------------------------------
        |
        | Certaines lignes ont été importées et d'autres rejetées.
        |
        */

            $nombreLignesRejetees = count($erreurs);

            return redirect()
                ->route('eleves.import.form')
                ->with(
                    'success',
                    $nombreImportes . ' élève(s) importé(s) avec succès. '
                        . $nombreLignesRejetees . ' ligne(s) rejetée(s).'
                )
                ->with('import_errors', $erreurs)
                ->with('import_summary', [
                    'importes' => $nombreImportes,
                    'erreurs' => $nombreLignesRejetees,
                ])
                ->with('import_correction_token', $correctionToken);
        }

        /*
    |--------------------------------------------------------------------------
    | ERREUR GÉNÉRALE
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

    public function downloadCorrection(string $token)
    {
        $user = auth()->user();

        if ($user->hasRole('Professeur')) {
            abort(403);
        }

        $sessionToken = session('import_correction_file');

        if (!$sessionToken || !hash_equals($sessionToken, $token)) {
            abort(403);
        }

        $relativePath =
            'import_corrections/' . $token . '.xlsx';

        if (!Storage::disk('local')->exists($relativePath)) {
            abort(404);
        }

        $path = Storage::disk('local')->path($relativePath);

        return response()
            ->download(
                $path,
                'eleves_a_corriger.xlsx'
            )
            ->deleteFileAfterSend(true);
    }

    public function suppressionGroupee(Request $request)
    {
        $user = auth()->user();

        /*
    |--------------------------------------------------------------------------
    | AUTORISATION
    |--------------------------------------------------------------------------
    |
    | Les mêmes rôles que pour la suppression individuelle :
    | - SuperAdmin
    | - Administrateur
    | - Directeur
    |
    | Les Educateurs et Professeurs sont explicitement exclus.
    |
    */

        abort_unless(
            $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Directeur',
            ]),
            403,
            'Vous n’avez pas l’autorisation de supprimer un élève.'
        );

        /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

        $validated = $request->validate([
            'eleves' => [
                'required',
                'array',
                'min:1',
            ],

            'eleves.*' => [
                'required',
                'integer',
                'exists:eleves,id',
            ],
        ], [
            'eleves.required' => 'Veuillez sélectionner au moins un élève.',
            'eleves.array' => 'La sélection des élèves est invalide.',
            'eleves.min' => 'Veuillez sélectionner au moins un élève.',
            'eleves.*.required' => 'Un élève sélectionné est invalide.',
            'eleves.*.integer' => 'Un identifiant élève est invalide.',
            'eleves.*.exists' => 'Un ou plusieurs élèves sélectionnés n’existent plus.',
        ]);

        /*
    |--------------------------------------------------------------------------
    | NORMALISATION DES IDS
    |--------------------------------------------------------------------------
    */

        $eleveIds = collect($validated['eleves'])
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values();

        /*
    |--------------------------------------------------------------------------
    | VÉRIFICATION DE L'ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    |
    | Le SuperAdmin peut supprimer des élèves de n'importe quel établissement.
    |
    | Les Administrateurs et Directeurs sont strictement limités
    | à leur établissement.
    |
    */

        if (!$user->hasRole('SuperAdmin')) {

            $this->verifierEtablissementUtilisateur();

            $nombreAutorises = Eleve::query()
                ->whereIn('id', $eleveIds)
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->count();

            /*
         * Si un seul élève sélectionné appartient à un autre établissement,
         * toute l'opération est refusée.
         */
            abort_unless(
                $nombreAutorises === $eleveIds->count(),
                403,
                'Un ou plusieurs élèves sélectionnés ne relèvent pas de votre établissement.'
            );
        }

        /*
    |--------------------------------------------------------------------------
    | SUPPRESSION TRANSACTIONNELLE
    |--------------------------------------------------------------------------
    |
    | Toutes les données dépendantes sont supprimées avant les élèves.
    | En cas d'erreur, toute la transaction est annulée.
    |
    */

        DB::transaction(function () use ($eleveIds) {

            /*
         * Notes
         */
            Note::whereIn('eleve_id', $eleveIds)->delete();

            /*
         * Conduite
         */
            Conduite::whereIn('eleve_id', $eleveIds)->delete();

            /*
         * Absences
         */
            Absence::whereIn('eleve_id', $eleveIds)->delete();

            /*
         * Retards
         */
            Retard::whereIn('eleve_id', $eleveIds)->delete();

            /*
         * Élèves
         */
            Eleve::whereIn('id', $eleveIds)->delete();
        });

        /*
    |--------------------------------------------------------------------------
    | RETOUR
    |--------------------------------------------------------------------------
    */

        return redirect()
            ->route('eleves.index')
            ->with(
                'success',
                $eleveIds->count() .
                    ' élève(s) et leurs données associées ont été supprimés avec succès.'
            );
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
