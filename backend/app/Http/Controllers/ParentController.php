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
        $numero = preg_replace('/\D+/', '', $telephone ?? '');

        if (str_starts_with($numero, '00')) {
            $numero = substr($numero, 2);
        }

        // Numéro ivoirien au format national à 10 chiffres.
        if (strlen($numero) === 10 && !str_starts_with($numero, '225')) {
            $numero = '225' . $numero;
        }

        return $numero;
    }

    /**
     * Indexe les comptes utilisateurs d'un établissement par téléphone normalisé.
     */
    private function comptesParTelephone(int $etablissementId): array
    {
        $comptes = User::query()
            ->with('roles')
            ->where('etablissement_id', $etablissementId)
            ->whereNotNull('telephone')
            ->get();

        $index = [];

        foreach ($comptes as $compte) {
            $telephone = $this->telephoneNormalise($compte->telephone);

            if ($telephone === '') {
                continue;
            }

            $index[$telephone][] = $compte;
        }

        return $index;
    }

    /**
     * Détermine si un compte possède le rôle Parent.
     */
    private function estCompteParent(User $user): bool
    {
        return $user->hasRole('Parent');
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

        $comptesAutomatiques = (clone $statsQuery)
            ->where('genere_automatiquement', true)
            ->count();

        return Inertia::render('Parents/Index', [
            'parents' => $parents,
            'stats' => [
                'total' => (clone $statsQuery)->count(),
                'actifs' => (clone $statsQuery)->where('actif', true)->count(),
                'inactifs' => (clone $statsQuery)->where('actif', false)->count(),
                'automatiques' => $comptesAutomatiques,
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

        $groupes = [];
        $sansTelephone = 0;
        $sansMatricule = 0;

        foreach ($eleves as $eleve) {
            $telephone = $this->telephoneNormalise(
                $eleve->responsable_telephone
            );

            $nom = trim(
                ($eleve->responsable_nom ?? '') . ' ' .
                    ($eleve->responsable_prenoms ?? '')
            );

            if (!$telephone || !$nom) {
                $sansTelephone++;
                continue;
            }

            $groupes[$telephone][] = $eleve;

            if (!trim($eleve->matricule ?? '')) {
                $sansMatricule++;
            }
        }

        $comptesIndex = $this->comptesParTelephone($etablissementId);

        $existants = 0;
        $conflits = 0;
        $nouveaux = 0;

        foreach ($groupes as $telephone => $elevesDuParent) {
            $comptes = $comptesIndex[$telephone] ?? [];

            $parents = array_filter(
                $comptes,
                fn($compte) => $this->estCompteParent($compte)
            );

            $autresComptes = array_filter(
                $comptes,
                fn($compte) => !$this->estCompteParent($compte)
            );

            if (count($autresComptes) > 0) {
                $conflits++;
            } elseif (count($parents) > 0) {
                $existants++;
            } else {
                $possedeMatricule = collect($elevesDuParent)->contains(
                    fn($eleve) => trim($eleve->matricule ?? '') !== ''
                );

                if ($possedeMatricule) {
                    $nouveaux++;
                }
            }
        }

        return response()->json([
            'eleves' => $eleves->count(),
            'parents_distincts' => count($groupes),
            'comptes_existants' => $existants,
            'nouveaux_comptes' => $nouveaux,
            'conflits_telephone' => $conflits,
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

        $groupes = [];

        foreach ($eleves as $eleve) {
            $telephone = $this->telephoneNormalise(
                $eleve->responsable_telephone
            );

            $nom = trim(
                ($eleve->responsable_nom ?? '') . ' ' .
                    ($eleve->responsable_prenoms ?? '')
            );

            if (!$telephone || !$nom) {
                continue;
            }

            $groupes[$telephone][] = $eleve;
        }

        $crees = 0;
        $associes = 0;
        $ignores = 0;
        $conflits = 0;

        DB::transaction(function () use (
            $groupes,
            $etablissementId,
            &$crees,
            &$associes,
            &$ignores,
            &$conflits
        ) {
            $comptesIndex = $this->comptesParTelephone($etablissementId);

            foreach ($groupes as $telephone => $elevesDuParent) {
                $comptes = $comptesIndex[$telephone] ?? [];

                $parents = array_values(array_filter(
                    $comptes,
                    fn($compte) => $this->estCompteParent($compte)
                ));

                $autresComptes = array_filter(
                    $comptes,
                    fn($compte) => !$this->estCompteParent($compte)
                );

                // Un numéro utilisé par un autre profil ne doit pas
                // servir à créer un deuxième compte.
                if (count($autresComptes) > 0) {
                    $conflits++;
                    $ignores += count($elevesDuParent);
                    continue;
                }

                $parent = $parents[0] ?? null;

                // Chercher un matricule parmi tous les enfants du parent.
                $eleveAvecMatricule = collect($elevesDuParent)->first(
                    fn($eleve) => trim($eleve->matricule ?? '') !== ''
                );

                if (!$parent && !$eleveAvecMatricule) {
                    $ignores += count($elevesDuParent);
                    continue;
                }

                if (!$parent) {
                    $premierEleve = $elevesDuParent[0];

                    $nom = trim(
                        ($premierEleve->responsable_nom ?? '') . ' ' .
                            ($premierEleve->responsable_prenoms ?? '')
                    );

                    $matricule = trim($eleveAvecMatricule->matricule);

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

                    // Ajouter le compte créé à l'index pour éviter
                    // toute nouvelle création pendant cette opération.
                    $comptesIndex[$telephone][] = $parent;
                }

                foreach ($elevesDuParent as $eleve) {
                    if (!$parent->eleves()
                        ->where('eleves.id', $eleve->id)
                        ->exists()) {

                        $parent->eleves()->attach($eleve->id, [
                            'lien' => $eleve->type_tuteur
                                ?? 'Responsable légal',
                        ]);

                        $associes++;
                    }
                }
            }
        });

        return back()->with(
            'success',
            "Génération terminée : {$crees} compte(s) créé(s), " .
                "{$associes} association(s) effectuée(s), " .
                "{$conflits} numéro(s) en conflit, " .
                "{$ignores} fiche(s) ignorée(s)."
        );
    }

    /**
     * Supprimer un compte parent généré automatiquement.
     */
    public function destroy(User $parent)
    {
        $this->autoriser();

        abort_unless($parent->hasRole('Parent'), 404);

        abort_unless(
            $parent->genere_automatiquement === true,
            403,
            'Seuls les comptes générés automatiquement peuvent être supprimés ici.'
        );

        $user = Auth::user();

        // Un utilisateur non SuperAdmin ne peut supprimer
        // que les comptes de son propre établissement.
        abort_unless(
            $user->hasRole('SuperAdmin') ||
                (int) $parent->etablissement_id === (int) $user->etablissement_id,
            403
        );

        DB::transaction(function () use ($parent) {
            $parent->eleves()->detach();
            $parent->delete();
        });

        return back()->with(
            'success',
            'Le compte parent a été supprimé avec succès.'
        );
    }

    /**
     * Supprimer tous les comptes parents générés automatiquement
     * dans un établissement.
     */
    public function supprimerAutomatiques(Request $request)
    {
        $this->autoriser();

        $etablissementId = $this->etablissementId($request);

        $comptes = User::query()
            ->where('etablissement_id', $etablissementId)
            ->where('genere_automatiquement', true)
            ->whereHas('roles', fn($q) => $q->where('name', 'Parent'))
            ->get();

        $nombre = $comptes->count();

        DB::transaction(function () use ($comptes) {
            foreach ($comptes as $parent) {
                $parent->eleves()->detach();
                $parent->delete();
            }
        });

        return back()->with(
            'success',
            "{$nombre} compte(s) parent(s) généré(s) automatiquement supprimé(s)."
        );
    }
}
