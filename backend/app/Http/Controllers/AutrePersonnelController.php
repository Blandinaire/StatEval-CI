<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAutrePersonnelRequest;
use App\Models\AutrePersonnel;
use App\Models\Etablissement;
use App\Models\FonctionPersonnel;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AutrePersonnelController extends Controller
{
    /**
     * Vérifier les rôles autorisés.
     */
    private function verifierAcces(): void
    {
        abort_unless(
            Auth::user()?->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Directeur',
                'Direction',
            ]),
            403
        );
    }

    /**
     * Vérifier l'accès au personnel concerné.
     */
    private function verifierEtablissement(
        AutrePersonnel $personnel
    ): void {
        $user = Auth::user();

        if (
            !$user->hasRole('SuperAdmin')
            && (int) $personnel->etablissement_id
            !== (int) $user->etablissement_id
        ) {
            abort(403);
        }
    }

    /**
     * Liste des autres personnels.
     */
    public function index(Request $request): Response
    {
        $this->verifierAcces();

        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('SuperAdmin');

        $etablissementId = $isSuperAdmin
            ? $request->input('etablissement_id')
            : $user->etablissement_id;

        $query = AutrePersonnel::query()
            ->with(['fonction', 'user', 'etablissement'])
            ->orderBy('nom')
            ->orderBy('prenoms');

        if ($etablissementId) {
            $query->where(
                'etablissement_id',
                $etablissementId
            );
        } elseif (!$isSuperAdmin) {
            $query->whereRaw('1 = 0');
        }

        if ($request->filled('recherche')) {
            $recherche = $request->input('recherche');

            $query->where(function ($q) use ($recherche) {
                $q->where('nom', 'like', "%{$recherche}%")
                    ->orWhere('prenoms', 'like', "%{$recherche}%")
                    ->orWhere('matricule', 'like', "%{$recherche}%")
                    ->orWhere('telephone', 'like', "%{$recherche}%");
            });
        }

        if ($request->filled('fonction_personnel_id')) {
            $query->where(
                'fonction_personnel_id',
                $request->input('fonction_personnel_id')
            );
        }

        if ($request->filled('statut')) {
            $query->where(
                'statut',
                $request->input('statut')
            );
        }

        $personnels = $query->get();

        return Inertia::render('AutresPersonnels/Index', [
            'personnels' => $personnels,
            'fonctions' => FonctionPersonnel::query()
                ->where('actif', true)
                ->orderBy('libelle')
                ->get(['id', 'libelle']),
            'etablissements' => $isSuperAdmin
                ? Etablissement::query()
                ->orderBy('nom')
                ->get(['id', 'nom'])
                : [],
            'etablissementSelectionne' => $etablissementId
                ? (int) $etablissementId
                : null,
            'isSuperAdmin' => $isSuperAdmin,
            'filtres' => [
                'recherche' => $request->input('recherche', ''),
                'fonction_personnel_id' => $request->input(
                    'fonction_personnel_id',
                    ''
                ),
                'statut' => $request->input('statut', ''),
            ],
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create(): Response
    {
        $this->verifierAcces();

        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('SuperAdmin');

        return Inertia::render('AutresPersonnels/Create', [
            'fonctions' => FonctionPersonnel::query()
                ->where('actif', true)
                ->orderBy('libelle')
                ->get(['id', 'libelle']),
            'etablissements' => $isSuperAdmin
                ? Etablissement::query()
                ->orderBy('nom')
                ->get(['id', 'nom'])
                : [],
            'etablissementId' => $isSuperAdmin
                ? null
                : $user->etablissement_id,
            'isSuperAdmin' => $isSuperAdmin,
            'comptesDisponibles' => $this->comptesDisponibles(
                $user->etablissement_id,
                $isSuperAdmin
            ),
        ]);
    }

    /**
     * Enregistrement d'un personnel.
     */
    public function store(
        StoreAutrePersonnelRequest $request
    ): RedirectResponse {
        $this->verifierAcces();

        $user = Auth::user();
        $data = $request->validated();
        $isSuperAdmin = $user->hasRole('SuperAdmin');

        $etablissementId = $isSuperAdmin
            ? $request->validate([
                'etablissement_id' => [
                    'required',
                    'integer',
                    'exists:etablissements,id',
                ],
            ])['etablissement_id']
            : $user->etablissement_id;

        abort_if(!$etablissementId, 422, 'Aucun établissement défini.');

        $this->verifierCompteUtilisateur(
            $data['user_id'] ?? null,
            $etablissementId
        );

        $data['etablissement_id'] = $etablissementId;
        $data['actif'] = $data['actif'] ?? true;

        // Le matricule est attribué automatiquement.
        unset($data['matricule']);

        DB::transaction(function () use ($data) {
            $personnel = AutrePersonnel::create($data);

            $personnel->matricule = 'AP-' . str_pad(
                (string) $personnel->id,
                6,
                '0',
                STR_PAD_LEFT
            );

            $personnel->save();
        });

        return redirect()
            ->route('autres-personnels.index')
            ->with('success', 'Personnel enregistré avec succès.');
    }

    /**
     * Afficher la fiche d'un personnel.
     */
    public function show(AutrePersonnel $autre_personnel): Response
    {
        $this->verifierAcces();
        $this->verifierEtablissement($autre_personnel);

        $autre_personnel->load(['fonction', 'etablissement', 'user']);

        return Inertia::render('AutresPersonnels/Show', [
            'personnel' => $autre_personnel,
        ]);
    }

    /**
     * Formulaire de modification.
     */
    public function edit(AutrePersonnel $autre_personnel): Response
    {
        $this->verifierAcces();
        $this->verifierEtablissement($autre_personnel);

        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('SuperAdmin');

        return Inertia::render('AutresPersonnels/Edit', [
            'personnel' => $autre_personnel->load(['fonction', 'user']),
            'fonctions' => FonctionPersonnel::query()
                ->where(function ($query) use ($autre_personnel) {
                    $query->where('actif', true)
                        ->orWhere(
                            'id',
                            $autre_personnel->fonction_personnel_id
                        );
                })
                ->orderBy('libelle')
                ->get(['id', 'libelle']),
            'etablissements' => $isSuperAdmin
                ? Etablissement::query()
                ->orderBy('nom')
                ->get(['id', 'nom'])
                : [],
            'isSuperAdmin' => $isSuperAdmin,
            'etablissementId' => $autre_personnel->etablissement_id,
            'comptesDisponibles' => $this->comptesDisponibles(
                $autre_personnel->etablissement_id,
                $isSuperAdmin,
                $autre_personnel->user_id
            ),
        ]);
    }

    /**
     * Mettre à jour un personnel.
     */
    public function update(
        StoreAutrePersonnelRequest $request,
        AutrePersonnel $autre_personnel
    ): RedirectResponse {
        $this->verifierAcces();
        $this->verifierEtablissement($autre_personnel);

        $user = Auth::user();
        $data = $request->validated();

        // Le matricule est immuable après sa création.
        unset($data['matricule']);

        $isSuperAdmin = $user->hasRole('SuperAdmin');

        $etablissementId = $autre_personnel->etablissement_id;

        if ($isSuperAdmin && $request->filled('etablissement_id')) {
            $etablissementId = $request->validate([
                'etablissement_id' => [
                    'required',
                    'integer',
                    'exists:etablissements,id',
                ],
            ])['etablissement_id'];
        }

        $this->verifierCompteUtilisateur(
            $data['user_id'] ?? null,
            $etablissementId,
            $autre_personnel->id
        );

        $data['etablissement_id'] = $etablissementId;
        $data['actif'] = $data['actif'] ?? $autre_personnel->actif;

        $autre_personnel->update($data);

        return redirect()
            ->route('autres-personnels.index')
            ->with('success', 'Personnel modifié avec succès.');
    }

    /**
     * Supprimer un personnel.
     */
    public function destroy(
        AutrePersonnel $autre_personnel
    ): RedirectResponse {
        $this->verifierAcces();
        $this->verifierEtablissement($autre_personnel);

        $autre_personnel->delete();

        return redirect()
            ->route('autres-personnels.index')
            ->with('success', 'Personnel supprimé avec succès.');
    }

    /**
     * Vérifier que le matricule est unique dans l'établissement.
     */
    private function verifierMatricule(
        ?string $matricule,
        int|string $etablissementId,
        ?int $personnelId = null
    ): void {
        if (!$matricule) {
            return;
        }

        $existe = AutrePersonnel::query()
            ->where('etablissement_id', $etablissementId)
            ->where('matricule', $matricule)
            ->when(
                $personnelId,
                fn($query) => $query->where('id', '!=', $personnelId)
            )
            ->exists();

        if ($existe) {
            abort(
                422,
                'Ce matricule est déjà utilisé dans cet établissement.'
            );
        }
    }

    /**
     * Vérifier le compte utilisateur associé.
     */

    private function verifierCompteUtilisateur(
        int|string|null $userId,
        int|string $etablissementId,
        ?int $personnelId = null
    ): void {
        if (!$userId) {
            return;
        }

        $compte = User::query()->findOrFail($userId);

        // Un compte SuperAdmin ne peut pas être associé à un personnel.
        if ($compte->hasRole('SuperAdmin')) {
            abort(
                422,
                "Un compte SuperAdmin ne peut pas être associé à un personnel."
            );
        }

        // Le compte doit appartenir au même établissement.
        if ((int) $compte->etablissement_id !== (int) $etablissementId) {
            abort(
                422,
                "Ce compte utilisateur n'appartient pas à cet établissement."
            );
        }

        // Le compte ne peut être associé qu'à un seul personnel.
        $dejaAssocie = AutrePersonnel::query()
            ->where('user_id', $userId)
            ->when(
                $personnelId,
                fn($query) => $query->where('id', '!=', $personnelId)
            )
            ->exists();

        if ($dejaAssocie) {
            abort(
                422,
                "Ce compte utilisateur est déjà associé à un autre personnel."
            );
        }
    }


    /**
     * Comptes utilisables pour l'association.
     */

    /**
     * Comptes disponibles pour un établissement précis.
     */

    private function comptesDisponibles(
        ?int $etablissementId,
        bool $isSuperAdmin,
        ?int $userIdActuel = null
    ) {
        if (!$etablissementId) {
            return collect();
        }

        if (
            !$isSuperAdmin
            && (int) Auth::user()->etablissement_id !== $etablissementId
        ) {
            abort(403);
        }

        return User::query()
            ->where('etablissement_id', $etablissementId)
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'SuperAdmin');
            })
            ->where(function ($query) use ($userIdActuel) {
                $query->whereDoesntHave('autrePersonnel');

                if ($userIdActuel) {
                    $query->orWhere('id', $userIdActuel);
                }
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
    }



    /**
     * Retourne les comptes utilisateurs disponibles pour un établissement.
     */
    public function comptesDisponiblesPourEtablissement(
        int $etablissement
    ): \Illuminate\Http\JsonResponse {
        $this->verifierAcces();

        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('SuperAdmin');

        // Un utilisateur non-SuperAdmin reste limité à son établissement.
        if (
            !$isSuperAdmin
            && (int) $user->etablissement_id !== $etablissement
        ) {
            abort(403, 'Accès interdit à cet établissement.');
        }

        // Vérifier que l'établissement existe.
        abort_unless(
            Etablissement::whereKey($etablissement)->exists(),
            404,
            'Établissement introuvable.'
        );

        $comptes = $this->comptesDisponibles(
            $etablissement,
            $isSuperAdmin
        );

        return response()->json($comptes);
    }
}
