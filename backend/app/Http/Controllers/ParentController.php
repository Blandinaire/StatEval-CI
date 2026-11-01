<?php

namespace App\Http\Controllers;

use App\Models\Etablissement;
use App\Models\User;
use App\Models\Eleve;
use App\Models\Classe;
use App\Models\Niveau;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ParentController extends Controller
{
    private function autoriser(): void
    {
        abort_unless(
            Auth::user()->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Direction',
            ]),
            403
        );
    }

    private function etablissementId(Request $request): int
    {
        $user = Auth::user();

        $id = $user->hasRole('SuperAdmin')
            ? $request->input('etablissement_id')
            : $user->etablissement_id;

        abort_unless($id, 422, 'Veuillez sélectionner un établissement.');

        abort_unless(
            Etablissement::whereKey($id)->exists(),
            404
        );

        return (int) $id;
    }

    private function elevesDuPerimetre(Request $request, int $etablissementId)
    {
        $type = $request->input('type_perimetre', 'etablissement');

        abort_unless(
            in_array($type, ['etablissement', 'niveau', 'classe'], true),
            422,
            'Périmètre invalide.'
        );

        $query = Eleve::query()
            ->where('etablissement_id', $etablissementId);

        if ($type === 'niveau') {
            $request->validate([
                'niveau_id' => ['required', 'integer', 'exists:niveaux,id'],
            ]);

            $query->whereHas('classe', function ($q) use ($request, $etablissementId) {
                $q->where('etablissement_id', $etablissementId)
                    ->where('niveau_id', $request->niveau_id);
            });
        }

        if ($type === 'classe') {
            $request->validate([
                'classe_id' => ['required', 'integer', 'exists:classes,id'],
            ]);

            $query->where('classe_id', $request->classe_id)
                ->whereHas('classe', function ($q) use ($etablissementId) {
                    $q->where('etablissement_id', $etablissementId);
                });
        }

        return $query;
    }

    private function telephoneNormalise(?string $telephone): string
    {
        return preg_replace('/\s+/', '', trim($telephone ?? ''));
    }

    public function index(Request $request)
    {
        $this->autoriser();

        $user = Auth::user();

        $etablissementId = $user->hasRole('SuperAdmin')
            ? $request->input('etablissement_id')
            : $user->etablissement_id;

        $query = User::query()
            ->with(['roles', 'etablissement', 'eleves.classe'])
            ->whereHas('roles', fn($q) => $q->where('name', 'Parent'));

        if ($etablissementId) {
            $query->where('etablissement_id', $etablissementId);
        }

        $recherche = trim($request->input('recherche', ''));

        if ($recherche !== '') {
            $query->where(function ($q) use ($recherche) {
                $q->where('name', 'like', "%{$recherche}%")
                    ->orWhere('email', 'like', "%{$recherche}%")
                    ->orWhere('telephone', 'like', "%{$recherche}%");
            });
        }

        if ($request->filled('statut')) {
            $query->where('actif', $request->statut === 'actif');
        }

        $parents = (clone $query)
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $statsQuery = User::query()
            ->whereHas('roles', fn($q) => $q->where('name', 'Parent'));

        if ($etablissementId) {
            $statsQuery->where('etablissement_id', $etablissementId);
        }

        $etablissements = Etablissement::query()
            ->when(
                !$user->hasRole('SuperAdmin'),
                fn($q) => $q->where('id', $user->etablissement_id)
            )
            ->orderBy('nom')
            ->get(['id', 'nom']);

        $niveaux = Niveau::orderBy('ordre')
            ->get(['id', 'libelle', 'code']);

        $classes = Classe::query()
            ->when(
                $etablissementId,
                fn($q) => $q->where('etablissement_id', $etablissementId)
            )
            ->with('niveau:id,libelle')
            ->orderBy('libelle')
            ->get(['id', 'libelle', 'niveau_id']);

        return Inertia::render('Parents/Index', [
            'parents' => $parents,
            'stats' => [
                'total' => (clone $statsQuery)->count(),
                'actifs' => (clone $statsQuery)->where('actif', true)->count(),
                'inactifs' => (clone $statsQuery)->where('actif', false)->count(),
            ],
            'etablissements' => $etablissements,
            'niveaux' => $niveaux,
            'classes' => $classes,
            'filtres' => [
                'recherche' => $recherche,
                'statut' => $request->input('statut', ''),
                'etablissement_id' => $etablissementId,
            ],
            'isSuperAdmin' => $user->hasRole('SuperAdmin'),
        ]);
    }

    /**
     * Aperçu avant génération des comptes.
     */
    public function previsualiser(Request $request)
    {
        $this->autoriser();

        $etablissementId = $this->etablissementId($request);

        $eleves = $this->elevesDuPerimetre($request, $etablissementId)
            ->get([
                'id',
                'matricule',
                'responsable_nom',
                'responsable_prenoms',
                'responsable_telephone',
            ]);

        $telephones = [];
        $sansTelephone = 0;
        $sansMatricule = 0;

        foreach ($eleves as $eleve) {
            $telephone = $this->telephoneNormalise($eleve->responsable_telephone);

            if (!$telephone || !$eleve->responsable_nom) {
                $sansTelephone++;
                continue;
            }

            if (!$eleve->matricule) {
                $sansMatricule++;
                continue;
            }

            $telephones[$telephone] = true;
        }

        $numeros = array_keys($telephones);

        $existants = User::query()
            ->where('etablissement_id', $etablissementId)
            ->whereIn('telephone', $numeros)
            ->whereHas('roles', fn($q) => $q->where('name', 'Parent'))
            ->pluck('telephone')
            ->unique()
            ->count();

        return response()->json([
            'eleves' => $eleves->count(),
            'parents_distincts' => count($numeros),
            'comptes_existants' => $existants,
            'nouveaux_comptes' => max(0, count($numeros) - $existants),
            'sans_telephone' => $sansTelephone,
            'sans_matricule' => $sansMatricule,
        ]);
    }

    /**
     * Génération effective des comptes.
     */
    public function generer(Request $request)
    {
        $this->autoriser();

        $etablissementId = $this->etablissementId($request);

        $eleves = $this->elevesDuPerimetre($request, $etablissementId)
            ->get();

        $crees = 0;
        $associes = 0;
        $ignores = 0;

        DB::transaction(function () use (
            $eleves,
            $etablissementId,
            &$crees,
            &$associes,
            &$ignores
        ) {
            foreach ($eleves as $eleve) {
                $nom = trim(
                    ($eleve->responsable_nom ?? '') . ' ' .
                        ($eleve->responsable_prenoms ?? '')
                );

                $telephone = $this->telephoneNormalise(
                    $eleve->responsable_telephone
                );

                $matricule = trim($eleve->matricule ?? '');

                if (!$nom || !$telephone || !$matricule) {
                    $ignores++;
                    continue;
                }

                $parent = User::query()
                    ->where('telephone', $telephone)
                    ->where('etablissement_id', $etablissementId)
                    ->whereHas('roles', fn($q) => $q->where('name', 'Parent'))
                    ->first();

                if (!$parent) {
                    $parent = User::create([
                        'name' => $nom,
                        'email' => null,
                        'telephone' => $telephone,
                        'password' => $matricule,
                        'initial_password' => $matricule,
                        'etablissement_id' => $etablissementId,
                        'fonction' => 'Parent',
                        'actif' => true,
                        'must_change_password' => true,
                        'genere_automatiquement' => true,
                    ]);

                    $parent->assignRole('Parent');
                    $crees++;
                }

                if ((int) $parent->etablissement_id !== $etablissementId) {
                    $ignores++;
                    continue;
                }

                if (!$parent->eleves()->where('eleves.id', $eleve->id)->exists()) {
                    $parent->eleves()->attach($eleve->id, [
                        'lien' => $eleve->type_tuteur ?? 'Responsable légal',
                    ]);

                    $associes++;
                }
            }
        });

        return back()->with(
            'success',
            "Génération terminée : {$crees} compte(s) créé(s), " .
                "{$associes} association(s) effectuée(s), " .
                "{$ignores} fiche(s) ignorée(s)."
        );
    }
}
