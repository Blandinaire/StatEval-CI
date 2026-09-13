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

        return Inertia::render('EducateurClasses/Create', [
            'etablissements' => $etablissements,
            'anneesScolaires' => AnneeScolaire::orderByDesc('id')->get(),
            'educateurs' => $educateurs,
            'classes' => $classes,
            'isSuperAdmin' => $isSuperAdmin,
            'etablissementId' => $user->etablissement_id,
        ]);
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
         * Vérification doublon.
         */
        $exists = EducateurClasse::query()
            ->where('annee_scolaire_id', $data['annee_scolaire_id'])
            ->where('educateur_id', $data['educateur_id'])
            ->where('classe_id', $data['classe_id'])
            ->exists();

        if ($exists) {
            return back()
                ->withErrors([
                    'classe_id' =>
                        'Cette classe est déjà affectée à cet éducateur pour cette année scolaire.',
                ])
                ->withInput();
        }

        $data['actif'] = $data['actif'] ?? true;

        EducateurClasse::create($data);

        return redirect()
            ->route('educateur-classes.index')
            ->with(
                'success',
                'La classe a été affectée à l’éducateur avec succès.'
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
            'affectation' => $educateurClasse->load([
                'etablissement',
                'anneeScolaire',
                'educateur',
                'classe',
            ]),
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
            $data['etablissement_id'] = $user->etablissement_id;
        }

        $educateur = Educateur::findOrFail(
            $data['educateur_id']
        );

        abort_unless(
            (int) $educateur->etablissement_id ===
            (int) $data['etablissement_id'],
            422,
            'L’éducateur sélectionné n’appartient pas à cet établissement.'
        );

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

        $exists = EducateurClasse::query()
            ->where('annee_scolaire_id', $data['annee_scolaire_id'])
            ->where('educateur_id', $data['educateur_id'])
            ->where('classe_id', $data['classe_id'])
            ->where('id', '!=', $educateurClasse->id)
            ->exists();

        if ($exists) {
            return back()
                ->withErrors([
                    'classe_id' =>
                        'Cette affectation existe déjà.',
                ])
                ->withInput();
        }

        $educateurClasse->update($data);

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