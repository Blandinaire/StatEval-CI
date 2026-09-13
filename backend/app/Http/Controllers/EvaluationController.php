<?php

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Enseignant;
use App\Models\Etablissement;
use App\Models\Evaluation;
use App\Models\Matiere;
use App\Models\Affectation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    /**
     * Vérifie si l'utilisateur est SuperAdmin.
     */
    private function estSuperAdmin($user): bool
    {
        return $user->hasRole('SuperAdmin');
    }

    /**
     * Vérifie si l'utilisateur est professeur.
     */
    private function estProfesseur($user): bool
    {
        return $user->hasRole('Professeur');
    }

    /**
     * Vérifie qu'un professeur possède bien un
     * enseignant_id lié à son compte utilisateur.
     */
    private function verifierCompteProfesseur($user): void
    {
        if ($this->estProfesseur($user)) {
            abort_unless(
                !empty($user->enseignant_id),
                403,
                'Votre compte professeur n\'est pas correctement rattaché à votre profil enseignant.'
            );
        }
    }

    /**
     * Vérifie qu'une évaluation appartient au périmètre
     * autorisé de l'utilisateur.
     *
     * SuperAdmin :
     *   accès à tout.
     *
     * Professeur :
     *   uniquement ses propres évaluations,
     *   dans son établissement.
     *
     * Autres utilisateurs :
     *   uniquement leur établissement.
     */
    private function verifierAccesEvaluation(
        $user,
        Evaluation $evaluation
    ): void {
        /*
        |--------------------------------------------------------------------------
        | SuperAdmin
        |--------------------------------------------------------------------------
        */

        if ($this->estSuperAdmin($user)) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Professeur
        |--------------------------------------------------------------------------
        */

        if ($this->estProfesseur($user)) {

            $this->verifierCompteProfesseur($user);

            abort_unless(
                (int) $evaluation->etablissement_id ===
                    (int) $user->etablissement_id,
                403
            );

            abort_unless(
                (int) $evaluation->enseignant_id ===
                    (int) $user->enseignant_id,
                403
            );

            /*
            |--------------------------------------------------------------------------
            | Vérification de l'affectation
            |--------------------------------------------------------------------------
            |
            | Le professeur doit être réellement affecté à la
            | classe + matière + année de cette évaluation.
            |
            */

            $affectationExiste = Affectation::query()
                ->where('etablissement_id', $evaluation->etablissement_id)
                ->where('annee_scolaire_id', $evaluation->annee_scolaire_id)
                ->where('classe_id', $evaluation->classe_id)
                ->where('matiere_id', $evaluation->matiere_id)
                ->where('enseignant_id', $user->enseignant_id)
                ->where('actif', true)
                ->exists();

            abort_unless(
                $affectationExiste,
                403
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Autres utilisateurs
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $user->etablissement_id &&
                (int) $evaluation->etablissement_id ===
                (int) $user->etablissement_id,
            403
        );
    }

    /**
     * Liste des évaluations.
     */
    public function index()
    {
        $user = auth()->user();

        $isSuperAdmin = $this->estSuperAdmin($user);

        /*
    |--------------------------------------------------------------------------
    | SuperAdmin
    |--------------------------------------------------------------------------
    */
        if ($isSuperAdmin) {
            $evaluations = Evaluation::with([
                'etablissement',
                'anneeScolaire',
                'classe',
                'matiere',
                'enseignant',
            ])
                ->orderByDesc('date_evaluation')
                ->orderByDesc('id')
                ->get();

            $etablissements = Etablissement::where('actif', true)
                ->orderBy('nom')
                ->get(['id', 'nom']);

            $classes = Classe::with([
                'etablissement',
                'anneeScolaire',
            ])
                ->orderBy('libelle')
                ->get();

            $matieres = Matiere::orderBy('libelle')
                ->get();

            $enseignants = Enseignant::orderBy('nom')
                ->orderBy('prenoms')
                ->get();

            $periodes = Evaluation::whereNotNull('periode')
                ->distinct()
                ->orderBy('periode')
                ->pluck('periode')
                ->values();
        }

        /*
    |--------------------------------------------------------------------------
    | Professeur
    |--------------------------------------------------------------------------
    */ elseif ($this->estProfesseur($user)) {

            $this->verifierCompteProfesseur($user);

            $affectations = Affectation::query()
                ->where('etablissement_id', $user->etablissement_id)
                ->where('enseignant_id', $user->enseignant_id)
                ->where('actif', true)
                ->get([
                    'annee_scolaire_id',
                    'classe_id',
                    'matiere_id',
                    'enseignant_id',
                    'etablissement_id',
                ]);

            $classeIds = $affectations
                ->pluck('classe_id')
                ->unique()
                ->values();

            $matiereIds = $affectations
                ->pluck('matiere_id')
                ->unique()
                ->values();

            $evaluations = Evaluation::with([
                'etablissement',
                'anneeScolaire',
                'classe',
                'matiere',
                'enseignant',
            ])
                ->where('etablissement_id', $user->etablissement_id)
                ->where('enseignant_id', $user->enseignant_id)
                ->orderByDesc('date_evaluation')
                ->orderByDesc('id')
                ->get();

            $etablissements = Etablissement::where(
                'id',
                $user->etablissement_id
            )
                ->where('actif', true)
                ->get(['id', 'nom']);

            $classes = Classe::where(
                'etablissement_id',
                $user->etablissement_id
            )
                ->whereIn('id', $classeIds)
                ->with(['etablissement', 'anneeScolaire'])
                ->orderBy('libelle')
                ->get();

            $matieres = Matiere::whereIn('id', $matiereIds)
                ->orderBy('libelle')
                ->get();

            $enseignants = Enseignant::where(
                'id',
                $user->enseignant_id
            )
                ->get();

            $periodes = $evaluations
                ->pluck('periode')
                ->filter()
                ->unique()
                ->values();
        }

        /*
    |--------------------------------------------------------------------------
    | Administrateur / Direction
    |--------------------------------------------------------------------------
    */ else {

            $etablissementId = $user->etablissement_id;

            $evaluations = Evaluation::with([
                'etablissement',
                'anneeScolaire',
                'classe',
                'matiere',
                'enseignant',
            ])
                ->where('etablissement_id', $etablissementId)
                ->orderByDesc('date_evaluation')
                ->orderByDesc('id')
                ->get();

            $etablissements = Etablissement::where(
                'id',
                $etablissementId
            )
                ->where('actif', true)
                ->get(['id', 'nom']);

            $classes = Classe::where(
                'etablissement_id',
                $etablissementId
            )
                ->with(['etablissement', 'anneeScolaire'])
                ->orderBy('libelle')
                ->get();

            $matieres = Matiere::orderBy('libelle')
                ->get();

            $enseignants = Enseignant::where(
                'etablissement_id',
                $etablissementId
            )
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get();

            $periodes = $evaluations
                ->pluck('periode')
                ->filter()
                ->unique()
                ->values();
        }

        return Inertia::render('Evaluations/Index', [
            'evaluations' => $evaluations,
            'etablissements' => $etablissements,
            'classes' => $classes,
            'matieres' => $matieres,
            'enseignants' => $enseignants,
            'periodes' => $periodes,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create()
    {
        $user = auth()->user();

        /*
    |--------------------------------------------------------------------------
    | ANNÉE SCOLAIRE ACTIVE
    |--------------------------------------------------------------------------
    | La table annee_scolaires ne possède pas de colonne "actif".
    | On considère donc comme année active l'année scolaire ayant
    | la date de début la plus récente.
    |--------------------------------------------------------------------------
    */

        $anneeScolaireActive = AnneeScolaire::query()
            ->orderByDesc('date_debut')
            ->first();

        if (!$anneeScolaireActive) {
            abort(422, "Aucune année scolaire n'est définie.");
        }

        /*
    |--------------------------------------------------------------------------
    | PROFESSEUR
    |--------------------------------------------------------------------------
    */

        if ($this->estProfesseur($user)) {

            $this->verifierCompteProfesseur($user);

            /*
        |--------------------------------------------------------------------------
        | Affectations actives du professeur pour l'année active
        |--------------------------------------------------------------------------
        */

            $affectations = Affectation::query()
                ->where('etablissement_id', $user->etablissement_id)
                ->where('enseignant_id', $user->enseignant_id)
                ->where('annee_scolaire_id', $anneeScolaireActive->id)
                ->where('actif', true)
                ->get([
                    'id',
                    'etablissement_id',
                    'annee_scolaire_id',
                    'classe_id',
                    'matiere_id',
                    'enseignant_id',
                ]);

            /*
        |--------------------------------------------------------------------------
        | IDs autorisés
        |--------------------------------------------------------------------------
        */

            $classeIds = $affectations
                ->pluck('classe_id')
                ->unique()
                ->values();

            $matiereIds = $affectations
                ->pluck('matiere_id')
                ->unique()
                ->values();

            /*
        |--------------------------------------------------------------------------
        | Classes autorisées
        |--------------------------------------------------------------------------
        */

            $classes = Classe::with([
                'etablissement',
                'anneeScolaire',
            ])
                ->where('etablissement_id', $user->etablissement_id)
                ->where('annee_scolaire_id', $anneeScolaireActive->id)
                ->whereIn('id', $classeIds)
                ->orderBy('libelle')
                ->get();

            /*
        |--------------------------------------------------------------------------
        | Matières autorisées
        |--------------------------------------------------------------------------
        */

            $matieres = Matiere::query()
                ->whereIn('id', $matiereIds)
                ->orderBy('libelle')
                ->get();

            /*
        |--------------------------------------------------------------------------
        | Enseignant connecté
        |--------------------------------------------------------------------------
        */

            $enseignants = Enseignant::query()
                ->where('id', $user->enseignant_id)
                ->where('etablissement_id', $user->etablissement_id)
                ->get();

            /*
        |--------------------------------------------------------------------------
        | Établissement du professeur
        |--------------------------------------------------------------------------
        */

            $etablissements = Etablissement::query()
                ->where('id', $user->etablissement_id)
                ->where('actif', true)
                ->get();

            /*
        |--------------------------------------------------------------------------
        | Retour du formulaire
        |--------------------------------------------------------------------------
        */

            return Inertia::render('Evaluations/Form', [
                'etablissements' => $etablissements,

                'annees' => collect([$anneeScolaireActive]),

                'anneeScolaireActive' => $anneeScolaireActive,

                'classes' => $classes,

                'matieres' => $matieres,

                'enseignants' => $enseignants,

                'affectations' => $affectations,
            ]);
        }

        /*
    |--------------------------------------------------------------------------
    | SUPERADMIN
    |--------------------------------------------------------------------------
    */

        if ($this->estSuperAdmin($user)) {

            return Inertia::render('Evaluations/Form', [

                'etablissements' =>
                Etablissement::query()
                    ->orderBy('nom')
                    ->get(),

                'annees' =>
                AnneeScolaire::query()
                    ->orderByDesc('date_debut')
                    ->get(),

                'anneeScolaireActive' =>
                $anneeScolaireActive,

                'classes' =>
                Classe::with([
                    'etablissement',
                    'anneeScolaire',
                ])
                    ->orderBy('libelle')
                    ->get(),

                'matieres' =>
                Matiere::query()
                    ->orderBy('libelle')
                    ->get(),

                'enseignants' =>
                Enseignant::query()
                    ->orderBy('nom')
                    ->orderBy('prenoms')
                    ->get(),

                'affectations' =>
                Affectation::query()
                    ->where('actif', true)
                    ->get([
                        'id',
                        'etablissement_id',
                        'annee_scolaire_id',
                        'classe_id',
                        'matiere_id',
                        'enseignant_id',
                    ]),
            ]);
        }

        /*
    |--------------------------------------------------------------------------
    | AUTRES UTILISATEURS
    |--------------------------------------------------------------------------
    */

        return Inertia::render('Evaluations/Form', [

            'etablissements' =>
            Etablissement::query()
                ->where('id', $user->etablissement_id)
                ->where('actif', true)
                ->orderBy('nom')
                ->get(),

            'annees' =>
            AnneeScolaire::query()
                ->orderByDesc('date_debut')
                ->get(),

            'anneeScolaireActive' =>
            $anneeScolaireActive,

            'classes' =>
            Classe::with([
                'etablissement',
                'anneeScolaire',
            ])
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->orderBy('libelle')
                ->get(),

            'matieres' =>
            Matiere::query()
                ->orderBy('libelle')
                ->get(),

            'enseignants' =>
            Enseignant::query()
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'affectations' =>
            Affectation::query()
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->where('actif', true)
                ->get([
                    'id',
                    'etablissement_id',
                    'annee_scolaire_id',
                    'classe_id',
                    'matiere_id',
                    'enseignant_id',
                ]),
        ]);
    }
    /**
     * Enregistrer une nouvelle évaluation.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        /*
    |--------------------------------------------------------------------------
    | ANNÉE SCOLAIRE ACTIVE
    |--------------------------------------------------------------------------
    */

        $anneeScolaireActive = AnneeScolaire::query()
            ->orderByDesc('date_debut')
            ->first();

        if (!$anneeScolaireActive) {
            abort(422, "Aucune année scolaire n'est définie.");
        }

        /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

        $validated = $request->validate([
            'etablissement_id' => [
                'required',
                'integer',
                'exists:etablissements,id',
            ],

            'annee_scolaire_id' => [
                'required',
                'integer',
                'exists:annee_scolaires,id',
            ],

            'classe_id' => [
                'required',
                'integer',
                'exists:classes,id',
            ],

            'matiere_id' => [
                'required',
                'integer',
                'exists:matieres,id',
            ],

            'enseignant_id' => [
                'required',
                'integer',
                'exists:enseignants,id',
            ],

            'libelle' => [
                'required',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
                'string',
                'in:Devoir,Interrogation,Composition,Examen',
            ],

            'numero' => [
                'required',
                'integer',
                'min:1',
            ],

            'date' => [
                'required',
                'date',
            ],

            'bareme' => [
                'required',
                'numeric',
                'min:1',
            ],

            'coefficient' => [
                'required',
                'numeric',
                'min:0.1',
            ],

            'periode' => [
                'required',
                'string',
                'in:Trimestre 1,Trimestre 2,Trimestre 3',
            ],

            'actif' => [
                'boolean',
            ],
        ]);

        /*
    |--------------------------------------------------------------------------
    | PROFESSEUR
    |--------------------------------------------------------------------------
    */

        if ($this->estProfesseur($user)) {

            $this->verifierCompteProfesseur($user);

            /*
        |--------------------------------------------------------------------------
        | Le professeur ne peut pas choisir une autre année.
        | Le serveur impose toujours l'année active.
        |--------------------------------------------------------------------------
        */

            $validated['annee_scolaire_id'] =
                $anneeScolaireActive->id;

            /*
        |--------------------------------------------------------------------------
        | Le professeur ne peut pas choisir un autre établissement.
        |--------------------------------------------------------------------------
        */

            if (
                (int) $validated['etablissement_id']
                !== (int) $user->etablissement_id
            ) {
                abort(403);
            }

            $validated['etablissement_id'] =
                $user->etablissement_id;

            /*
        |--------------------------------------------------------------------------
        | Le professeur ne peut pas choisir un autre enseignant.
        |--------------------------------------------------------------------------
        */

            if (
                (int) $validated['enseignant_id']
                !== (int) $user->enseignant_id
            ) {
                abort(403);
            }

            $validated['enseignant_id'] =
                $user->enseignant_id;

            /*
        |--------------------------------------------------------------------------
        | Vérification de l'affectation
        |--------------------------------------------------------------------------
        */

            $affectation = Affectation::query()
                ->where('etablissement_id', $user->etablissement_id)
                ->where(
                    'annee_scolaire_id',
                    $anneeScolaireActive->id
                )
                ->where('classe_id', $validated['classe_id'])
                ->where('matiere_id', $validated['matiere_id'])
                ->where('enseignant_id', $user->enseignant_id)
                ->where('actif', true)
                ->first();

            if (!$affectation) {

                return back()
                    ->withErrors([
                        'classe_id' =>
                        "Vous n'êtes pas affecté à cette classe et cette matière pour l'année scolaire active.",
                    ])
                    ->withInput();
            }
        }

        /*
    |--------------------------------------------------------------------------
    | VÉRIFICATION DE L'ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    */

        $etablissement = Etablissement::query()
            ->where('id', $validated['etablissement_id'])
            ->where('actif', true)
            ->first();

        if (!$etablissement) {
            return back()
                ->withErrors([
                    'etablissement_id' =>
                    "L'établissement sélectionné n'est pas valide.",
                ])
                ->withInput();
        }

        /*
    |--------------------------------------------------------------------------
    | VÉRIFICATION DE LA CLASSE
    |--------------------------------------------------------------------------
    */

        $classe = Classe::query()
            ->where('id', $validated['classe_id'])
            ->where(
                'etablissement_id',
                $validated['etablissement_id']
            )
            ->where(
                'annee_scolaire_id',
                $validated['annee_scolaire_id']
            )
            ->first();

        if (!$classe) {

            return back()
                ->withErrors([
                    'classe_id' =>
                    "La classe sélectionnée ne correspond pas à l'établissement ou à l'année scolaire.",
                ])
                ->withInput();
        }

        /*
    |--------------------------------------------------------------------------
    | VÉRIFICATION DE L'ENSEIGNANT
    |--------------------------------------------------------------------------
    */

        $enseignant = Enseignant::query()
            ->where('id', $validated['enseignant_id'])
            ->where(
                'etablissement_id',
                $validated['etablissement_id']
            )
            ->first();

        if (!$enseignant) {

            return back()
                ->withErrors([
                    'enseignant_id' =>
                    "L'enseignant sélectionné n'appartient pas à cet établissement.",
                ])
                ->withInput();
        }

        /*
    |--------------------------------------------------------------------------
    | VÉRIFICATION DE L'AFFECTATION
    |--------------------------------------------------------------------------
    */

        $affectation = Affectation::query()
            ->where(
                'etablissement_id',
                $validated['etablissement_id']
            )
            ->where(
                'annee_scolaire_id',
                $validated['annee_scolaire_id']
            )
            ->where(
                'classe_id',
                $validated['classe_id']
            )
            ->where(
                'matiere_id',
                $validated['matiere_id']
            )
            ->where(
                'enseignant_id',
                $validated['enseignant_id']
            )
            ->where('actif', true)
            ->first();

        if (!$affectation) {

            return back()
                ->withErrors([
                    'matiere_id' =>
                    "Aucune affectation pédagogique active ne correspond à la classe, à la matière et à l'enseignant sélectionnés.",
                ])
                ->withInput();
        }

        /*
    |--------------------------------------------------------------------------
    | CRÉATION DE L'ÉVALUATION
    |--------------------------------------------------------------------------
    */

        $evaluation = Evaluation::create([
            'etablissement_id' =>
            $validated['etablissement_id'],

            'annee_scolaire_id' =>
            $validated['annee_scolaire_id'],

            'classe_id' =>
            $validated['classe_id'],

            'matiere_id' =>
            $validated['matiere_id'],

            'enseignant_id' =>
            $validated['enseignant_id'],

            'libelle' =>
            $validated['libelle'],

            'type' =>
            $validated['type'],

            'numero' =>
            $validated['numero'],

            'date_evaluation' =>
            $validated['date'],

            'bareme' =>
            $validated['bareme'],

            'coefficient' =>
            $validated['coefficient'],

            'periode' =>
            $validated['periode'],

            'actif' =>
            $validated['actif'] ?? true,
        ]);

        /*
    |--------------------------------------------------------------------------
    | REDIRECTION APRÈS CRÉATION
    |--------------------------------------------------------------------------
    */

        return redirect()
            ->route('evaluations.index')
            ->with(
                'success',
                'L’évaluation a été créée avec succès.'
            );
    }

    /**
     * Afficher une évaluation.
     */
    public function show(Evaluation $evaluation)
    {
        $user = auth()->user();

        $this->verifierAccesEvaluation(
            $user,
            $evaluation
        );

        $evaluation->load([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
            'notes.eleve',
        ]);

        return Inertia::render(
            'Evaluations/Show',
            [
                'evaluation' => $evaluation,
                'notes' => $evaluation->notes,
            ]
        );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(Evaluation $evaluation)
    {
        $user = auth()->user();

        $this->verifierAccesEvaluation(
            $user,
            $evaluation
        );

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR
        |--------------------------------------------------------------------------
        */

        if ($this->estProfesseur($user)) {

            $affectations = Affectation::query()
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->where(
                    'enseignant_id',
                    $user->enseignant_id
                )
                ->where('actif', true)
                ->get([
                    'id',
                    'etablissement_id',
                    'annee_scolaire_id',
                    'classe_id',
                    'matiere_id',
                    'enseignant_id',
                ]);

            $classeIds = $affectations
                ->pluck('classe_id')
                ->unique();

            $matiereIds = $affectations
                ->pluck('matiere_id')
                ->unique();

            $anneeIds = $affectations
                ->pluck('annee_scolaire_id')
                ->unique();

            return Inertia::render(
                'Evaluations/Edit',
                [

                    'evaluation' =>
                    $evaluation->load([
                        'etablissement',
                        'anneeScolaire',
                        'classe',
                        'matiere',
                        'enseignant',
                    ]),

                    'etablissements' =>
                    Etablissement::where(
                        'id',
                        $user->etablissement_id
                    )->get(),

                    'annees' =>
                    AnneeScolaire::whereIn(
                        'id',
                        $anneeIds
                    )
                        ->orderByDesc('date_debut')
                        ->get(),

                    'classes' =>
                    Classe::with([
                        'etablissement',
                        'anneeScolaire',
                    ])
                        ->where(
                            'etablissement_id',
                            $user->etablissement_id
                        )
                        ->whereIn('id', $classeIds)
                        ->whereIn(
                            'annee_scolaire_id',
                            $anneeIds
                        )
                        ->orderBy('libelle')
                        ->get(),

                    'matieres' =>
                    Matiere::whereIn(
                        'id',
                        $matiereIds
                    )
                        ->orderBy('libelle')
                        ->get(),

                    'enseignants' =>
                    Enseignant::where(
                        'id',
                        $user->enseignant_id
                    )->get(),

                    'affectations' =>
                    $affectations,
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        if ($this->estSuperAdmin($user)) {

            return Inertia::render(
                'Evaluations/Edit',
                [

                    'evaluation' =>
                    $evaluation->load([
                        'etablissement',
                        'anneeScolaire',
                        'classe',
                        'matiere',
                        'enseignant',
                    ]),

                    'etablissements' =>
                    Etablissement::orderBy('nom')->get(),

                    'annees' =>
                    AnneeScolaire::orderByDesc(
                        'date_debut'
                    )->get(),

                    'classes' =>
                    Classe::with([
                        'etablissement',
                        'anneeScolaire',
                    ])
                        ->orderBy('libelle')
                        ->get(),

                    'matieres' =>
                    Matiere::orderBy('libelle')->get(),

                    'enseignants' =>
                    Enseignant::orderBy('nom')
                        ->orderBy('prenoms')
                        ->get(),

                    'affectations' =>
                    Affectation::where(
                        'actif',
                        true
                    )->get([
                        'id',
                        'etablissement_id',
                        'annee_scolaire_id',
                        'classe_id',
                        'matiere_id',
                        'enseignant_id',
                    ]),
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | AUTRES UTILISATEURS
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Evaluations/Edit',
            [

                'evaluation' =>
                $evaluation->load([
                    'etablissement',
                    'anneeScolaire',
                    'classe',
                    'matiere',
                    'enseignant',
                ]),

                'etablissements' =>
                Etablissement::where(
                    'id',
                    $user->etablissement_id
                )->get(),

                'annees' =>
                AnneeScolaire::orderByDesc(
                    'date_debut'
                )->get(),

                'classes' =>
                Classe::with([
                    'etablissement',
                    'anneeScolaire',
                ])
                    ->where(
                        'etablissement_id',
                        $user->etablissement_id
                    )
                    ->orderBy('libelle')
                    ->get(),

                'matieres' =>
                Matiere::orderBy('libelle')->get(),

                'enseignants' =>
                Enseignant::where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                    ->orderBy('nom')
                    ->orderBy('prenoms')
                    ->get(),
            ]
        );
    }

    /**
     * Mettre à jour une évaluation.
     */
    public function update(
        Request $request,
        Evaluation $evaluation
    ) {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Sécurité
        |--------------------------------------------------------------------------
        */

        $this->verifierAccesEvaluation(
            $user,
            $evaluation
        );

        $validated = $request->validate([

            'etablissement_id' => [
                'required',
                'exists:etablissements,id',
            ],

            'annee_scolaire_id' => [
                'required',
                'exists:annee_scolaires,id',
            ],

            'classe_id' => [
                'required',
                'exists:classes,id',
            ],

            'matiere_id' => [
                'required',
                'exists:matieres,id',
            ],

            'enseignant_id' => [
                'required',
                'exists:enseignants,id',
            ],

            'libelle' => [
                'required',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
                'in:Interrogation,Devoir,Composition,Examen,Autre',
            ],

            'numero' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'date_evaluation' => [
                'required',
                'date',
            ],

            'bareme' => [
                'required',
                'integer',
                'in:10,20,30,40,50,60,70,80,90,100',
            ],

            'coefficient' => [
                'required',
                'numeric',
                'in:0.5,1,1.5,2,2.5,3,3.5,4,4.5,5',
            ],

            'periode' => [
                'required',
                'in:Trimestre 1,Trimestre 2,Trimestre3',
            ],

            'active' => [
                'nullable',
                'boolean',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR
        |--------------------------------------------------------------------------
        */

        if ($this->estProfesseur($user)) {

            $this->verifierCompteProfesseur($user);

            /*
            | Impossible de changer d'établissement.
            */

            abort_unless(
                (int) $validated['etablissement_id'] ===
                    (int) $user->etablissement_id,
                403
            );

            /*
            | Impossible de changer d'enseignant.
            */

            abort_unless(
                (int) $validated['enseignant_id'] ===
                    (int) $user->enseignant_id,
                403
            );

            /*
            | La nouvelle classe/matière doit également
            | faire partie de ses affectations.
            */

            $affectation = Affectation::query()
                ->where(
                    'etablissement_id',
                    $validated['etablissement_id']
                )
                ->where(
                    'annee_scolaire_id',
                    $validated['annee_scolaire_id']
                )
                ->where(
                    'classe_id',
                    $validated['classe_id']
                )
                ->where(
                    'matiere_id',
                    $validated['matiere_id']
                )
                ->where(
                    'enseignant_id',
                    $user->enseignant_id
                )
                ->where('actif', true)
                ->exists();

            abort_unless(
                $affectation,
                403,
                'Vous n\'êtes pas affecté à cette classe et à cette matière.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Vérification classe
        |--------------------------------------------------------------------------
        */

        $classe = Classe::findOrFail(
            $validated['classe_id']
        );

        abort_unless(
            (int) $classe->etablissement_id ===
                (int) $validated['etablissement_id'],
            422
        );

        /*
        |--------------------------------------------------------------------------
        | Vérification année
        |--------------------------------------------------------------------------
        */

        abort_unless(
            !isset($classe->annee_scolaire_id) ||
                (int) $classe->annee_scolaire_id ===
                (int) $validated['annee_scolaire_id'],
            422
        );

        /*
        |--------------------------------------------------------------------------
        | Vérification affectation
        |--------------------------------------------------------------------------
        */

        $affectation = Affectation::query()
            ->where(
                'etablissement_id',
                $validated['etablissement_id']
            )
            ->where(
                'annee_scolaire_id',
                $validated['annee_scolaire_id']
            )
            ->where(
                'classe_id',
                $validated['classe_id']
            )
            ->where(
                'matiere_id',
                $validated['matiere_id']
            )
            ->where(
                'enseignant_id',
                $validated['enseignant_id']
            )
            ->where('actif', true)
            ->exists();

        abort_unless(
            $affectation,
            422,
            'Cet enseignant n\'est pas affecté à cette classe et cette matière.'
        );

        /*
        |--------------------------------------------------------------------------
        | Mise à jour
        |--------------------------------------------------------------------------
        */

        $evaluation->update([
            ...$validated,
            'active' => $validated['active'] ?? true,
        ]);

        return redirect()
            ->route('evaluations.index')
            ->with(
                'success',
                'Évaluation modifiée avec succès.'
            );
    }

    /**
     * Afficher les statistiques d'une évaluation.
     */
    public function statistiques(Evaluation $evaluation)
    {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | SÉCURITÉ
        |--------------------------------------------------------------------------
        |
        | Un professeur ne peut même pas consulter directement
        | les statistiques d'une évaluation qui ne lui appartient pas.
        |
        */

        $this->verifierAccesEvaluation(
            $user,
            $evaluation
        );

        $evaluation->load([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
            'notes.eleve',
        ]);

        $notes = $evaluation->notes;

        /*
        |--------------------------------------------------------------------------
        | Notes valides
        |--------------------------------------------------------------------------
        */

        $notesSaisies = $notes
            ->filter(function ($note) {
                return !$note->absent &&
                    $note->note !== null;
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Absents
        |--------------------------------------------------------------------------
        */

        $absents = $notes
            ->filter(function ($note) {
                return $note->absent;
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Notes non saisies
        |--------------------------------------------------------------------------
        */

        $nonNotes = $notes
            ->filter(function ($note) {
                return !$note->absent &&
                    $note->note === null;
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Valeurs numériques
        |--------------------------------------------------------------------------
        */

        $valeurs = $notesSaisies
            ->map(function ($note) {
                return (float) $note->note;
            })
            ->sort()
            ->values();

        $nombreNotes = $valeurs->count();

        /*
        |--------------------------------------------------------------------------
        | Moyenne
        |--------------------------------------------------------------------------
        */

        $moyenne = $nombreNotes > 0
            ? $valeurs->avg()
            : null;

        /*
        |--------------------------------------------------------------------------
        | Médiane
        |--------------------------------------------------------------------------
        */

        $mediane = null;

        if ($nombreNotes > 0) {

            $milieu = intdiv(
                $nombreNotes,
                2
            );

            if ($nombreNotes % 2 === 0) {

                $mediane = (
                    $valeurs[$milieu - 1] +
                    $valeurs[$milieu]
                ) / 2;
            } else {

                $mediane =
                    $valeurs[$milieu];
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Meilleure / plus faible
        |--------------------------------------------------------------------------
        */

        $meilleureNote = $nombreNotes > 0
            ? $valeurs->max()
            : null;

        $plusFaibleNote = $nombreNotes > 0
            ? $valeurs->min()
            : null;

        /*
        |--------------------------------------------------------------------------
        | Écart-type
        |--------------------------------------------------------------------------
        */

        $ecartType = null;

        if (
            $nombreNotes > 0 &&
            $moyenne !== null
        ) {

            $sommeCarres =
                $valeurs->reduce(
                    function (
                        $total,
                        $valeur
                    ) use ($moyenne) {

                        return $total +
                            pow(
                                $valeur - $moyenne,
                                2
                            );
                    },
                    0
                );

            $variance =
                $sommeCarres /
                $nombreNotes;

            $ecartType =
                sqrt($variance);
        }

        /*
        |--------------------------------------------------------------------------
        | Normalisation sur 20
        |--------------------------------------------------------------------------
        */

        $bareme =
            (float) $evaluation->bareme;

        $normaliserSur20 =
            function ($note) use ($bareme) {

                if ($bareme <= 0) {
                    return 0;
                }

                return (
                    (float) $note /
                    $bareme
                ) * 20;
            };

        /*
        |--------------------------------------------------------------------------
        | Réussites
        |--------------------------------------------------------------------------
        */

        $reussites = $notesSaisies
            ->filter(function ($note)
            use ($normaliserSur20) {

                return $normaliserSur20(
                    $note->note
                ) >= 10;
            })
            ->count();

        $tauxReussite =
            $nombreNotes > 0
            ? (
                $reussites /
                $nombreNotes
            ) * 100
            : 0;

        /*
        |--------------------------------------------------------------------------
        | Taux d'absence
        |--------------------------------------------------------------------------
        */

        $totalEleves =
            $notes->count();

        $tauxAbsence =
            $totalEleves > 0
            ? (
                $absents->count() /
                $totalEleves
            ) * 100
            : 0;

        /*
        |--------------------------------------------------------------------------
        | Répartition des appréciations
        |--------------------------------------------------------------------------
        */

        $categories = [
            'Excellent' => 0,
            'Très bien' => 0,
            'Bien' => 0,
            'Assez bien' => 0,
            'Moyen' => 0,
            'Passable' => 0,
            'Insuffisant' => 0,
            'Très insuffisant' => 0,
            'Faible' => 0,
        ];

        foreach ($notesSaisies as $note) {

            $noteSur20 =
                $normaliserSur20(
                    $note->note
                );

            if ($noteSur20 >= 18) {
                $categories['Excellent']++;
            } elseif ($noteSur20 >= 16) {
                $categories['Très bien']++;
            } elseif ($noteSur20 >= 14) {
                $categories['Bien']++;
            } elseif ($noteSur20 >= 12) {
                $categories['Assez bien']++;
            } elseif ($noteSur20 >= 11) {
                $categories['Moyen']++;
            } elseif ($noteSur20 >= 10) {
                $categories['Passable']++;
            } elseif ($noteSur20 >= 8) {
                $categories['Insuffisant']++;
            } elseif ($noteSur20 >= 5) {
                $categories['Très insuffisant']++;
            } else {
                $categories['Faible']++;
            }
        }

        $repartition =
            collect($categories)
            ->map(
                function (
                    $nombre,
                    $appreciation
                ) use ($nombreNotes) {

                    return [
                        'appreciation' =>
                        $appreciation,

                        'nombre' =>
                        $nombre,

                        'pourcentage' =>
                        $nombreNotes > 0
                            ? (
                                $nombre /
                                $nombreNotes
                            ) * 100
                            : 0,
                    ];
                }
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Résultats
        |--------------------------------------------------------------------------
        */

        $resultats =
            $notes
            ->map(
                function ($note)
                use ($normaliserSur20) {

                    return [
                        'id' =>
                        $note->id,

                        'eleve_id' =>
                        $note->eleve_id,

                        'eleve' =>
                        $note->eleve,

                        'note' =>
                        $note->note !== null
                            ? (float) $note->note
                            : null,

                        'note_sur_20' =>
                        $note->note !== null
                            ? round(
                                $normaliserSur20(
                                    $note->note
                                ),
                                2
                            )
                            : null,

                        'absent' =>
                        (bool) $note->absent,

                        'appreciation' =>
                        $note->appreciation,

                        'observation' =>
                        $note->observation,
                    ];
                }
            )
            ->values();

        return Inertia::render(
            'Evaluations/Statistiques',
            [

                'evaluation' =>
                $evaluation,

                'statistiques' => [

                    'total_eleves' =>
                    $totalEleves,

                    'notes_saisies' =>
                    $nombreNotes,

                    'absents' =>
                    $absents->count(),

                    'non_notes' =>
                    $nonNotes->count(),

                    'moyenne' =>
                    $moyenne !== null
                        ? round($moyenne, 2)
                        : null,

                    'mediane' =>
                    $mediane !== null
                        ? round($mediane, 2)
                        : null,

                    'meilleure_note' =>
                    $meilleureNote !== null
                        ? round(
                            $meilleureNote,
                            2
                        )
                        : null,

                    'plus_faible_note' =>
                    $plusFaibleNote !== null
                        ? round(
                            $plusFaibleNote,
                            2
                        )
                        : null,

                    'ecart_type' =>
                    $ecartType !== null
                        ? round(
                            $ecartType,
                            2
                        )
                        : null,

                    'reussites' =>
                    $reussites,

                    'echecs' =>
                    $nombreNotes -
                        $reussites,

                    'taux_reussite' =>
                    round(
                        $tauxReussite,
                        2
                    ),

                    'taux_absence' =>
                    round(
                        $tauxAbsence,
                        2
                    ),
                ],

                'repartition' =>
                $repartition,

                'resultats' =>
                $resultats,
            ]
        );
    }

    /**
     * Supprimer une évaluation.
     */
    public function destroy(
        Evaluation $evaluation
    ) {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Sécurité
        |--------------------------------------------------------------------------
        */

        $this->verifierAccesEvaluation(
            $user,
            $evaluation
        );

        $evaluation->delete();

        return redirect()
            ->route('evaluations.index')
            ->with(
                'success',
                'Évaluation supprimée avec succès.'
            );
    }
}
