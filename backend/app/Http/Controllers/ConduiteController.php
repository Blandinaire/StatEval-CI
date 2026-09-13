<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConduiteRequest;
use App\Http\Requests\UpdateConduiteRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Conduite;
use App\Models\Educateur;
use App\Models\Eleve;
use App\Models\Etablissement;
use App\Models\EducateurClasse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConduiteController extends Controller
{


    /**
     * Vérifie l'accès à une classe.
     */
    /**
     * Vérifie qu'un utilisateur peut accéder à une classe.
     */
    /**
     * Vérifie qu'un utilisateur peut accéder à une classe.
     */
    private function checkClasseAccess(Classe $classe): void
    {
        $user = auth()->user();

        /*
    |--------------------------------------------------------------------------
    | SuperAdmin : accès total
    |--------------------------------------------------------------------------
    */
        if ($user->hasRole('SuperAdmin')) {
            return;
        }

        /*
    |--------------------------------------------------------------------------
    | Vérification de l'établissement
    |--------------------------------------------------------------------------
    */
        if (
            (int) $classe->etablissement_id !==
            (int) $user->etablissement_id
        ) {
            abort(403, 'Vous n’êtes pas autorisé à accéder à cette classe.');
        }

        /*
    |--------------------------------------------------------------------------
    | Éducateur : uniquement les classes qui lui sont affectées
    |--------------------------------------------------------------------------
    */
        if ($user->hasRole('Educateur')) {

            $affectation = \App\Models\EducateurClasse::query()
                ->where('educateur_id', $user->educateur_id)
                ->where('classe_id', $classe->id)
                ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                ->where('etablissement_id', $classe->etablissement_id)
                ->where('actif', true)
                ->exists();

            if (! $affectation) {
                abort(
                    403,
                    'Cette classe ne vous est pas affectée.'
                );
            }
        }
    }

    /**
     * Liste des notes de conduite.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');

        /*
    |--------------------------------------------------------------------------
    | REQUÊTE DES NOTES DE CONDUITE
    |--------------------------------------------------------------------------
    */

        $query = Conduite::with([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
        ]);

        /*
    |--------------------------------------------------------------------------
    | RESTRICTION DES DONNÉES SELON LE PROFIL
    |--------------------------------------------------------------------------
    */

        if ($user->hasRole('Educateur')) {

            /*
    |--------------------------------------------------------------------------
    | ÉDUCATEUR
    |--------------------------------------------------------------------------
    | Il ne voit que les notes :
    | - enregistrées sous son compte ;
    | - concernant une classe qui lui est affectée ;
    | - pour l'année scolaire correspondante.
    |--------------------------------------------------------------------------
    */

            $query
                ->where('educateur_id', $user->educateur_id)
                ->whereHas('classe.affectationsEducateurs', function ($q) use ($user) {
                    $q->where(
                        'educateur_id',
                        $user->educateur_id
                    )
                        ->where(
                            'actif',
                            true
                        )
                        ->whereColumn(
                            'educateur_classes.annee_scolaire_id',
                            'conduites.annee_scolaire_id'
                        );
                });
        } elseif (! $isSuperAdmin) {

            // Les autres utilisateurs voient uniquement
            // les notes de leur établissement
            $query->whereHas('classe', function ($q) use ($user) {
                $q->where(
                    'etablissement_id',
                    $user->etablissement_id
                );
            });
        }

        /*
    |--------------------------------------------------------------------------
    | FILTRE ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    */

        if (
            $isSuperAdmin &&
            $request->filled('etablissement_id')
        ) {
            $query->whereHas('classe', function ($q) use ($request) {
                $q->where(
                    'etablissement_id',
                    $request->etablissement_id
                );
            });
        }

        /*
    |--------------------------------------------------------------------------
    | FILTRE CLASSE
    |--------------------------------------------------------------------------
    */

        if ($request->filled('classe_id')) {
            $query->where(
                'classe_id',
                $request->classe_id
            );
        }

        /*
    |--------------------------------------------------------------------------
    | FILTRE PÉRIODE
    |--------------------------------------------------------------------------
    */

        if ($request->filled('periode')) {
            $query->where(
                'periode',
                $request->periode
            );
        }

        /*
    |--------------------------------------------------------------------------
    | RECHERCHE ÉLÈVE
    |--------------------------------------------------------------------------
    */

        if ($request->filled('recherche')) {

            $recherche = trim($request->recherche);

            $query->whereHas('eleve', function ($q) use ($recherche) {

                $q->where('nom', 'like', "%{$recherche}%")
                    ->orWhere('prenoms', 'like', "%{$recherche}%")
                    ->orWhere('matricule', 'like', "%{$recherche}%");
            });
        }

        /*
    |--------------------------------------------------------------------------
    | RÉSULTATS
    |--------------------------------------------------------------------------
    */

        $conduites = $query
            ->orderByDesc('id')
            ->get();

        /*
    |--------------------------------------------------------------------------
    | ÉTABLISSEMENTS DISPONIBLES
    |--------------------------------------------------------------------------
    */

        if ($isSuperAdmin) {

            $etablissements = \App\Models\Etablissement::query()
                ->where('actif', true)
                ->orderBy('nom')
                ->get([
                    'id',
                    'nom',
                ]);
        } else {

            $etablissements = \App\Models\Etablissement::query()
                ->where('id', $user->etablissement_id)
                ->where('actif', true)
                ->get([
                    'id',
                    'nom',
                ]);
        }

        /*
    |--------------------------------------------------------------------------
    | CLASSES DISPONIBLES
    |--------------------------------------------------------------------------
    */

        $classesQuery = Classe::query()
            ->orderBy('libelle');

        /*
|--------------------------------------------------------------------------
| SuperAdmin
|--------------------------------------------------------------------------
*/

        if ($isSuperAdmin) {

            if ($request->filled('etablissement_id')) {

                $classesQuery->where(
                    'etablissement_id',
                    $request->etablissement_id
                );
            }

            /*
|--------------------------------------------------------------------------
| Éducateur
|--------------------------------------------------------------------------
*/
        } elseif ($user->hasRole('Educateur')) {

            $classesQuery
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                )
                ->whereHas(
                    'affectationsEducateurs',
                    function ($q) use ($user) {

                        $q->where(
                            'educateur_id',
                            $user->educateur_id
                        )
                            ->where(
                                'etablissement_id',
                                $user->etablissement_id
                            )
                            ->where(
                                'actif',
                                true
                            );
                    }
                );

            /*
|--------------------------------------------------------------------------
| Autres profils
|--------------------------------------------------------------------------
*/
        } else {

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
        ]);

        $classes = $classesQuery->get([
            'id',
            'libelle',
            'etablissement_id',
        ]);

        /*
    |--------------------------------------------------------------------------
    | RETOUR INERTIA
    |--------------------------------------------------------------------------
    */

        return Inertia::render('Conduites/Index', [

            'conduites' => $conduites,

            'etablissements' => $etablissements,

            'classes' => $classes,

            'filters' => [
                'etablissement_id' => $request->etablissement_id ?? '',
                'classe_id' => $request->classe_id ?? '',
                'periode' => $request->periode ?? '',
                'recherche' => $request->recherche ?? '',
            ],

            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    /**
     * Formulaire de création groupée.
     */
    public function create(): Response
    {
        $user = auth()->user();

        $isSuperAdmin =
            $user->hasRole('SuperAdmin');

        $etablissementId =
            $user->etablissement_id;

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENTS
        |--------------------------------------------------------------------------
        */

        $etablissements = $isSuperAdmin
            ? Etablissement::query()
            ->orderBy('nom')
            ->get()
            : Etablissement::query()
            ->where(
                'id',
                $etablissementId
            )
            ->orderBy('nom')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | ANNÉES SCOLAIRES
        |--------------------------------------------------------------------------
        */

        $anneesScolaires =
            AnneeScolaire::query()
            ->orderByDesc('date_debut')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | ÉDUCATEURS
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('Educateur')) {

            $educateurs = Educateur::query()
                ->where('id', $user->educateur_id)
                ->where('actif', true)
                ->get([
                    'id',
                    'nom',
                    'prenoms',
                    'etablissement_id',
                ]);
        } else {

            $educateursQuery = Educateur::query();

            if (! $isSuperAdmin) {
                $educateursQuery->where(
                    'etablissement_id',
                    $etablissementId
                );
            }

            $educateurs = $educateursQuery
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'nom',
                    'prenoms',
                    'etablissement_id',
                ]);
        }

        return Inertia::render('Conduites/Create', [

            'etablissements' =>
            $etablissements,

            'anneesScolaires' =>
            $anneesScolaires,

            'educateurs' =>
            $educateurs,

            'isSuperAdmin' =>
            $isSuperAdmin,

            'etablissementId' =>
            $isSuperAdmin
                ? null
                : $etablissementId,

        ]);
    }

    /**
     * Retourne les classes accessibles
     * selon l'établissement et l'année scolaire.
     */
    public function classes(Request $request): JsonResponse
    {
        $request->validate([
            'annee_scolaire_id' => [
                'required',
                'integer',
                'exists:annee_scolaires,id',
            ],

            'etablissement_id' => [
                'nullable',
                'integer',
                'exists:etablissements,id',
            ],
        ]);

        $user = auth()->user();

        $isSuperAdmin = $user->hasRole('SuperAdmin');

        /*
    |--------------------------------------------------------------------------
    | Détermination de l'établissement
    |--------------------------------------------------------------------------
    */

        if ($isSuperAdmin) {

            $etablissementId = $request->etablissement_id;

            if (! $etablissementId) {
                return response()->json([]);
            }
        } else {

            $etablissementId = $user->etablissement_id;
        }

        /*
    |--------------------------------------------------------------------------
    | Requête des classes
    |--------------------------------------------------------------------------
    */

        $classesQuery = Classe::query()
            ->where(
                'etablissement_id',
                $etablissementId
            )
            ->where(
                'annee_scolaire_id',
                $request->annee_scolaire_id
            )
            ->where(
                'active',
                true
            );

        /*
    |--------------------------------------------------------------------------
    | ÉDUCATEUR
    |--------------------------------------------------------------------------
    | Un éducateur ne reçoit QUE ses classes affectées.
    |--------------------------------------------------------------------------
    */

        if ($user->hasRole('Educateur')) {

            $classesQuery->whereHas(
                'affectationsEducateurs',
                function ($q) use ($user, $request) {

                    $q->where(
                        'educateur_id',
                        $user->educateur_id
                    )
                        ->where(
                            'annee_scolaire_id',
                            $request->annee_scolaire_id
                        )
                        ->where(
                            'etablissement_id',
                            $user->etablissement_id
                        )
                        ->where(
                            'actif',
                            true
                        );
                }
            );
        }

        /*
    |--------------------------------------------------------------------------
    | Résultat
    |--------------------------------------------------------------------------
    */

        $classes = $classesQuery
            ->orderBy('libelle')
            ->get([
                'id',
                'libelle',
                'etablissement_id',
                'annee_scolaire_id',
            ]);

        return response()->json($classes);
    }

    /**
     * Retourne les élèves de la classe sélectionnée.
     */
    public function elevesParClasse(Classe $classe): JsonResponse
    {
        $user = auth()->user();

        /*
    |--------------------------------------------------------------------------
    | Établissement
    |--------------------------------------------------------------------------
    */

        $this->checkClasseAccess($classe);

        /*
    |--------------------------------------------------------------------------
    | Vérification spécifique ÉDUCATEUR
    |--------------------------------------------------------------------------
    */

        if ($user->hasRole('Educateur')) {

            if (! $user->educateur_id) {
                abort(403);
            }

            $autorise = EducateurClasse::query()
                ->where('educateur_id', $user->educateur_id)
                ->where('classe_id', $classe->id)
                ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                ->where('etablissement_id', $classe->etablissement_id)
                ->where('actif', true)
                ->exists();

            abort_unless($autorise, 403);
        }

        /*
    |--------------------------------------------------------------------------
    | Élèves
    |--------------------------------------------------------------------------
    */

        $eleves = Eleve::query()
            ->where('classe_id', $classe->id)
            ->where('etablissement_id', $classe->etablissement_id)
            ->where('annee_scolaire_id', $classe->annee_scolaire_id)
            ->where('actif', true)
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get([
                'id',
                'nom',
                'prenoms',
                'matricule',
                'classe_id',
                'etablissement_id',
                'annee_scolaire_id',
            ]);

        return response()->json($eleves);
    }

    /**
     * Enregistrement groupé des notes de conduite.
     */
    public function storeGroupe(
        Request $request
    ): RedirectResponse {

        $request->validate([

            'etablissement_id' => [
                'nullable',
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

            'educateur_id' => [
                'nullable',
                'integer',
                'exists:educateurs,id',
            ],

            'periode' => [
                'required',
                'string',
                'max:50',
            ],

            'notes' => [
                'required',
                'array',
                'min:1',
            ],

            'notes.*.eleve_id' => [
                'required',
                'integer',
                'exists:eleves,id',
            ],

            'notes.*.note' => [
                'nullable',
                'numeric',
                'min:0',
                'max:20',
            ],

            'notes.*.observation' => [
                'nullable',
                'string',
                'max:2000',
            ],

        ]);

        /*
        |--------------------------------------------------------------------------
        | Détermination de l'établissement
        |--------------------------------------------------------------------------
        */

        if ($this->isSuperAdmin()) {

            $etablissementId =
                $request->etablissement_id;

            if (! $etablissementId) {

                return back()
                    ->withErrors([
                        'etablissement_id' =>
                        'Veuillez sélectionner un établissement.',
                    ]);
            }
        } else {

            $etablissementId =
                $this->currentEtablissementId();
        }

        /*
        |--------------------------------------------------------------------------
        | Classe
        |--------------------------------------------------------------------------
        */

        $classe = Classe::findOrFail(
            $request->classe_id
        );
        /*
|--------------------------------------------------------------------------
| Vérification de l'accès à la classe
|--------------------------------------------------------------------------
*/

        $this->checkClasseAccess($classe);

        /*
|--------------------------------------------------------------------------
| Vérification de l'affectation ÉDUCATEUR → CLASSE
|--------------------------------------------------------------------------
*/

        if ($this->isSuperAdmin()) {

            // Aucun contrôle supplémentaire.

        } elseif (auth()->user()->hasRole('Educateur')) {

            $user = auth()->user();

            if (! $user->educateur_id) {
                abort(403);
            }

            $affectationExiste = EducateurClasse::query()
                ->where('educateur_id', $user->educateur_id)
                ->where('classe_id', $classe->id)
                ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                ->where('etablissement_id', $classe->etablissement_id)
                ->where('actif', true)
                ->exists();

            abort_unless($affectationExiste, 403);

            /*
    |--------------------------------------------------------------------------
    | L'éducateur connecté devient automatiquement responsable
    |--------------------------------------------------------------------------
    */

            $educateurId = $user->educateur_id;
        } else {

            $educateurId = $request->educateur_id;
        }
        /*
        |--------------------------------------------------------------------------
        | Vérification établissement
        |--------------------------------------------------------------------------
        */

        if (
            $classe->etablissement_id
            !== (int) $etablissementId
        ) {
            abort(403);
        }

        /*
        |--------------------------------------------------------------------------
        | Vérification année scolaire
        |--------------------------------------------------------------------------
        */

        if (
            $classe->annee_scolaire_id
            !== (int) $request->annee_scolaire_id
        ) {
            return back()
                ->withErrors([
                    'classe_id' =>
                    'La classe sélectionnée ne correspond pas à l’année scolaire.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Vérification éducateur
        |--------------------------------------------------------------------------
        */

        if ($this->isSuperAdmin()) {

            $educateurId = $request->educateur_id;
        } elseif (auth()->user()->hasRole('Educateur')) {

            $educateurId = auth()->user()->educateur_id;
        } else {

            $educateurId = $request->educateur_id;
        }

        if ($educateurId) {

            $educateur = Educateur::findOrFail($educateurId);

            if (
                ! $this->isSuperAdmin()
                &&
                $educateur->etablissement_id
                !== (int) $etablissementId
            ) {
                abort(403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Enregistrement transactionnel
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $request,
                $classe,
                $educateurId
            ) {

                foreach (
                    $request->notes
                    as $ligne
                ) {

                    /*
                    |--------------------------------------------------------------------------
                    | Aucune note saisie
                    |--------------------------------------------------------------------------
                    */

                    if (
                        ! isset($ligne['note'])
                        ||
                        $ligne['note'] === ''
                        ||
                        $ligne['note'] === null
                    ) {
                        continue;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Vérification de l'élève
                    |--------------------------------------------------------------------------
                    */

                    $eleve =
                        Eleve::query()

                        ->where(
                            'id',
                            $ligne['eleve_id']
                        )

                        ->where(
                            'classe_id',
                            $classe->id
                        )

                        ->where(
                            'etablissement_id',
                            $classe->etablissement_id
                        )

                        ->where(
                            'annee_scolaire_id',
                            $classe->annee_scolaire_id
                        )

                        ->firstOrFail();

                    /*
                    |--------------------------------------------------------------------------
                    | Création ou mise à jour
                    |--------------------------------------------------------------------------
                    */

                    Conduite::updateOrCreate(

                        [

                            'eleve_id' =>
                            $eleve->id,

                            'annee_scolaire_id' =>
                            $request->annee_scolaire_id,

                            'classe_id' =>
                            $classe->id,

                            'periode' =>
                            $request->periode,

                        ],

                        [

                            'educateur_id' => $educateurId,

                            'note' =>
                            $ligne['note'],

                            'observation' =>
                            $ligne['observation']
                                ?? null,

                        ]
                    );
                }
            }
        );

        return redirect()
            ->route('conduites.index')
            ->with(
                'success',
                'Les notes de conduite ont été enregistrées avec succès.'
            );
    }

    /**
     * Ancien enregistrement individuel.
     */
    public function store(
        StoreConduiteRequest $request
    ): RedirectResponse {

        Conduite::create(
            $request->validated()
        );

        return redirect()
            ->route('conduites.index')
            ->with(
                'success',
                'Note de conduite enregistrée avec succès.'
            );
    }

    /**
     * Modification d'une note.
     */
    public function edit(
        Conduite $conduite
    ): Response {

        $user = auth()->user();
        $classe = $conduite->classe;

        if ($classe) {

            $this->checkClasseAccess(
                $classe
            );
        }

        $isSuperAdmin =
            $this->isSuperAdmin();

        $etablissementId =
            $this->currentEtablissementId();

        return Inertia::render(
            'Conduites/Edit',
            [

                'conduite' =>
                $conduite,

                'anneesScolaires' =>
                AnneeScolaire::query()
                    ->orderByDesc('date_debut')
                    ->get(),

                'classes' => Classe::query()
                    ->when(
                        ! $isSuperAdmin,
                        fn($query) => $query->where(
                            'etablissement_id',
                            $etablissementId
                        )
                    )
                    ->when(
                        $user->hasRole('Educateur'),
                        fn($query) => $query->whereHas(
                            'affectationsEducateurs',
                            function ($q) use ($user, $conduite) {
                                $q->where(
                                    'educateur_id',
                                    $user->educateur_id
                                )
                                    ->where(
                                        'annee_scolaire_id',
                                        $conduite->annee_scolaire_id
                                    )
                                    ->where('actif', true);
                            }
                        )
                    )
                    ->orderBy('libelle')
                    ->get(),

                'eleves' =>
                Eleve::query()

                    ->when(
                        ! $isSuperAdmin,
                        fn($query) =>
                        $query->where(
                            'etablissement_id',
                            $etablissementId
                        )
                    )

                    ->orderBy('nom')
                    ->orderBy('prenoms')
                    ->get(),

                'educateurs' =>
                Educateur::query()

                    ->when(
                        ! $isSuperAdmin,
                        fn($query) =>
                        $query->where(
                            'etablissement_id',
                            $etablissementId
                        )
                    )

                    ->orderBy('nom')
                    ->orderBy('prenoms')
                    ->get(),

            ]
        );
    }

    /**
     * Mise à jour.
     */
    public function update(
        UpdateConduiteRequest $request,
        Conduite $conduite
    ): RedirectResponse {

        $user = auth()->user();

        $classeActuelle = $conduite->classe;

        if (! $classeActuelle) {
            abort(404);
        }

        /*
    |--------------------------------------------------------------------------
    | Sécurité établissement
    |--------------------------------------------------------------------------
    */

        $this->checkClasseAccess($classeActuelle);

        /*
    |--------------------------------------------------------------------------
    | Sécurité ÉDUCATEUR
    |--------------------------------------------------------------------------
    */

        if ($user->hasRole('Educateur')) {

            if (! $user->educateur_id) {
                abort(403);
            }

            $autorise = EducateurClasse::query()
                ->where('educateur_id', $user->educateur_id)
                ->where('classe_id', $classeActuelle->id)
                ->where(
                    'annee_scolaire_id',
                    $conduite->annee_scolaire_id
                )
                ->where('actif', true)
                ->exists();

            abort_unless($autorise, 403);
        }

        $data = $request->validated();

        /*
    |--------------------------------------------------------------------------
    | Vérification nouvelle classe
    |--------------------------------------------------------------------------
    */

        if (! empty($data['classe_id'])) {

            $nouvelleClasse = Classe::findOrFail(
                $data['classe_id']
            );

            $this->checkClasseAccess($nouvelleClasse);

            if ($user->hasRole('Educateur')) {

                $autoriseNouvelleClasse =
                    EducateurClasse::query()
                    ->where(
                        'educateur_id',
                        $user->educateur_id
                    )
                    ->where(
                        'classe_id',
                        $nouvelleClasse->id
                    )
                    ->where(
                        'annee_scolaire_id',
                        $data['annee_scolaire_id']
                    )
                    ->where('actif', true)
                    ->exists();

                abort_unless(
                    $autoriseNouvelleClasse,
                    403
                );
            }
        }

        /*
    |--------------------------------------------------------------------------
    | Éducateur imposé pour un compte Éducateur
    |--------------------------------------------------------------------------
    */

        if ($user->hasRole('Educateur')) {
            $data['educateur_id'] = $user->educateur_id;
        }

        $conduite->update($data);

        return redirect()
            ->route('conduites.index')
            ->with(
                'success',
                'Note de conduite modifiée avec succès.'
            );
    }

    /**
     * Suppression.
     */
    public function destroy(
        Conduite $conduite
    ): RedirectResponse {

        $user = auth()->user();

        $classe = $conduite->classe;

        if (! $classe) {
            abort(404);
        }

        /*
    |--------------------------------------------------------------------------
    | Sécurité établissement
    |--------------------------------------------------------------------------
    */

        $this->checkClasseAccess($classe);

        /*
    |--------------------------------------------------------------------------
    | Sécurité ÉDUCATEUR
    |--------------------------------------------------------------------------
    */

        if ($user->hasRole('Educateur')) {

            if (! $user->educateur_id) {
                abort(403);
            }

            $autorise = EducateurClasse::query()
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
                    $conduite->annee_scolaire_id
                )
                ->where('actif', true)
                ->exists();

            abort_unless($autorise, 403);
        }

        $conduite->delete();

        return redirect()
            ->route('conduites.index')
            ->with(
                'success',
                'Note de conduite supprimée avec succès.'
            );
    }
}
