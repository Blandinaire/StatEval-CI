<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affectation;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\EducateurClasse;
use App\Models\Eleve;
use App\Models\User;
use App\Models\EmploiDuTemps;
use App\Models\CreneauHoraire;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileDataController extends Controller
{
    /**
     * Retourne les classes accessibles à l'utilisateur connecté.
     *
     * SuperAdmin : toutes les classes, avec filtres facultatifs.
     * Administrateur / Direction : classes de leur établissement.
     * Professeur : classes faisant l'objet d'une affectation active.
     * Educateur : classes faisant l'objet d'une affectation active.
     */
    public function classes(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'etablissement_id' => ['nullable', 'integer', 'min:1'],
            'annee_scolaire_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = $request->user();

        $this->verifierEtablissement($user, $validated);

        $anneeId = $this->determinerAnneeScolaire(
            $user,
            $validated
        );

        $query = Classe::query()
            ->with([
                'niveau:id,libelle',
                'cycle:id,libelle',
                'serie:id,libelle',
            ])
            ->withCount('eleves')
            ->orderBy('libelle');

        $this->appliquerPerimetreEtablissement(
            $query,
            $user,
            $validated
        );

        if ($anneeId !== null) {
            $query->where('annee_scolaire_id', $anneeId);
        }

        $this->appliquerPerimetreClasses(
            $query,
            $user,
            $anneeId
        );

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

    /**
     * Retourne une liste paginée des élèves accessibles.
     *
     * Les informations personnelles sensibles ne sont pas exposées.
     * La pagination renvoie 50 élèves par page.
     */
    public function eleves(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'classe_id' => ['nullable', 'integer', 'min:1'],
            'etablissement_id' => ['nullable', 'integer', 'min:1'],
            'annee_scolaire_id' => ['nullable', 'integer', 'min:1'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = $request->user();

        $this->verifierEtablissement($user, $validated);

        $anneeId = $this->determinerAnneeScolaire(
            $user,
            $validated
        );

        $query = Eleve::query()
            ->with([
                'classe:id,libelle,niveau_id,cycle_id,serie_id',
                'classe.niveau:id,libelle',
                'classe.cycle:id,libelle',
                'classe.serie:id,libelle',
            ])
            ->orderBy('nom')
            ->orderBy('prenoms');

        // Isolation par établissement.
        $this->appliquerPerimetreEtablissement(
            $query,
            $user,
            $validated
        );

        // Limitation à l'année scolaire demandée ou active.
        if ($anneeId !== null) {
            $query->where('annee_scolaire_id', $anneeId);
        }

        // Limitation aux classes autorisées pour le compte.
        $classeIds = $this->obtenirClassesAutorisees(
            $user,
            $anneeId,
            $validated
        );

        if ($classeIds !== null) {
            $query->whereIn('classe_id', $classeIds);
        }

        // Si une classe est explicitement demandée, vérifier
        // qu'elle appartient au périmètre autorisé.
        if (!empty($validated['classe_id'])) {
            $classeDemandee = (int) $validated['classe_id'];

            $classeAutorisee = Classe::query()
                ->whereKey($classeDemandee);

            $this->appliquerPerimetreEtablissement(
                $classeAutorisee,
                $user,
                $validated
            );

            if ($anneeId !== null) {
                $classeAutorisee->where(
                    'annee_scolaire_id',
                    $anneeId
                );
            }

            if ($classeIds !== null) {
                $classeAutorisee->whereIn('id', $classeIds);
            }

            abort_unless(
                $classeAutorisee->exists(),
                403,
                'Vous n’êtes pas autorisé à consulter cette classe.'
            );

            $query->where('classe_id', $classeDemandee);
        }

        // Recherche par nom, prénom, matricule ou code élève.
        if (!empty($validated['q'])) {
            $term = trim($validated['q']);

            $query->where(function (Builder $q) use ($term) {
                $q->where('nom', 'like', "%{$term}%")
                    ->orWhere('prenoms', 'like', "%{$term}%")
                    ->orWhere('matricule', 'like', "%{$term}%")
                    ->orWhere('code_eleve', 'like', "%{$term}%");
            });
        }

        $paginator = $query
            ->paginate(50)
            ->withQueryString();

        // Liste blanche : uniquement les champs nécessaires au mobile.
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

    /**
     * Vérifie les paramètres d'établissement.
     *
     * Un utilisateur ordinaire ne peut pas sélectionner un autre
     * établissement en modifiant les paramètres de la requête.
     */
    private function verifierEtablissement(
        User $user,
        array $validated
    ): void {
        if ($user->hasRole('SuperAdmin')) {
            return;
        }

        abort_unless(
            $user->etablissement_id,
            403,
            'Aucun établissement associé à ce compte.'
        );

        if (!empty($validated['etablissement_id'])) {
            abort_unless(
                (int) $validated['etablissement_id']
                    === (int) $user->etablissement_id,
                403,
                'Vous n’êtes pas autorisé à consulter cet établissement.'
            );
        }
    }

    /**
     * Détermine l'année scolaire à utiliser.
     *
     * Pour les utilisateurs ordinaires, l'année active est imposée.
     * Le SuperAdmin peut sélectionner une autre année.
     */
    private function determinerAnneeScolaire(
        User $user,
        array $validated
    ): ?int {
        if ($user->hasRole('SuperAdmin')) {
            if (!empty($validated['annee_scolaire_id'])) {
                return (int) $validated['annee_scolaire_id'];
            }

            return AnneeScolaire::activeId();
        }

        $anneeActiveId = AnneeScolaire::activeId();

        abort_unless(
            $anneeActiveId,
            403,
            'Aucune année scolaire active n’est configurée.'
        );

        // Empêche un compte ordinaire de consulter une autre année
        // en modifiant directement le paramètre de la requête.
        if (!empty($validated['annee_scolaire_id'])) {
            abort_unless(
                (int) $validated['annee_scolaire_id']
                    === (int) $anneeActiveId,
                403,
                'Vous n’êtes pas autorisé à consulter cette année scolaire.'
            );
        }

        return (int) $anneeActiveId;
    }

    /**
     * Applique le périmètre de l'établissement à une requête
     * portant sur des classes ou des élèves.
     */
    private function appliquerPerimetreEtablissement(
        Builder $query,
        User $user,
        array $validated
    ): void {
        if ($user->hasRole('SuperAdmin')) {
            if (!empty($validated['etablissement_id'])) {
                $query->where(
                    'etablissement_id',
                    (int) $validated['etablissement_id']
                );
            }

            return;
        }

        $query->where(
            'etablissement_id',
            $user->etablissement_id
        );
    }

    /**
     * Applique le périmètre des classes à la requête des classes.
     */
    private function appliquerPerimetreClasses(
        Builder $query,
        User $user,
        ?int $anneeId
    ): void {
        $classeIds = $this->obtenirClassesAutorisees(
            $user,
            $anneeId
        );

        if ($classeIds !== null) {
            $query->whereIn('id', $classeIds);
        }
    }

    /**
     * Retourne les identifiants des classes autorisées.
     *
     * null signifie que le compte n'est pas limité par ses
     * affectations de classes, par exemple Administrateur ou
     * Direction, sous réserve du périmètre de l'établissement.
     */
    private function obtenirClassesAutorisees(
        User $user,
        ?int $anneeId,
        array $validated = []
    ): ?array {
        // Professeur : classes avec affectations actives.
        if ($user->hasRole('Professeur')) {
            abort_unless(
                $user->enseignant_id,
                403,
                'Aucun profil enseignant associé à ce compte.'
            );

            $affectations = Affectation::query()
                ->where('enseignant_id', $user->enseignant_id)
                ->where('actif', true)
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                );

            if ($anneeId !== null) {
                $affectations->where(
                    'annee_scolaire_id',
                    $anneeId
                );
            }

            return $affectations
                ->pluck('classe_id')
                ->unique()
                ->values()
                ->all();
        }

        // Éducateur : classes qui lui sont attribuées.
        if ($user->hasRole('Educateur')) {
            abort_unless(
                $user->educateur_id,
                403,
                'Aucun profil éducateur associé à ce compte.'
            );

            $affectations = EducateurClasse::query()
                ->where('educateur_id', $user->educateur_id)
                ->where('actif', true)
                ->where(
                    'etablissement_id',
                    $user->etablissement_id
                );

            if ($anneeId !== null) {
                $affectations->where(
                    'annee_scolaire_id',
                    $anneeId
                );
            }

            return $affectations
                ->pluck('classe_id')
                ->unique()
                ->values()
                ->all();
        }

        // Les autres rôles sont limités à leur établissement.
        // Le SuperAdmin conserve son accès global ou filtré.
        return null;
    }


    public function emploiDuTemps(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = EmploiDuTemps::query()
            ->where('statut', 'publie')
            ->with([
                'anneeScolaire:id,libelle',
                'lignes' => function ($query) use ($user) {
                    $query->with([
                        'classe:id,libelle',
                        'matiere:id,libelle,code,couleur',
                        'enseignant:id,nom,prenoms',
                        'creneau:id,libelle,type,heure_debut,heure_fin,ordre',
                        'salleAssociee:id,nom',
                    ]);

                    // Un professeur ne consulte que ses propres cours.
                    if ($user->hasRole('Professeur')) {
                        abort_unless(
                            $user->enseignant_id,
                            403,
                            'Aucun profil enseignant associé à ce compte.'
                        );

                        $query->where(
                            'enseignant_id',
                            $user->enseignant_id
                        );
                    }
                },
            ]);

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

        $anneeId = $request->integer(
            'annee_scolaire_id',
            AnneeScolaire::activeId() ?? 0
        );

        if ($anneeId) {
            $query->where('annee_scolaire_id', $anneeId);
        }

        $emploi = $query->orderByDesc('id')->first();

        if (!$emploi) {
            return response()->json([
                'data' => null,
                'message' => 'Aucun emploi du temps publié disponible.',
            ]);
        }

        $lignes = $emploi->lignes
            ->sortBy(fn($ligne) => [
                strtolower((string) $ligne->jour),
                $ligne->creneau?->ordre ?? 999,
                $ligne->creneau?->heure_debut ?? '',
            ])
            ->values()
            ->map(fn($ligne) => [
                'id' => $ligne->id,
                'jour' => $ligne->jour,
                'groupe' => $ligne->groupe,
                'activite' => $ligne->activite,
                'classe_id' => $ligne->classe_id,
                'classe' => $ligne->classe?->libelle,
                'matiere' => $ligne->matiere?->libelle,
                'matiere_code' => $ligne->matiere?->code,
                'matiere_couleur' => $ligne->matiere?->couleur,
                'enseignant_id' => $ligne->enseignant_id,
                'enseignant' => $ligne->enseignant
                    ? trim(
                        $ligne->enseignant->nom . ' ' .
                            $ligne->enseignant->prenoms
                    )
                    : null,
                'creneau' => $ligne->creneau ? [
                    'libelle' => $ligne->creneau->libelle,
                    'type' => $ligne->creneau->type,
                    'heure_debut' => $ligne->creneau->heure_debut,
                    'heure_fin' => $ligne->creneau->heure_fin,
                    'ordre' => $ligne->creneau->ordre,
                ] : null,
                'salle' => $ligne->salleAssociee?->nom
                    ?? $ligne->salle,
            ]);

        $creneaux = CreneauHoraire::query()
            ->where('etablissement_id', $emploi->etablissement_id)
            ->where('actif', true)
            ->orderBy('ordre')
            ->orderBy('heure_debut')
            ->get([
                'libelle',
                'type',
                'heure_debut',
                'heure_fin',
                'ordre',
            ]);

        return response()->json([
            'data' => [
                'id' => $emploi->id,
                'nom' => $emploi->nom,
                'statut' => $emploi->statut,
                'annee_scolaire' => $emploi->anneeScolaire?->libelle,
                'creneaux' => $creneaux,
                'lignes' => $lignes,
            ],
        ]);
    }
}
