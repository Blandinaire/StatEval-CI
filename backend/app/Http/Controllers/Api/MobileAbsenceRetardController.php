<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\Retard;
use App\Models\Eleve;
use App\Models\EducateurClasse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class MobileAbsenceRetardController extends Controller
{
    /**
     * Vérifie les droits de consultation ou de gestion.
     */
    private function utilisateurAutorise(Request $request, bool $gestion = false): User
    {
        $user = $request->user();

        abort_unless($user, 401);

        if ($gestion) {
            abort_unless(
                $user->hasAnyRole([
                    'SuperAdmin',
                    'Administrateur',
                    'Direction',
                    'Educateur',
                ]),
                403,
                'Votre profil ne permet pas cette opération.'
            );
        } else {
            abort_unless(
                $user->hasAnyRole([
                    'SuperAdmin',
                    'Administrateur',
                    'Direction',
                    'Educateur',
                    'Parent',
                ]),
                403,
                'Votre profil ne permet pas de consulter ces informations.'
            );
        }

        return $user;
    }

    /**
     * Vérifie qu'un élève appartient au périmètre de l'utilisateur.
     */
    private function verifierEleve(User $user, Eleve $eleve): void
    {
        if (!$user->hasRole('SuperAdmin')) {
            abort_unless(
                (int) $eleve->etablissement_id === (int) $user->etablissement_id,
                403,
                'Cet élève ne relève pas de votre établissement.'
            );
        }

        if ($user->hasRole('Parent')) {
            abort_unless(
                $user->eleves()->where('eleves.id', $eleve->id)->exists(),
                403,
                'Cet élève ne fait pas partie de vos enfants associés.'
            );
        }

        if ($user->hasRole('Educateur')) {
            abort_unless($user->educateur_id, 403, 'Aucun profil éducateur associé.');

            $autorise = EducateurClasse::query()
                ->where('educateur_id', $user->educateur_id)
                ->where('classe_id', $eleve->classe_id)
                ->where('annee_scolaire_id', $eleve->annee_scolaire_id)
                ->where('etablissement_id', $eleve->etablissement_id)
                ->where('actif', true)
                ->exists();

            abort_unless(
                $autorise,
                403,
                'Cet élève ne fait pas partie de vos classes affectées.'
            );
        }
    }

    /**
     * Construit une requête limitée aux données accessibles.
     */
    private function appliquerPerimetre($query, User $user, Request $request): void
    {
        // 1. Périmètre de l'établissement
        if (!$user->hasRole('SuperAdmin')) {
            abort_unless(
                $user->etablissement_id,
                403,
                'Aucun établissement associé.'
            );

            $etablissementId = $user->etablissement_id;
        } else {
            $etablissementId = $request->filled('etablissement_id')
                ? $request->integer('etablissement_id')
                : null;
        }

        // Les absences et retards sont rattachés à un élève.
        // On filtre donc par l'établissement de cet élève.
        if ($etablissementId) {
            $query->whereHas('eleve', function ($q) use ($etablissementId) {
                $q->where('etablissement_id', $etablissementId);
            });
        }

        // 2. Périmètre du parent : ses propres enfants uniquement
        if ($user->hasRole('Parent')) {
            $query->whereIn(
                'eleve_id',
                $user->eleves()->select('eleves.id')
            );
        }

        // 3. Périmètre de l'éducateur : ses classes actives uniquement
        if ($user->hasRole('Educateur')) {
            abort_unless($user->educateur_id, 403);

            $classeIds = EducateurClasse::query()
                ->where('educateur_id', $user->educateur_id)
                ->where('etablissement_id', $user->etablissement_id)
                ->where('actif', true)
                ->pluck('classe_id');

            $query->whereIn('classe_id', $classeIds);
        }
    }

    /**
     * Liste des absences.
     */
    public function absences(Request $request): JsonResponse
    {
        $user = $this->utilisateurAutorise($request);

        $validated = $request->validate([
            'eleve_id' => ['nullable', 'integer'],
            'date_debut' => ['nullable', 'date'],
            'date_fin' => ['nullable', 'date', 'after_or_equal:date_debut'],
            'etablissement_id' => ['nullable', 'integer'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Absence::query()
            ->with([
                'eleve:id,nom,prenoms,classe_id',
                'classe:id,libelle',
            ]);

        $this->appliquerPerimetre($query, $user, $request);

        if (!empty($validated['eleve_id'])) {
            $query->where('eleve_id', $validated['eleve_id']);
        }

        if (!empty($validated['date_debut'])) {
            $query->whereDate('date_absence', '>=', $validated['date_debut']);
        }

        if (!empty($validated['date_fin'])) {
            $query->whereDate('date_absence', '<=', $validated['date_fin']);
        }

        $resultats = $query
            ->orderByDesc('date_absence')
            ->paginate(30);

        return response()->json([
            'data' => $resultats->items(),
            'meta' => [
                'current_page' => $resultats->currentPage(),
                'last_page' => $resultats->lastPage(),
                'total' => $resultats->total(),
            ],
        ]);
    }

    /**
     * Enregistre une absence.
     */
    public function storeAbsence(Request $request): JsonResponse
    {
        $user = $this->utilisateurAutorise($request, true);

        $validated = $request->validate([
            'eleve_id' => ['required', 'integer', 'exists:eleves,id'],
            'date_absence' => ['required', 'date'],
            'heure_debut' => ['nullable', 'date_format:H:i'],
            'heure_fin' => ['nullable', 'date_format:H:i', 'after:heure_debut'],
            'duree_heures' => ['nullable', 'numeric', 'min:0', 'max:24'],
            'justifiee' => ['required', 'boolean'],
            'motif' => ['nullable', 'string', 'max:2000'],
            'observation' => ['nullable', 'string', 'max:2000'],
        ]);

        $eleve = Eleve::findOrFail($validated['eleve_id']);
        $this->verifierEleve($user, $eleve);

        $absence = DB::transaction(function () use ($validated, $eleve, $user) {
            $absence = Absence::create([
                ...$validated,
                'educateur_id' => $user->educateur_id,
                'annee_scolaire_id' => $eleve->annee_scolaire_id,
                'classe_id' => $eleve->classe_id,
                'numero_billet' => null,
                'billet_edite' => false,
                'billet_edite_le' => null,
            ]);

            $absence->update([
                'numero_billet' => 'BA-' .
                    Carbon::parse($absence->date_absence)->format('Y') .
                    '-' . str_pad($absence->id, 6, '0', STR_PAD_LEFT),
            ]);

            return $absence;
        });

        return response()->json([
            'message' => 'Absence enregistrée avec succès.',
            'data' => $absence->load(['eleve', 'classe']),
        ], 201);
    }

    /**
     * Modifie une absence.
     */
    public function updateAbsence(Request $request, Absence $absence): JsonResponse
    {
        $user = $this->utilisateurAutorise($request, true);

        $this->verifierEleve($user, $absence->eleve);

        $validated = $request->validate([
            'date_absence' => ['sometimes', 'required', 'date'],
            'heure_debut' => ['sometimes', 'nullable', 'date_format:H:i'],
            'heure_fin' => ['sometimes', 'nullable', 'date_format:H:i'],
            'duree_heures' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:24'],
            'justifiee' => ['sometimes', 'required', 'boolean'],
            'motif' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'observation' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $absence->update($validated);

        return response()->json([
            'message' => 'Absence modifiée avec succès.',
            'data' => $absence->fresh()->load(['eleve', 'classe']),
        ]);
    }

    /**
     * Supprime une absence.
     */
    public function destroyAbsence(Request $request, Absence $absence): JsonResponse
    {
        $user = $this->utilisateurAutorise($request, true);

        $this->verifierEleve($user, $absence->eleve);

        $absence->delete();

        return response()->json([
            'message' => 'Absence supprimée avec succès.',
        ]);
    }

    /**
     * Liste des retards.
     */
    public function retards(Request $request): JsonResponse
    {
        $user = $this->utilisateurAutorise($request);

        $validated = $request->validate([
            'eleve_id' => ['nullable', 'integer'],
            'date_debut' => ['nullable', 'date'],
            'date_fin' => ['nullable', 'date', 'after_or_equal:date_debut'],
            'etablissement_id' => ['nullable', 'integer'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Retard::query()
            ->with([
                'eleve:id,nom,prenoms,classe_id',
                'classe:id,libelle',
            ]);

        $this->appliquerPerimetre($query, $user, $request);

        if (!empty($validated['eleve_id'])) {
            $query->where('eleve_id', $validated['eleve_id']);
        }

        if (!empty($validated['date_debut'])) {
            $query->whereDate('date_retard', '>=', $validated['date_debut']);
        }

        if (!empty($validated['date_fin'])) {
            $query->whereDate('date_retard', '<=', $validated['date_fin']);
        }

        $resultats = $query
            ->orderByDesc('date_retard')
            ->paginate(30);

        return response()->json([
            'data' => $resultats->items(),
            'meta' => [
                'current_page' => $resultats->currentPage(),
                'last_page' => $resultats->lastPage(),
                'total' => $resultats->total(),
            ],
        ]);
    }

    /**
     * Calcule automatiquement la durée du retard.
     */
    private function calculerDureeRetard(?string $heurePrevue, ?string $heureArrivee): int
    {
        if (!$heurePrevue || !$heureArrivee) {
            return 0;
        }

        $prevue = Carbon::createFromFormat('H:i', substr($heurePrevue, 0, 5));
        $arrivee = Carbon::createFromFormat('H:i', substr($heureArrivee, 0, 5));

        if ($arrivee->lessThanOrEqualTo($prevue)) {
            return 0;
        }

        return (int) $prevue->diffInMinutes($arrivee);
    }

    /**
     * Enregistre un retard.
     */
    public function storeRetard(Request $request): JsonResponse
    {
        $user = $this->utilisateurAutorise($request, true);

        $validated = $request->validate([
            'eleve_id' => ['required', 'integer', 'exists:eleves,id'],
            'date_retard' => ['required', 'date'],
            'heure_prevue' => ['nullable', 'date_format:H:i'],
            'heure_arrivee' => ['nullable', 'date_format:H:i'],
            'motif' => ['nullable', 'string', 'max:2000'],
            'observation' => ['nullable', 'string', 'max:2000'],
        ]);

        $eleve = Eleve::findOrFail($validated['eleve_id']);
        $this->verifierEleve($user, $eleve);

        $retard = DB::transaction(function () use ($validated, $eleve, $user) {
            $retard = Retard::create([
                ...$validated,
                'educateur_id' => $user->educateur_id,
                'annee_scolaire_id' => $eleve->annee_scolaire_id,
                'classe_id' => $eleve->classe_id,
                'duree_minutes' => $this->calculerDureeRetard(
                    $validated['heure_prevue'] ?? null,
                    $validated['heure_arrivee'] ?? null
                ),
                'numero_billet' => null,
                'billet_edite' => false,
                'billet_edite_le' => null,
            ]);

            $retard->update([
                'numero_billet' => 'RET-' .
                    Carbon::parse($retard->date_retard)->format('Y') .
                    '-' . str_pad($retard->id, 4, '0', STR_PAD_LEFT),
            ]);

            return $retard;
        });

        return response()->json([
            'message' => 'Retard enregistré avec succès.',
            'data' => $retard->load(['eleve', 'classe']),
        ], 201);
    }

    /**
     * Modifie un retard.
     */
    public function updateRetard(Request $request, Retard $retard): JsonResponse
    {
        $user = $this->utilisateurAutorise($request, true);

        $this->verifierEleve($user, $retard->eleve);

        $validated = $request->validate([
            'date_retard' => ['sometimes', 'required', 'date'],
            'heure_prevue' => ['sometimes', 'nullable', 'date_format:H:i'],
            'heure_arrivee' => ['sometimes', 'nullable', 'date_format:H:i'],
            'motif' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'observation' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $heurePrevue = $validated['heure_prevue'] ?? $retard->heure_prevue;
        $heureArrivee = $validated['heure_arrivee'] ?? $retard->heure_arrivee;

        $validated['duree_minutes'] = $this->calculerDureeRetard(
            $heurePrevue,
            $heureArrivee
        );

        $retard->update($validated);

        return response()->json([
            'message' => 'Retard modifié avec succès.',
            'data' => $retard->fresh()->load(['eleve', 'classe']),
        ]);
    }

    /**
     * Supprime un retard.
     */
    public function destroyRetard(Request $request, Retard $retard): JsonResponse
    {
        $user = $this->utilisateurAutorise($request, true);

        $this->verifierEleve($user, $retard->eleve);

        $retard->delete();

        return response()->json([
            'message' => 'Retard supprimé avec succès.',
        ]);
    }
}
