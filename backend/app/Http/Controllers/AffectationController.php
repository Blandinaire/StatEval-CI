<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAffectationRequest;
use App\Models\Affectation;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Etablissement;
use App\Models\Enseignant;
use App\Models\Matiere;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class AffectationController extends Controller
{


    /**
     * Applique automatiquement la restriction
     * par établissement uniquement si la table
     * possède réellement la colonne etablissement_id.
     */
    private function restrictToCurrentEtablissement(
        Builder $query,
        string $modelClass
    ): Builder {
        /*
        |--------------------------------------------------------------------------
        | SuperAdmin
        |--------------------------------------------------------------------------
        |
        | Le SuperAdmin voit toutes les données.
        |
        */

        if ($this->isSuperAdmin()) {
            return $query;
        }

        $etablissementId = $this->currentEtablissementId();

        /*
        |--------------------------------------------------------------------------
        | Vérification de la colonne
        |--------------------------------------------------------------------------
        |
        | Certaines tables, comme annee_scolaires,
        | sont actuellement globales et ne possèdent
        | pas etablissement_id.
        |
        */

        $model = new $modelClass;

        $table = $model->getTable();

        if (
            $etablissementId &&
            Schema::hasColumn(
                $table,
                'etablissement_id'
            )
        ) {
            $query->where(
                $table . '.etablissement_id',
                $etablissementId
            );
        }

        return $query;
    }

    /**
     * Vérifie que l'utilisateur peut accéder
     * à une affectation.
     */
    private function ensureCanAccessAffectation(
        Affectation $affectation
    ): void {
        if ($this->isSuperAdmin()) {
            return;
        }

        $etablissementId =
            $this->currentEtablissementId();

        if (
            (int) $affectation->etablissement_id
            !==
            (int) $etablissementId
        ) {
            abort(403);
        }
    }

    /**
     * Liste des affectations.
     */
    public function index()
    {
        $query = Affectation::with([
            'etablissement',
            'anneeScolaire',
            'classe',
            'matiere',
            'enseignant',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Restriction établissement
        |--------------------------------------------------------------------------
        */

        if (! $this->isSuperAdmin()) {
            $query->where(
                'etablissement_id',
                $this->currentEtablissementId()
            );
        }

        $affectations = $query
            ->orderByDesc('id')
            ->get();

        return Inertia::render(
            'Affectations/Index',
            [
                'affectations' => $affectations,
            ]
        );
    }

    /**
     * Formulaire de création.
     */
    public function create()
    {
        $isSuperAdmin =
            $this->isSuperAdmin();

        $etablissementId =
            $this->currentEtablissementId();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENTS
        |--------------------------------------------------------------------------
        */

        $etablissementsQuery =
            Etablissement::query();

        if (! $isSuperAdmin) {
            $etablissementsQuery->where(
                'id',
                $etablissementId
            );
        }

        $etablissements =
            $etablissementsQuery
            ->orderBy('nom')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | ANNÉES SCOLAIRES
        |--------------------------------------------------------------------------
        |
        | Restriction appliquée seulement si
        | la table possède etablissement_id.
        |
        */

        $annees =
            $this->restrictToCurrentEtablissement(
                AnneeScolaire::query(),
                AnneeScolaire::class
            )
            ->orderByDesc('date_debut')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | CLASSES
        |--------------------------------------------------------------------------
        */

        $classes =
            $this->restrictToCurrentEtablissement(
                Classe::query(),
                Classe::class
            )
            ->orderBy('libelle')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | MATIÈRES
        |--------------------------------------------------------------------------
        */

        $matieres =
            $this->restrictToCurrentEtablissement(
                Matiere::query(),
                Matiere::class
            )
            ->orderBy('libelle')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | ENSEIGNANTS
        |--------------------------------------------------------------------------
        */

        $enseignants =
            $this->restrictToCurrentEtablissement(
                Enseignant::query(),
                Enseignant::class
            )
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get();

        return Inertia::render(
            'Affectations/Create',
            [

                'etablissements' => $etablissements,

                'annees' => $annees,

                'classes' => $classes,

                'matieres' => $matieres,

                'enseignants' => $enseignants,

                'isSuperAdmin' =>
                $isSuperAdmin,

                'etablissementId' =>
                $isSuperAdmin
                    ? null
                    : $etablissementId,

            ]
        );
    }

    /**
     * Enregistrement d'une affectation.
     */
    public function store(
        StoreAffectationRequest $request
    ) {
        $data = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | Sécurité établissement
        |--------------------------------------------------------------------------
        |
        | Un utilisateur autre que SuperAdmin
        | ne peut jamais créer une affectation
        | dans un autre établissement.
        |
        */

        if (! $this->isSuperAdmin()) {
            $data['etablissement_id'] =
                $this->currentEtablissementId();
        }

        Affectation::create($data);

        return redirect()
            ->route('affectations.index')
            ->with(
                'success',
                'Affectation créée avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(
        Affectation $affectation
    ) {
        /*
        |--------------------------------------------------------------------------
        | Sécurité accès
        |--------------------------------------------------------------------------
        */

        $this->ensureCanAccessAffectation(
            $affectation
        );

        $isSuperAdmin =
            $this->isSuperAdmin();

        $etablissementId =
            $this->currentEtablissementId();

        /*
        |--------------------------------------------------------------------------
        | ÉTABLISSEMENTS
        |--------------------------------------------------------------------------
        */

        $etablissementsQuery =
            Etablissement::query();

        if (! $isSuperAdmin) {
            $etablissementsQuery->where(
                'id',
                $etablissementId
            );
        }

        $etablissements =
            $etablissementsQuery
            ->orderBy('nom')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | ANNÉES SCOLAIRES
        |--------------------------------------------------------------------------
        */

        $annees =
            $this->restrictToCurrentEtablissement(
                AnneeScolaire::query(),
                AnneeScolaire::class
            )
            ->orderByDesc('date_debut')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | CLASSES
        |--------------------------------------------------------------------------
        */

        $classes =
            $this->restrictToCurrentEtablissement(
                Classe::query(),
                Classe::class
            )
            ->orderBy('libelle')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | MATIÈRES
        |--------------------------------------------------------------------------
        */

        $matieres =
            $this->restrictToCurrentEtablissement(
                Matiere::query(),
                Matiere::class
            )
            ->orderBy('libelle')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | ENSEIGNANTS
        |--------------------------------------------------------------------------
        */

        $enseignants =
            $this->restrictToCurrentEtablissement(
                Enseignant::query(),
                Enseignant::class
            )
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get();

        return Inertia::render(
            'Affectations/Edit',
            [

                'affectation' =>
                $affectation,

                'etablissements' =>
                $etablissements,

                'annees' =>
                $annees,

                'classes' =>
                $classes,

                'matieres' =>
                $matieres,

                'enseignants' =>
                $enseignants,

                'isSuperAdmin' =>
                $isSuperAdmin,

                'etablissementId' =>
                $isSuperAdmin
                    ? null
                    : $etablissementId,

            ]
        );
    }

    /**
     * Mise à jour d'une affectation.
     */
    public function update(
        StoreAffectationRequest $request,
        Affectation $affectation
    ) {
        /*
        |--------------------------------------------------------------------------
        | Sécurité accès
        |--------------------------------------------------------------------------
        */

        $this->ensureCanAccessAffectation(
            $affectation
        );

        $data = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | Sécurité établissement
        |--------------------------------------------------------------------------
        */

        if (! $this->isSuperAdmin()) {
            $data['etablissement_id'] =
                $this->currentEtablissementId();
        }

        $affectation->update($data);

        return redirect()
            ->route('affectations.index')
            ->with(
                'success',
                'Affectation modifiée avec succès.'
            );
    }

    /**
     * Suppression.
     */
    public function destroy(
        Affectation $affectation
    ) {
        /*
        |--------------------------------------------------------------------------
        | Sécurité accès
        |--------------------------------------------------------------------------
        */

        $this->ensureCanAccessAffectation(
            $affectation
        );

        $affectation->delete();

        return redirect()
            ->route('affectations.index')
            ->with(
                'success',
                'Affectation supprimée avec succès.'
            );
    }

    /**
     * Retourne les enseignants correspondant
     * à une matière.
     */
    public function enseignantsParMatiere(
        Request $request,
        $matiereId
    ) {
        $query = Enseignant::query()

            ->where(function (
                $query
            ) use (
                $matiereId
            ) {

                $query
                    ->where(
                        'matiere_principale_id',
                        $matiereId
                    )
                    ->orWhere(
                        'matiere_secondaire_id',
                        $matiereId
                    );
            })

            ->where(
                'actif',
                true
            );

        /*
        |--------------------------------------------------------------------------
        | Restriction établissement
        |--------------------------------------------------------------------------
        */

        if (! $this->isSuperAdmin()) {

            $query->where(
                'etablissement_id',
                $this->currentEtablissementId()
            );
        } elseif (
            $request->filled(
                'etablissement_id'
            )
        ) {

            $query->where(
                'etablissement_id',
                $request->etablissement_id
            );
        }

        $enseignants = $query

            ->orderBy('nom')

            ->orderBy('prenoms')

            ->get([
                'id',
                'nom',
                'prenoms',
                'etablissement_id',
                'matiere_principale_id',
                'matiere_secondaire_id',
            ]);

        return response()->json(
            $enseignants
        );
    }
}
