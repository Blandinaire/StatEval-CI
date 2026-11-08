<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affectation;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Evaluation;
use App\Models\Matiere;
use App\Models\PeriodeScolaire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileEvaluationController extends Controller
{
    /**
     * Détermine l'établissement concerné.
     * Le SuperAdmin peut préciser un établissement.
     */
    private function etablissementId(Request $request): ?int
    {
        $user = $request->user();

        if ($user->hasRole('SuperAdmin')) {
            return $request->filled('etablissement_id')
                ? (int) $request->etablissement_id
                : null;
        }

        return (int) $user->etablissement_id;
    }

    /**
     * Liste des évaluations accessibles.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'etablissement_id' => ['nullable', 'integer', 'exists:etablissements,id'],
            'annee_scolaire_id' => ['nullable', 'integer', 'exists:annee_scolaires,id'],
            'classe_id' => ['nullable', 'integer', 'exists:classes,id'],
            'matiere_id' => ['nullable', 'integer', 'exists:matieres,id'],
            'periode_scolaire_id' => ['nullable', 'integer', 'exists:periodes_scolaires,id'],
            'statut' => ['nullable', 'string', 'in:programmee,active,terminee,annulee'],
        ]);

        $user = $request->user();
        $etablissementId = $this->etablissementId($request);

        $query = Evaluation::query()
            ->with([
                'anneeScolaire:id,libelle',
                'periodeScolaire:id,libelle',
                'matiere:id,libelle',
                'classe:id,libelle',
                'classes:id,libelle',
            ])
            ->withCount('notes')
            ->orderByDesc('date_evaluation')
            ->orderByDesc('id');

        if ($etablissementId !== null) {
            $query->where('etablissement_id', $etablissementId);
        }

        if ($user->hasRole('Professeur')) {
            abort_unless(
                !empty($user->enseignant_id),
                403,
                'Votre compte professeur n’est pas rattaché à un enseignant.'
            );

            $query->where(function ($q) use ($user) {
                $q->where(function ($own) use ($user) {
                    $own->where('origine', 'professeur')
                        ->where('enseignant_id', $user->enseignant_id);
                })->orWhere(function ($admin) use ($user) {
                    $admin->where('origine', 'administration')
                        ->whereHas('classes', function ($classes) use ($user) {
                            $classes->where(
                                'evaluation_classes.enseignant_id',
                                $user->enseignant_id
                            );
                        });
                });
            });
        }

        if (!empty($validated['annee_scolaire_id'])) {
            $query->where(
                'annee_scolaire_id',
                $validated['annee_scolaire_id']
            );
        }

        if (!empty($validated['classe_id'])) {
            $classeId = (int) $validated['classe_id'];

            if ($user->hasRole('Professeur')) {
                $affecte = Affectation::query()
                    ->where('enseignant_id', $user->enseignant_id)
                    ->where('classe_id', $classeId)
                    ->where('actif', true)
                    ->exists();

                $programmePourClasse = Evaluation::query()
                    ->where('origine', 'administration')
                    ->whereHas('classes', function ($q) use ($classeId, $user) {
                        $q->where('classes.id', $classeId)
                            ->where(
                                'evaluation_classes.enseignant_id',
                                $user->enseignant_id
                            );
                    })
                    ->exists();

                abort_unless(
                    $affecte || $programmePourClasse,
                    403,
                    'Vous n’êtes pas affecté à cette classe.'
                );
            } elseif (!$user->hasRole('SuperAdmin')) {
                abort_unless(
                    Classe::whereKey($classeId)
                        ->where('etablissement_id', $user->etablissement_id)
                        ->exists(),
                    403
                );
            }

            $query->where(function ($q) use ($classeId) {
                $q->where('classe_id', $classeId)
                    ->orWhereHas('classes', function ($classes) use ($classeId) {
                        $classes->whereKey($classeId);
                    });
            });
        }

        if (!empty($validated['matiere_id'])) {
            $query->where('matiere_id', $validated['matiere_id']);
        }

        if (!empty($validated['periode_scolaire_id'])) {
            $query->where(
                'periode_scolaire_id',
                $validated['periode_scolaire_id']
            );
        }

        if (!empty($validated['statut'])) {
            $query->where('statut', $validated['statut']);
        }

        $evaluations = $query->get();

        $data = $evaluations->map(function (Evaluation $evaluation) use ($user) {
            $classes = $evaluation->classes;

            // Pour un professeur, ne montrer que ses classes
            // dans une évaluation programmée par l'administration.
            if (
                $user->hasRole('Professeur') &&
                $evaluation->origine === 'administration'
            ) {
                $classes = $classes->filter(
                    fn ($classe) =>
                        (int) $classe->pivot->enseignant_id ===
                        (int) $user->enseignant_id
                )->values();
            }

            return [
                'id' => $evaluation->id,
                'libelle' => $evaluation->libelle,
                'type' => $evaluation->type,
                'origine' => $evaluation->origine,
                'statut' => $evaluation->statut,
                'date_evaluation' => $evaluation->date_evaluation?->format('Y-m-d'),
                'heure_debut' => $evaluation->heure_debut,
                'heure_fin' => $evaluation->heure_fin,
                'bareme' => $evaluation->bareme,
                'coefficient' => $evaluation->coefficient,
                'prise_en_compte_moyenne' => (bool) $evaluation->prise_en_compte_moyenne,
                'publier_eleves' => (bool) $evaluation->publier_eleves,
                'publier_parents' => (bool) $evaluation->publier_parents,

                'annee_scolaire' => $evaluation->anneeScolaire?->libelle,
                'annee_scolaire_id' => $evaluation->annee_scolaire_id,

                'periode' => $evaluation->periodeScolaire?->libelle
                    ?? $evaluation->periode,
                'periode_scolaire_id' => $evaluation->periode_scolaire_id,

                'matiere' => $evaluation->matiere?->libelle,
                'matiere_id' => $evaluation->matiere_id,

                'classe' => $evaluation->classe?->libelle,
                'classe_id' => $evaluation->classe_id,

                'classes' => $classes->map(fn ($classe) => [
                    'id' => $classe->id,
                    'libelle' => $classe->libelle,
                ])->values(),

                'notes_count' => $evaluation->notes_count,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'total' => $data->count(),
            ],
        ]);
    }

    /**
     * Options nécessaires aux filtres et formulaires mobiles.
     */
    public function options(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'etablissement_id' => ['nullable', 'integer', 'exists:etablissements,id'],
            'annee_scolaire_id' => ['nullable', 'integer', 'exists:annee_scolaires,id'],
        ]);

        $user = $request->user();
        $etablissementId = $this->etablissementId($request);

        $annee = !empty($validated['annee_scolaire_id'])
            ? AnneeScolaire::findOrFail($validated['annee_scolaire_id'])
            : AnneeScolaire::orderByDesc('date_debut')->first();

        $anneeId = $annee?->id;

        $classesQuery = Classe::query()
            ->where('active', true)
            ->orderBy('libelle');

        if ($etablissementId !== null) {
            $classesQuery->where('etablissement_id', $etablissementId);
        }

        if ($anneeId !== null) {
            $classesQuery->where('annee_scolaire_id', $anneeId);
        }

        $matieresQuery = Matiere::query()->orderBy('libelle');

        if ($user->hasRole('Professeur')) {
            abort_unless(
                !empty($user->enseignant_id),
                403,
                'Votre compte professeur n’est pas rattaché à un enseignant.'
            );

            $affectations = Affectation::query()
                ->where('enseignant_id', $user->enseignant_id)
                ->where('actif', true)
                ->when($etablissementId, fn ($q) =>
                    $q->where('etablissement_id', $etablissementId)
                )
                ->when($anneeId, fn ($q) =>
                    $q->where('annee_scolaire_id', $anneeId)
                )
                ->get(['classe_id', 'matiere_id']);

            $classesQuery->whereIn(
                'id',
                $affectations->pluck('classe_id')->unique()
            );

            $matieresQuery->whereIn(
                'id',
                $affectations->pluck('matiere_id')->unique()
            );
        }

        $classes = $classesQuery->get([
            'id',
            'libelle',
            'etablissement_id',
            'annee_scolaire_id',
            'niveau_id',
        ]);

        $matieres = $matieresQuery->get(['id', 'libelle']);

        $periodes = $anneeId
            ? PeriodeScolaire::query()
                ->where('annee_scolaire_id', $anneeId)
                ->where('actif', true)
                ->orderBy('ordre')
                ->get([
                    'id',
                    'libelle',
                    'date_debut',
                    'date_fin',
                ])
            : collect();

        return response()->json([
            'data' => [
                'annee_scolaire' => $annee ? [
                    'id' => $annee->id,
                    'libelle' => $annee->libelle,
                ] : null,
                'annees' => AnneeScolaire::orderByDesc('date_debut')
                    ->get(['id', 'libelle']),
                'classes' => $classes,
                'matieres' => $matieres,
                'periodes' => $periodes,
            ],
        ]);
    }
}
