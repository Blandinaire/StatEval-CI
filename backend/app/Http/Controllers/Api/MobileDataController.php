<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affectation;
use App\Models\Classe;
use App\Models\Eleve;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileDataController extends Controller
{
    public function classes(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Classe::query()
            ->with([
                'niveau:id,libelle',
                'cycle:id,libelle',
                'serie:id,libelle',
            ])
            ->withCount('eleves')
            ->orderBy('libelle');

        if (!$user->hasRole('SuperAdmin')) {
            abort_unless(
                $user->etablissement_id,
                403,
                'Aucun établissement associé à ce compte.'
            );

            $query->where(
                'etablissement_id',
                $user->etablissement_id
            );
        } elseif ($request->filled('etablissement_id')) {
            $query->where(
                'etablissement_id',
                $request->integer('etablissement_id')
            );
        }

        if ($user->hasRole('Professeur')) {
            abort_unless(
                $user->enseignant_id,
                403,
                'Aucun profil enseignant associé à ce compte.'
            );

            $query->whereIn(
                'id',
                Affectation::query()
                    ->where('enseignant_id', $user->enseignant_id)
                    ->where('actif', true)
                    ->pluck('classe_id')
                    ->unique()
            );
        }

        if ($request->filled('annee_scolaire_id')) {
            $query->where(
                'annee_scolaire_id',
                $request->integer('annee_scolaire_id')
            );
        }

        return response()->json([
            'data' => $query->get([
                'id',
                'etablissement_id',
                'annee_scolaire_id',
                'libelle',
                'cycle_id',
                'niveau_id',
                'serie_id',
                'capacite',
                'active',
            ]),
        ]);
    }

    public function eleves(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'classe_id' => ['nullable', 'integer'],
            'etablissement_id' => ['nullable', 'integer'],
            'annee_scolaire_id' => ['nullable', 'integer'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = $request->user();

        $query = Eleve::query()
            ->with([
                'classe:id,libelle,niveau_id,cycle_id,serie_id',
                'classe.niveau:id,libelle',
                'classe.cycle:id,libelle',
                'classe.serie:id,libelle',
            ])
            ->orderBy('nom')
            ->orderBy('prenoms');

        if (!$user->hasRole('SuperAdmin')) {
            abort_unless(
                $user->etablissement_id,
                403,
                'Aucun établissement associé à ce compte.'
            );

            $query->where(
                'etablissement_id',
                $user->etablissement_id
            );
        } elseif (!empty($validated['etablissement_id'])) {
            $query->where(
                'etablissement_id',
                $validated['etablissement_id']
            );
        }

        if ($user->hasRole('Professeur')) {
            abort_unless(
                $user->enseignant_id,
                403,
                'Aucun profil enseignant associé à ce compte.'
            );

            $classeIds = Affectation::query()
                ->where('enseignant_id', $user->enseignant_id)
                ->where('actif', true)
                ->pluck('classe_id')
                ->unique();

            $query->whereIn('classe_id', $classeIds);
        }

        if (!empty($validated['classe_id'])) {
            $query->where('classe_id', $validated['classe_id']);
        }

        if (!empty($validated['annee_scolaire_id'])) {
            $query->where(
                'annee_scolaire_id',
                $validated['annee_scolaire_id']
            );
        }

        if (!empty($validated['q'])) {
            $term = trim($validated['q']);

            $query->where(function ($q) use ($term) {
                $q->where('nom', 'like', "%{$term}%")
                    ->orWhere('prenoms', 'like', "%{$term}%")
                    ->orWhere('matricule', 'like', "%{$term}%")
                    ->orWhere('code_eleve', 'like', "%{$term}%");
            });
        }

        $paginator = $query->paginate(50)->withQueryString();

        $data = $paginator->getCollection()->map(
            function (Eleve $eleve) {
                return [
                    'id' => $eleve->id,
                    'code_eleve' => $eleve->code_eleve,
                    'matricule' => $eleve->matricule,
                    'nom' => $eleve->nom,
                    'prenoms' => $eleve->prenoms,
                    'sexe' => $eleve->sexe,
                    'statut' => $eleve->statut,
                    'classe' => $eleve->classe ? [
                        'id' => $eleve->classe->id,
                        'libelle' => $eleve->classe->libelle,
                        'niveau' => $eleve->classe->niveau?->libelle,
                        'cycle' => $eleve->classe->cycle?->libelle,
                        'serie' => $eleve->classe->serie?->libelle,
                    ] : null,
                ];
            }
        );

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }
}