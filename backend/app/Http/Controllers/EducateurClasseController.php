<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEducateurClasseRequest;
use App\Http\Requests\UpdateEducateurClasseRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Educateur;
use App\Models\EducateurClasse;
use App\Models\Etablissement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EducateurClasseController extends Controller
{
    /**
     * Liste des affectations.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $filters = [
            'etablissement_id' => $request->input('etablissement_id') ?? '',
            'annee_scolaire_id' => $request->input('annee_scolaire_id') ?? '',
            'educateur_id' => $request->input('educateur_id') ?? '',
            'classe_id' => $request->input('classe_id') ?? '',
        ];

        $isSuperAdmin = $user->hasRole('SuperAdmin');

        $query = EducateurClasse::with([
            'etablissement:id,nom',
            'anneeScolaire:id,libelle,active',
            'educateur:id,nom,prenoms',
            'classe:id,libelle,etablissement_id,annee_scolaire_id',
        ]);

        /*
         * Sécurité établissement.
         */
        if (! $isSuperAdmin) {
            $query->where(
                'etablissement_id',
                $user->etablissement_id
            );
        } elseif ($filters['etablissement_id'] !== '') {
            $query->where(
                'etablissement_id',
                $filters['etablissement_id']
            );
        }

        /*
         * Filtres.
         */
        if ($filters['annee_scolaire_id'] !== '') {
            $query->where(
                'annee_scolaire_id',
                $filters['annee_scolaire_id']
            );
        }

        if ($filters['educateur_id'] !== '') {
            $query->where(
                'educateur_id',
                $filters['educateur_id']
            );
        }

        if ($filters['classe_id'] !== '') {
            $query->where(
                'classe_id',
                $filters['classe_id']
            );
        }

        $affectations = $query
            ->orderByDesc('id')
            ->get();

        /*
         * Établissements accessibles.
         */
        if ($isSuperAdmin) {
            $etablissements = Etablissement::query()
                ->orderBy('nom')
                ->get(['id', 'nom']);
        } else {
            $etablissements = Etablissement::query()
                ->where('id', $user->etablissement_id)
                ->get(['id', 'nom']);
        }

        /*
         * Années scolaires.
         */
        $anneesScolaires = AnneeScolaire::query()
            ->orderByDesc('id')
            ->get();

        /*
         * Éducateurs accessibles.
         */
        $educateursQuery = Educateur::query()
            ->where('actif', true)
            ->orderBy('nom')
            ->orderBy('prenoms');

        if (! $isSuperAdmin) {
            $educateursQuery->where(
                'etablissement_id',
                $user->etablissement_id
            );
        } elseif ($filters['etablissement_id'] !== '') {
            $educateursQuery->where(
                'etablissement_id',
                $filters['etablissement_id']
            );
        }

        $educateurs = $educateursQuery->get([
            'id',
            'nom',
            'prenoms',
            'etablissement_id',
        ]);

        /*
         * Classes accessibles.
         */
        $classesQuery = Classe::query()
            ->orderBy('libelle');

        if (! $isSuperAdmin) {
            $classesQuery->where(
                'etablissement_id',
                $user->etablissement_id
            );
        } elseif ($filters['etablissement_id'] !== '') {
            $classesQuery->where(
                'etablissement_id',
                $filters['etablissement_id']
            );
        }

        if ($filters['annee_scolaire_id'] !== '') {
            $classesQuery->where(
                'annee_scolaire_id',
                $filters['annee_scolaire_id']
            );
        }

        $classes = $classesQuery->get([
            'id',
            'libelle',
            'etablissement_id',
            'annee_scolaire_id',
            'active',
        ]);

        return Inertia::render('EducateurClasses/Index', [
            'affectations' => $affectations,
            'etablissements' => $etablissements,
            'anneesScolaires' => $anneesScolaires,
            'educateurs' => $educateurs,
            'classes' => $classes,
            'filters' => $filters,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create(): Response
    {
        $user = auth()->user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');

        /*
     * Établissements.
     */
        if ($isSuperAdmin) {

            $etablissements = Etablissement::query()
                ->orderBy('nom')
                ->get([
                    'id',
                    'nom',
                ]);

            $educateurs = Educateur::query()
                ->where('actif', true)
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'nom',
                    'prenoms',
                    'etablissement_id',
                ]);

            $classes = Classe::query()
                ->where('active', true)
                ->orderBy('libelle')
                ->get([
                    'id',
                    'libelle',
                    'etablissement_id',
                    'annee_scolaire_id',
                ]);

            $affectationsExistantes = EducateurClasse::query()
                ->with('educateur:id,nom,prenoms')
                ->get([
                    'id',
                    'etablissement_id',
                    'annee_scolaire_id',
                    'educateur_id',
                    'classe_id',
                    'actif',
                ]);
        } else {

            $etablissements = Etablissement::query()
                ->where(
                    'id',
                    $user->etablissement_id
                )
                ->get([
                    'id',
                    'nom',
                ]);

            $educateurs = Educateur::query()
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->where('actif', true)
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'nom',
                    'prenoms',
                    'etablissement_id',
                ]);

            $classes = Classe::query()
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->where('active', true)
                ->orderBy('libelle')
                ->get([
                    'id',
                    'libelle',
                    'etablissement_id',
                    'annee_scolaire_id',
                ]);

            $affectationsExistantes = EducateurClasse::query()
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->with('educateur:id,nom,prenoms')
                ->get([
                    'id',
                    'etablissement_id',
                    'annee_scolaire_id',
                    'educateur_id',
                    'classe_id',
                    'actif',
                ]);
        }

        return Inertia::render(
            'EducateurClasses/Create',
            [
                'etablissements' => $etablissements,

                'anneesScolaires' => AnneeScolaire::query()
                    ->orderByDesc('id')
                    ->get(),

                'educateurs' => $educateurs,

                'classes' => $classes,

                'affectationsExistantes' => $affectationsExistantes,

                'isSuperAdmin' => $isSuperAdmin,

                'etablissementId' => $user->etablissement_id,
            ]
        );
    }

    /**
     * Enregistrement.
     */
    public function store(
        StoreEducateurClasseRequest $request
    ): RedirectResponse {
        $data = $request->validated();

        $user = auth()->user();

        /*
     * Les utilisateurs autres que SuperAdmin
     * restent obligatoirement dans leur établissement.
     */
        if (! $user->hasRole('SuperAdmin')) {
            $data['etablissement_id'] = $user->etablissement_id;
        }

        /*
     * Vérification de l'éducateur.
     */
        $educateur = Educateur::findOrFail(
            $data['educateur_id']
        );

        abort_unless(
            (int) $educateur->etablissement_id ===
                (int) $data['etablissement_id'],
            422,
            'L’éducateur sélectionné n’appartient pas à cet établissement.'
        );

        /*
     * Vérification de la classe.
     */
        $classe = Classe::findOrFail(
            $data['classe_id']
        );

        abort_unless(
            (int) $classe->etablissement_id ===
                (int) $data['etablissement_id'],
            422,
            'La classe sélectionnée n’appartient pas à cet établissement.'
        );

        /*
     * Vérification année scolaire / classe.
     */
        abort_unless(
            (int) $classe->annee_scolaire_id ===
                (int) $data['annee_scolaire_id'],
            422,
            'La classe ne correspond pas à l’année scolaire sélectionnée.'
        );

        /*
     * UNE CLASSE = UN ÉDUCATEUR
     *
     * Si une affectation existe déjà pour cette classe
     * et cette année scolaire, elle est automatiquement
     * remplacée par le nouvel éducateur.
     */
        EducateurClasse::updateOrCreate(
            [
                'etablissement_id' => $data['etablissement_id'],
                'annee_scolaire_id' => $data['annee_scolaire_id'],
                'classe_id' => $data['classe_id'],
            ],
            [
                'educateur_id' => $data['educateur_id'],
                'actif' => $data['actif'] ?? true,
            ]
        );

        return redirect()
            ->route('educateur-classes.index')
            ->with(
                'success',
                'L’affectation de la classe a été enregistrée avec succès.'
            );
    }

    /**
     * Enregistre les affectations affichées dans le tableau de création.
     */
    public function storeBulk(Request $request): RedirectResponse
    {
        $data = $request->validate([
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

            'affectations' => [
                'required',
                'array',
                'min:1',
            ],

            'affectations.*.classe_id' => [
                'required',
                'integer',
                'distinct',
                'exists:classes,id',
            ],

            'affectations.*.educateur_id' => [
                'required',
                'integer',
                'exists:educateurs,id',
            ],

            'actif' => [
                'nullable',
                'boolean',
            ],
        ]);

        $user = auth()->user();

        /*
     * Sécurité établissement.
     */
        if (! $user->hasRole('SuperAdmin')) {
            $data['etablissement_id'] = $user->etablissement_id;
        }

        /*
     * IDs transmis.
     */
        $classeIds = collect($data['affectations'])
            ->pluck('classe_id')
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values();

        $educateurIds = collect($data['affectations'])
            ->pluck('educateur_id')
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values();

        /*
     * Vérification des classes.
     */
        $classes = Classe::query()
            ->whereIn('id', $classeIds)
            ->where(
                'etablissement_id',
                $data['etablissement_id']
            )
            ->where(
                'annee_scolaire_id',
                $data['annee_scolaire_id']
            )
            ->where('active', true)
            ->get()
            ->keyBy('id');

        /*
     * Vérification des éducateurs.
     */
        $educateurs = Educateur::query()
            ->whereIn('id', $educateurIds)
            ->where(
                'etablissement_id',
                $data['etablissement_id']
            )
            ->where('actif', true)
            ->get()
            ->keyBy('id');

        abort_unless(
            $classes->count() === $classeIds->count(),
            422,
            'Une ou plusieurs classes ne correspondent pas à l’établissement ou à l’année scolaire sélectionnée.'
        );

        abort_unless(
            $educateurs->count() === $educateurIds->count(),
            422,
            'Un ou plusieurs éducateurs ne correspondent pas à l’établissement sélectionné.'
        );

        /*
     * Enregistrement groupé.
     *
     * CRITÈRE D'IDENTIFICATION :
     * établissement + année + classe
     *
     * L'éducateur est une donnée à mettre à jour.
     *
     * Donc une nouvelle affectation remplace
     * automatiquement l'ancienne.
     */
        foreach ($data['affectations'] as $affectation) {

            EducateurClasse::updateOrCreate(
                [
                    'etablissement_id' => $data['etablissement_id'],
                    'annee_scolaire_id' => $data['annee_scolaire_id'],
                    'classe_id' => $affectation['classe_id'],
                ],
                [
                    'educateur_id' => $affectation['educateur_id'],
                    'actif' => $data['actif'] ?? true,
                ]
            );
        }

        return redirect()
            ->route('educateur-classes.index')
            ->with(
                'success',
                'Les affectations des éducateurs ont été enregistrées avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(
        EducateurClasse $educateurClasse
    ): Response {
        $this->verifierAcces($educateurClasse);

        $user = auth()->user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');

        if ($isSuperAdmin) {
            $etablissements = Etablissement::orderBy('nom')->get([
                'id',
                'nom',
            ]);

            $educateurs = Educateur::where('actif', true)
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'nom',
                    'prenoms',
                    'etablissement_id',
                ]);

            $classes = Classe::where('active', true)
                ->orderBy('libelle')
                ->get([
                    'id',
                    'libelle',
                    'etablissement_id',
                    'annee_scolaire_id',
                ]);
        } else {
            $etablissements = Etablissement::where(
                'id',
                $user->etablissement_id
            )->get([
                'id',
                'nom',
            ]);

            $educateurs = Educateur::where(
                'etablissement_id',
                $user->etablissement_id
            )
                ->where('actif', true)
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'nom',
                    'prenoms',
                    'etablissement_id',
                ]);

            $classes = Classe::where(
                'etablissement_id',
                $user->etablissement_id
            )
                ->where('active', true)
                ->orderBy('libelle')
                ->get([
                    'id',
                    'libelle',
                    'etablissement_id',
                    'annee_scolaire_id',
                ]);
        }

        return Inertia::render('EducateurClasses/Edit', [
            'affectation' => [
                'id' => $educateurClasse->id,
                'etablissement_id' => $educateurClasse->etablissement_id,
                'annee_scolaire_id' => $educateurClasse->annee_scolaire_id,
                'educateur_id' => $educateurClasse->educateur_id,
                'classe_id' => $educateurClasse->classe_id,
                'actif' => $educateurClasse->actif,
            ],
            'etablissements' => $etablissements,
            'anneesScolaires' => AnneeScolaire::orderByDesc('id')->get(),
            'educateurs' => $educateurs,
            'classes' => $classes,
            'isSuperAdmin' => $isSuperAdmin,
            'etablissementId' => $user->etablissement_id,
        ]);
    }

    /**
     * Modification.
     */
    public function update(
        UpdateEducateurClasseRequest $request,
        EducateurClasse $educateurClasse
    ): RedirectResponse {
        $this->verifierAcces($educateurClasse);

        $data = $request->validated();

        $user = auth()->user();

        if (! $user->hasRole('SuperAdmin')) {
            $data['etablissement_id'] =
                $user->etablissement_id;
        }

        /*
     * Vérification éducateur.
     */
        $educateur = Educateur::findOrFail(
            $data['educateur_id']
        );

        abort_unless(
            (int) $educateur->etablissement_id ===
                (int) $data['etablissement_id'],
            422,
            'L’éducateur sélectionné n’appartient pas à cet établissement.'
        );

        /*
     * Vérification classe.
     */
        $classe = Classe::findOrFail(
            $data['classe_id']
        );

        abort_unless(
            (int) $classe->etablissement_id ===
                (int) $data['etablissement_id'],
            422,
            'La classe sélectionnée n’appartient pas à cet établissement.'
        );

        abort_unless(
            (int) $classe->annee_scolaire_id ===
                (int) $data['annee_scolaire_id'],
            422,
            'La classe ne correspond pas à l’année scolaire sélectionnée.'
        );

        /*
     * Si une autre affectation existe déjà pour cette classe,
     * elle est remplacée.
     */
        $autreAffectation = EducateurClasse::query()
            ->where(
                'etablissement_id',
                $data['etablissement_id']
            )
            ->where(
                'annee_scolaire_id',
                $data['annee_scolaire_id']
            )
            ->where(
                'classe_id',
                $data['classe_id']
            )
            ->where(
                'id',
                '!=',
                $educateurClasse->id
            )
            ->first();

        if ($autreAffectation) {
            $autreAffectation->update([
                'educateur_id' => $data['educateur_id'],
                'actif' => $data['actif'] ?? true,
            ]);

            $educateurClasse->delete();
        } else {
            $educateurClasse->update([
                'etablissement_id' => $data['etablissement_id'],
                'annee_scolaire_id' => $data['annee_scolaire_id'],
                'educateur_id' => $data['educateur_id'],
                'classe_id' => $data['classe_id'],
                'actif' => $data['actif'] ?? true,
            ]);
        }

        return redirect()
            ->route('educateur-classes.index')
            ->with(
                'success',
                'L’affectation a été modifiée avec succès.'
            );
    }

    /**
     * Suppression.
     */
    public function destroy(
        EducateurClasse $educateurClasse
    ): RedirectResponse {
        $this->verifierAcces($educateurClasse);

        $educateurClasse->delete();

        return redirect()
            ->route('educateur-classes.index')
            ->with(
                'success',
                'L’affectation a été supprimée avec succès.'
            );
    }

    /**
     * Activation / désactivation.
     */
    public function toggle(
        EducateurClasse $educateurClasse
    ): RedirectResponse {
        $this->verifierAcces($educateurClasse);

        $educateurClasse->update([
            'actif' => ! $educateurClasse->actif,
        ]);

        return back()->with(
            'success',
            $educateurClasse->actif
                ? 'Affectation activée.'
                : 'Affectation désactivée.'
        );
    }

    /**
     * Vérification d'accès.
     */
    private function verifierAcces(
        EducateurClasse $educateurClasse
    ): void {
        $user = auth()->user();

        if ($user->hasRole('SuperAdmin')) {
            return;
        }

        abort_unless(
            (int) $educateurClasse->etablissement_id ===
                (int) $user->etablissement_id,
            403
        );
    }
}
