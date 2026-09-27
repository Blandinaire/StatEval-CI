<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClasseRequest;
use App\Models\AnneeScolaire;
use App\Models\Affectation;
use App\Models\Classe;
use App\Models\Cycle;
use App\Models\Etablissement;
use App\Models\Maquette;
use App\Models\Niveau;
use App\Models\Serie;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClasseController extends Controller
{
    /**
     * Vérifie si l'utilisateur connecté est SuperAdmin.
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
     * Vérifie si l'utilisateur est éducateur.
     */
    private function estEducateur($user): bool
    {
        return $user->hasRole('Educateur');
    }

    /**
     * Retourne les IDs des classes auxquelles un professeur
     * est actuellement affecté.
     */
    private function classesDuProfesseur($user)
    {
        if (!$this->estProfesseur($user)) {
            return collect();
        }

        abort_unless(
            $user->enseignant_id,
            403,
            'Votre compte professeur n’est pas correctement rattaché à un enseignant.'
        );

        $anneeActiveId = AnneeScolaire::activeId();

        return Affectation::query()
            ->where('enseignant_id', $user->enseignant_id)
            ->where('annee_scolaire_id', $anneeActiveId)
            ->where('actif', true)
            ->pluck('classe_id')
            ->unique()
            ->values();
    }

    /**
     * Retourne les IDs des classes actuellement affectées à un éducateur.
     */
    private function classesDeLEducateur($user)
    {
        abort_unless(
            $user->educateur_id,
            403,
            'Votre compte éducateur n’est pas correctement rattaché à un éducateur.'
        );

        return Classe::query()
            ->whereHas('affectationsEducateurs', function ($query) use ($user) {
                $query
                    ->where('educateur_id', $user->educateur_id)
                    ->where('annee_scolaire_id', AnneeScolaire::activeId())
                    ->where('actif', true);
            })
            ->pluck('id')
            ->unique()
            ->values();
    }

    /**
     * Vérifie qu'un utilisateur peut accéder à une classe.
     *
     * SuperAdmin :
     *     toutes les classes.
     *
     * Professeur :
     *     uniquement ses classes affectées.
     *
     * Autres utilisateurs :
     *     uniquement les classes de leur établissement.
     */
    private function verifierAccesClasse($user, Classe $classe): void
    {
        /*
        |--------------------------------------------------------------------------
        | SUPER ADMIN
        |--------------------------------------------------------------------------
        */

        if ($this->estSuperAdmin($user)) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR
        |--------------------------------------------------------------------------
        */

        if ($this->estProfesseur($user)) {
            $classesAutorisees = $this->classesDuProfesseur($user);

            abort_unless(
                $classesAutorisees->contains((int) $classe->id),
                403,
                'Vous n’êtes pas affecté à cette classe.'
            );

            return;
        }

        if ($this->estEducateur($user)) {
            $classesAutorisees = $this->classesDeLEducateur($user);

            abort_unless(
                $classesAutorisees->contains((int) $classe->id),
                403,
                'Vous n’êtes pas affecté à cette classe.'
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | AUTRES UTILISATEURS
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $user->etablissement_id &&
                (int) $classe->etablissement_id ===
                (int) $user->etablissement_id,
            403
        );
    }

    /**
     * Liste des classes.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $estSuperAdmin = $this->estSuperAdmin($user);

        /*
    |--------------------------------------------------------------------------
    | FILTRE ÉTABLISSEMENT
    |--------------------------------------------------------------------------
    |
    | Seul le SuperAdmin peut choisir l'établissement.
    |
    */
        $etablissementId = $request->input('etablissement_id');

        $query = Classe::with([
            'etablissement',
            'anneeScolaire',
            'cycle',
            'niveau',
            'serie',
            'maquette',
        ])->withCount('eleves');

        /*
    |--------------------------------------------------------------------------
    | SUPERADMIN
    |--------------------------------------------------------------------------
    |
    | Le SuperAdmin peut voir toutes les classes.
    | Si un établissement est sélectionné, on filtre dessus.
    |
    */
        if ($estSuperAdmin) {

            if ($etablissementId) {
                $query->where(
                    'etablissement_id',
                    $etablissementId
                );
            }

            /*
    |--------------------------------------------------------------------------
    | PROFESSEUR
    |--------------------------------------------------------------------------
    |
    | Un professeur ne voit QUE ses classes affectées.
    |
    */
        } elseif ($this->estProfesseur($user)) {

            $classesAutorisees = $this->classesDuProfesseur($user);

            $query->whereIn(
                'id',
                $classesAutorisees
            );

            /*
    |--------------------------------------------------------------------------
    | ÉDUCATEUR
    |--------------------------------------------------------------------------
    |
    | Un éducateur ne voit QUE ses classes affectées.
    |
    */
        } elseif ($this->estEducateur($user)) {

            $query->whereIn(
                'id',
                $this->classesDeLEducateur($user)
            );

            /*
    |--------------------------------------------------------------------------
    | AUTRES UTILISATEURS
    |--------------------------------------------------------------------------
    |
    | Direction / Administrateur :
    | uniquement les classes de leur établissement.
    |
    */
        } else {

            $query->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        $classes = $query
            ->orderBy('etablissement_id')
            ->orderBy('libelle')
            ->get();

        /*
    |--------------------------------------------------------------------------
    | ÉTABLISSEMENTS DISPONIBLES
    |--------------------------------------------------------------------------
    |
    | Nécessaire uniquement pour le filtre du SuperAdmin.
    |
    */
        $etablissements = $estSuperAdmin
            ? Etablissement::orderBy('nom')->get([
                'id',
                'nom',
            ])
            : collect();

        return Inertia::render('Classes/Index', [
            'classes' => $classes,

            'etablissements' => $etablissements,

            'isSuperAdmin' => $estSuperAdmin,

            'filters' => [
                'etablissement_id' => $etablissementId,
            ],
        ]);
    }

    /**
     * Formulaire de création.
     *
     * Un professeur ne peut pas créer de classe.
     */
    public function create()
    {
        $user = Auth::user();

        abort_unless(
            !$this->estProfesseur($user),
            403,
            'Les professeurs ne peuvent pas créer de classe.'
        );

        $anneeActive = AnneeScolaire::active();

        return Inertia::render('Classes/Create', [

            'etablissements' => $this->estSuperAdmin($user)
                ? Etablissement::orderBy('nom')->get()
                : Etablissement::where(
                    'id',
                    $user->etablissement_id
                )->get(),

            'etablissementUtilisateur' =>
            $user->etablissement,

            'estSuperAdmin' =>
            $this->estSuperAdmin($user),

            'anneeActive' =>
            $anneeActive,

            'cycles' =>
            Cycle::orderBy('libelle')->get(),

            'niveaux' =>
            Niveau::orderBy('ordre')->get(),

            'series' =>
            Serie::where('actif', true)
                ->orderBy('ordre')
                ->get(),

            'maquettes' =>
            Maquette::where('active', true)->get(),
        ]);
    }

    /**
     * Enregistrement d'une classe.
     */
    public function store(StoreClasseRequest $request)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR INTERDIT
        |--------------------------------------------------------------------------
        */

        abort_unless(
            !$this->estProfesseur($user),
            403,
            'Les professeurs ne peuvent pas créer de classe.'
        );

        $data = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | ANNÉE SCOLAIRE ACTIVE
        |--------------------------------------------------------------------------
        */

        $data['annee_scolaire_id'] =
            AnneeScolaire::activeId();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (!$this->estSuperAdmin($user)) {

            $data['etablissement_id'] =
                $user->etablissement_id;
        }

        Classe::create($data);

        return redirect()
            ->route('classes.index')
            ->with(
                'success',
                'Classe créée avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(Classe $classe)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | VÉRIFICATION D'ACCÈS
        |--------------------------------------------------------------------------
        */

        $this->verifierAccesClasse(
            $user,
            $classe
        );

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR : consultation uniquement
        |--------------------------------------------------------------------------
        */

        abort_unless(
            !$this->estProfesseur($user),
            403,
            'Les professeurs ne peuvent pas modifier une classe.'
        );

        $etablissements = Etablissement::query()
            ->when(
                !$this->estSuperAdmin($user),
                function ($query) use ($user) {

                    $query->where(
                        'id',
                        $user->etablissement_id
                    );
                }
            )
            ->orderBy('nom')
            ->get();

        $anneeActive =
            AnneeScolaire::active();

        return Inertia::render('Classes/Edit', [

            'classe' =>
            $classe,

            'etablissements' =>
            $etablissements,

            'etablissementUtilisateur' =>
            $user->etablissement,

            'estSuperAdmin' =>
            $this->estSuperAdmin($user),

            'anneeActive' =>
            $anneeActive,

            'cycles' =>
            Cycle::orderBy('libelle')->get(),

            'niveaux' =>
            Niveau::orderBy('ordre')->get(),

            'series' =>
            Serie::where('actif', true)
                ->orderBy('ordre')
                ->get(),

            'maquettes' =>
            Maquette::where('active', true)->get(),
        ]);
    }

    /**
     * Mise à jour.
     */
    public function update(
        StoreClasseRequest $request,
        Classe $classe
    ) {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | VÉRIFICATION D'ACCÈS
        |--------------------------------------------------------------------------
        */

        $this->verifierAccesClasse(
            $user,
            $classe
        );

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR INTERDIT
        |--------------------------------------------------------------------------
        */

        abort_unless(
            !$this->estProfesseur($user),
            403,
            'Les professeurs ne peuvent pas modifier une classe.'
        );

        $validated =
            $request->validated();

        /*
        |--------------------------------------------------------------------------
        | ANNÉE SCOLAIRE
        |--------------------------------------------------------------------------
        */

        $validated['annee_scolaire_id'] =
            $classe->annee_scolaire_id;

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENT
        |--------------------------------------------------------------------------
        */

        if (!$this->estSuperAdmin($user)) {

            $validated['etablissement_id'] =
                $user->etablissement_id;
        }

        $classe->update($validated);

        return redirect()
            ->route('classes.index')
            ->with(
                'success',
                'Classe modifiée avec succès.'
            );
    }

    /**
     * Suppression.
     */
    public function destroy(Classe $classe)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | VÉRIFICATION D'ACCÈS
        |--------------------------------------------------------------------------
        */

        $this->verifierAccesClasse(
            $user,
            $classe
        );

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR INTERDIT
        |--------------------------------------------------------------------------
        */

        abort_unless(
            !$this->estProfesseur($user),
            403,
            'Les professeurs ne peuvent pas supprimer une classe.'
        );

        $classe->delete();

        return redirect()
            ->route('classes.index')
            ->with(
                'success',
                'Classe supprimée avec succès.'
            );
    }
}
