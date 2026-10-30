<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Eleve;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParentAccountController extends Controller
{
    /**
     * Prévisualiser les contacts parentaux d'un établissement.
     * Aucun compte n'est créé par cette méthode.
     */
    public function preview(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasAnyRole([
            'SuperAdmin',
            'Administrateur',
            'Direction',
        ])) {
            return response()->json([
                'message' => 'Accès réservé à l’administration.',
            ], 403);
        }

        $validated = $request->validate([
            'etablissement_id' => [
                'required',
                'integer',
                'exists:etablissements,id',
            ],
        ]);

        $etablissementId = (int) $validated['etablissement_id'];

        if (
            !$user->hasRole('SuperAdmin') &&
            (int) $user->etablissement_id !== $etablissementId
        ) {
            return response()->json([
                'message' => 'Vous ne pouvez gérer que votre établissement.',
            ], 403);
        }

        $eleves = Eleve::query()
            ->where('etablissement_id', $etablissementId)
            ->where('actif', true)
            ->get([
                'id',
                'nom',
                'prenoms',
                'matricule',
                'responsable_nom',
                'responsable_prenoms',
                'responsable_telephone',
                'pere_nom',
                'pere_prenoms',
                'pere_telephone',
                'mere_nom',
                'mere_prenoms',
                'mere_telephone',
                'tuteur_nom',
                'tuteur_prenoms',
                'tuteur_telephone',
            ]);

        $contacts = [];

        foreach ($eleves as $eleve) {
            $sources = [
                [
                    'lien' => 'responsable',
                    'nom' => $eleve->responsable_nom,
                    'prenoms' => $eleve->responsable_prenoms,
                    'telephone' => $eleve->responsable_telephone,
                ],
                [
                    'lien' => 'pere',
                    'nom' => $eleve->pere_nom,
                    'prenoms' => $eleve->pere_prenoms,
                    'telephone' => $eleve->pere_telephone,
                ],
                [
                    'lien' => 'mere',
                    'nom' => $eleve->mere_nom,
                    'prenoms' => $eleve->mere_prenoms,
                    'telephone' => $eleve->mere_telephone,
                ],
                [
                    'lien' => 'tuteur',
                    'nom' => $eleve->tuteur_nom,
                    'prenoms' => $eleve->tuteur_prenoms,
                    'telephone' => $eleve->tuteur_telephone,
                ],
            ];

            foreach ($sources as $source) {
                $telephone = $this->normalizePhone(
                    $source['telephone'] ?? ''
                );

                if ($telephone === '') {
                    continue;
                }

                $nomComplet = trim(
                    ($source['prenoms'] ?? '') . ' ' .
                        ($source['nom'] ?? '')
                );

                if (!isset($contacts[$telephone])) {
                    $contacts[$telephone] = [
                        'telephone' => $telephone,
                        'identites' => [],
                        'eleves' => [],
                        'liens' => [],
                        'occurrences' => [],
                    ];
                }

                // Conserver les différentes identités associées
                // au même numéro pour détecter les ambiguïtés.
                if ($nomComplet !== '') {
                    $cleIdentite = mb_strtolower(
                        preg_replace('/\s+/', ' ', $nomComplet)
                    );

                    $contacts[$telephone]['identites'][$cleIdentite] =
                        $nomComplet;
                }

                // Conserver chaque origine du numéro de téléphone.
                $contacts[$telephone]['occurrences'][] = [
                    'eleve_id' => $eleve->id,
                    'eleve_nom' => $eleve->nom,
                    'eleve_prenoms' => $eleve->prenoms,
                    'eleve_matricule' => $eleve->matricule,

                    'parent_nom' => $source['nom'],
                    'parent_prenoms' => $source['prenoms'],
                    'parent_nom_complet' => $nomComplet,

                    'lien' => $source['lien'],
                    'telephone' => $telephone,
                ];

                // Conserver les élèves associés à ce numéro.
                if (!isset($contacts[$telephone]['eleves'][$eleve->id])) {
                    $contacts[$telephone]['eleves'][$eleve->id] = [
                        'id' => $eleve->id,
                        'nom' => $eleve->nom,
                        'prenoms' => $eleve->prenoms,
                        'matricule' => $eleve->matricule,
                        'liens' => [],
                    ];
                }

                $contacts[$telephone]['eleves'][$eleve->id]['liens'][] =
                    $source['lien'];

                $contacts[$telephone]['liens'][] = $source['lien'];
            }
        }

        $resultats = [];

        foreach ($contacts as $contact) {
            $contact['eleves'] = array_values(
                $contact['eleves']
            );

            $contact['occurrences'] = array_values(
                $contact['occurrences']
            );

            // Supprimer les doublons de liens pour chaque élève.
            foreach ($contact['eleves'] as &$eleveAssocie) {
                $eleveAssocie['liens'] = array_values(
                    array_unique($eleveAssocie['liens'])
                );
            }
            unset($eleveAssocie);

            $contact['liens'] = array_values(
                array_unique($contact['liens'])
            );

            // Analyser les identités associées au numéro.
            $noms = array_values($contact['identites']);

            $contact['noms_detectes'] = $noms;
            $contact['identite_ambigue'] = count($noms) > 1;
            $contact['nom'] = count($noms) === 1
                ? $noms[0]
                : null;

            unset($contact['identites']);

            // Rechercher tous les comptes parents associés
            // à ce numéro dans cet établissement.
            $comptes = User::query()
                ->where('etablissement_id', $etablissementId)
                ->where('telephone', $contact['telephone'])
                ->whereHas('roles', function ($query) {
                    $query->where('name', 'Parent');
                })
                ->get(['id', 'name', 'telephone']);

            $contact['nombre_comptes_existants'] = $comptes->count();
            $contact['compte_existant'] = $comptes->isNotEmpty();

            $contact['comptes_multiples'] = $comptes->count() > 1;

            $contact['user_id'] = $comptes->count() === 1
                ? $comptes->first()->id
                : null;

            // Un contact ne peut être créé automatiquement
            // que si son identité est claire et son compte absent.
            $contact['eligible_creation'] =
                !$contact['compte_existant'] &&
                !$contact['identite_ambigue'] &&
                !$contact['comptes_multiples'] &&
                !empty($contact['nom']);

            $contact['nombre_eleves'] = count($contact['eleves']);

            $resultats[] = $contact;
        }

        $nombreAmbigus = count(array_filter(
            $resultats,
            fn($contact) => $contact['identite_ambigue']
        ));

        $nombreAvecCompte = count(array_filter(
            $resultats,
            fn($contact) => $contact['compte_existant']
        ));

        $nombreEligibles = count(array_filter(
            $resultats,
            fn($contact) => $contact['eligible_creation']
        ));

        return response()->json([
            'etablissement_id' => $etablissementId,
            'nombre_contacts' => count($resultats),
            'nombre_avec_compte' => $nombreAvecCompte,
            'nombre_identites_ambigues' => $nombreAmbigus,
            'nombre_eligibles_creation' => $nombreEligibles,
            'contacts' => $resultats,
        ]);
    }

    /**
     * Créer un ou plusieurs comptes parents et associer leurs enfants.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Vérifier les autorisations.
        if (!$user->hasAnyRole([
            'SuperAdmin',
            'Administrateur',
            'Direction',
        ])) {
            return response()->json([
                'message' => 'Accès réservé à l’administration.',
            ], 403);
        }

        // Valider les données reçues.
        $validated = $request->validate([
            'etablissement_id' => [
                'required',
                'integer',
                'exists:etablissements,id',
            ],

            'parents' => [
                'required',
                'array',
                'min:1',
                'max:500',
            ],

            'parents.*.telephone' => [
                'required',
                'string',
                'max:20',
            ],

            'parents.*.nom' => [
                'required',
                'string',
                'max:100',
            ],

            'parents.*.prenoms' => [
                'required',
                'string',
                'max:150',
            ],

            'parents.*.eleves' => [
                'required',
                'array',
                'min:1',
            ],

            'parents.*.eleves.*.id' => [
                'required',
                'integer',
            ],

            'parents.*.eleves.*.lien' => [
                'required',
                'string',
                'in:responsable,pere,mere,tuteur',
            ],
        ]);

        $etablissementId = (int) $validated['etablissement_id'];

        // Un utilisateur ne peut gérer que son établissement.
        if (
            !$user->hasRole('SuperAdmin') &&
            (int) $user->etablissement_id !== $etablissementId
        ) {
            return response()->json([
                'message' => 'Vous ne pouvez gérer que votre établissement.',
            ], 403);
        }

        /*
    |--------------------------------------------------------------------------
    | Normalisation des numéros et contrôle des doublons dans la demande
    |--------------------------------------------------------------------------
    */

        $telephones = [];

        foreach ($validated['parents'] as $index => &$parentData) {
            $telephone = $this->normalizePhone(
                $parentData['telephone']
            );

            if ($telephone === '' || strlen($telephone) < 8) {
                return response()->json([
                    'message' => 'Un numéro de téléphone est invalide.',
                    'parent_index' => $index,
                ], 422);
            }

            $parentData['telephone'] = $telephone;

            if (in_array($telephone, $telephones, true)) {
                return response()->json([
                    'message' => 'Un même numéro de téléphone apparaît plusieurs fois dans la demande.',
                    'telephone' => $telephone,
                ], 422);
            }

            $telephones[] = $telephone;

            $parentData['nom'] = trim($parentData['nom']);
            $parentData['prenoms'] = trim($parentData['prenoms']);

            $idsEleves = array_column($parentData['eleves'], 'id');

            if (count($idsEleves) !== count(array_unique($idsEleves))) {
                return response()->json([
                    'message' => 'Un même élève est associé plusieurs fois au même parent.',
                    'telephone' => $telephone,
                ], 422);
            }
        }

        unset($parentData);

        /*
    |--------------------------------------------------------------------------
    | Création transactionnelle des comptes
    |--------------------------------------------------------------------------
    */

        $resultats = DB::transaction(function () use (
            $validated,
            $etablissementId
        ) {
            $resultats = [];

            foreach ($validated['parents'] as $parentData) {

                // Vérifier qu'aucun compte Parent n'existe déjà.
                $compteExistant = User::query()
                    ->where('etablissement_id', $etablissementId)
                    ->where('telephone', $parentData['telephone'])
                    ->whereHas('roles', function ($query) {
                        $query->where('name', 'Parent');
                    })
                    ->exists();

                if ($compteExistant) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'telephone' => [
                            'Un compte parent existe déjà pour le numéro ' .
                                $parentData['telephone'] . '.',
                        ],
                    ]);
                }

                // Récupérer les enfants de cet établissement.
                $eleveIds = collect($parentData['eleves'])
                    ->pluck('id')
                    ->map(fn($id) => (int) $id)
                    ->unique()
                    ->values();

                $eleves = Eleve::query()
                    ->where('etablissement_id', $etablissementId)
                    ->where('actif', true)
                    ->whereIn('id', $eleveIds)
                    ->get();

                // Tous les enfants demandés doivent être valides.
                if ($eleves->count() !== $eleveIds->count()) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'eleves' => [
                            'Un ou plusieurs élèves sont inexistants, inactifs ou n’appartiennent pas à cet établissement.',
                        ],
                    ]);
                }

                // Aucun enfant ne peut être utilisé sans matricule.
                foreach ($eleves as $eleve) {
                    if (trim((string) $eleve->matricule) === '') {
                        throw \Illuminate\Validation\ValidationException::withMessages([
                            'matricule' => [
                                'Un élève associé ne possède pas de matricule.',
                            ],
                        ]);
                    }
                }

                // Vérifier l'unicité des matricules dans l'établissement.
                $matricules = $eleves->pluck('matricule')
                    ->map(fn($m) => mb_strtolower(trim($m)));

                if ($matricules->unique()->count() !== $eleves->count()) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'matricule' => [
                            'Les matricules des enfants associés doivent être distincts.',
                        ],
                    ]);
                }

                $matriculesExistants = Eleve::query()
                    ->where('etablissement_id', $etablissementId)
                    ->whereIn('matricule', $eleves->pluck('matricule'))
                    ->select('matricule')
                    ->groupBy('matricule')
                    ->havingRaw('COUNT(*) > 1')
                    ->exists();

                if ($matriculesExistants) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'matricule' => [
                            'Un matricule associé est utilisé par plusieurs élèves de cet établissement.',
                        ],
                    ]);
                }

                // Le premier enfant fournit le mot de passe initial.
                $premierEleve = $eleves->firstWhere(
                    'id',
                    (int) $parentData['eleves'][0]['id']
                );

                // Créer le compte parent.
                $parent = User::create([
                    'name' => trim(
                        $parentData['nom'] . ' ' . $parentData['prenoms']
                    ),
                    'telephone' => $parentData['telephone'],
                    'etablissement_id' => $etablissementId,
                    'password' => $premierEleve->matricule,
                    'must_change_password' => true,
                    'initial_password' => null,
                    'actif' => true,
                ]);

                // Attribuer le rôle Parent.
                $parent->assignRole('Parent');

                // Préparer les associations avec les enfants.
                $associations = [];

                foreach ($parentData['eleves'] as $association) {
                    $associations[(int) $association['id']] = [
                        'lien' => $association['lien'],
                    ];
                }

                // Associer tous les enfants au compte.
                $parent->eleves()->attach($associations);

                $resultats[] = [
                    'user_id' => $parent->id,
                    'nom' => $parent->name,
                    'telephone' => $parent->telephone,
                    'nombre_eleves' => count($associations),
                    'must_change_password' => true,
                ];
            }

            return $resultats;
        });

        return response()->json([
            'message' => 'Les comptes parents ont été créés avec succès.',
            'nombre_comptes_crees' => count($resultats),
            'comptes' => $resultats,
        ], 201);
    }

    /**
     * Normaliser un numéro de téléphone.
     */
    private function normalizePhone(string $telephone): string
    {
        return preg_replace('/[\s().-]+/', '', trim($telephone)) ?? '';
    }
}
