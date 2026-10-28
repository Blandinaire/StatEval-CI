<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Etablissement;
use App\Models\Evaluation;
use App\Services\CalculMoyennesService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BulletinController extends Controller
{
    public function index(
        Request $request,
        CalculMoyennesService $calcul
    ) {
        $user = Auth::user();
        $estSuperAdmin = $user->hasRole('SuperAdmin');

        $etablissements = $estSuperAdmin
            ? Etablissement::orderBy('nom')->get(['id', 'nom'])
            : collect();

        $etablissementSelectionne = $estSuperAdmin
            ? ($request->integer('etablissement_id') ?: null)
            : $user->etablissement_id;

        $queryClasses = Classe::query()
            ->with([
                'maquette',
                'etablissement',
                'anneeScolaire',
            ])
            ->orderBy('libelle');

        if ($estSuperAdmin) {
            if ($etablissementSelectionne) {
                $queryClasses->where(
                    'etablissement_id',
                    $etablissementSelectionne
                );
            }
        } else {
            $queryClasses->where(
                'etablissement_id',
                $user->etablissement_id
            );
        }

        $classes = $queryClasses->get([
            'id',
            'libelle',
            'etablissement_id',
            'annee_scolaire_id',
            'maquette_id',
        ]);

        $classeId = $request->integer('classe_id');
        $classe = $classeId
            ? $classes->firstWhere('id', $classeId)
            : null;

        $periodes = collect();
        $eleves = collect();
        $bulletin = null;

        if ($classe) {
            $periodes = Evaluation::query()
                ->where('etablissement_id', $classe->etablissement_id)
                ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                ->where(function ($query) use ($classe) {
                    $query->where('classe_id', $classe->id)
                        ->orWhereHas('classes', function ($q) use ($classe) {
                            $q->where('classes.id', $classe->id);
                        });
                })
                ->whereNotNull('periode')
                ->distinct()
                ->orderBy('periode')
                ->pluck('periode')
                ->values();

            $eleves = Eleve::query()
                ->where('etablissement_id', $classe->etablissement_id)
                ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                ->where('classe_id', $classe->id)
                ->where('actif', true)
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get([
                    'id',
                    'matricule',
                    'nom',
                    'prenoms',
                    'classe_id',
                    'etablissement_id',
                    'annee_scolaire_id',
                ]);

            $eleveId = $request->integer('eleve_id');
            $eleve = $eleveId
                ? $eleves->firstWhere('id', $eleveId)
                : null;

            $periode = $request->input('periode');

            if ($eleve && $periode && $classe->maquette) {
                $evaluations = Evaluation::query()
                    ->where('etablissement_id', $classe->etablissement_id)
                    ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                    ->where(function ($query) use ($classe) {
                        $query->where('classe_id', $classe->id)
                            ->orWhereHas('classes', function ($q) use ($classe) {
                                $q->where('classes.id', $classe->id);
                            });
                    })
                    ->where('periode', $periode)
                    ->with('notes')
                    ->get();

                $notes = collect();

                foreach ($evaluations as $evaluation) {
                    foreach ($evaluation->notes as $note) {
                        if ((int) $note->eleve_id !== (int) $eleve->id) {
                            continue;
                        }

                        $note->setRelation('evaluation', $evaluation);
                        $notes->push($note);
                    }
                }

                $lignesMaquette = $classe->maquette->lignes()
                    ->with('matiere')
                    ->get();

                $moyennes = $calcul->calculerMoyennesEleve(
                    $notes,
                    $lignesMaquette
                );

                $matieres = [];

                foreach ($lignesMaquette as $ligne) {
                    $matiereId = (int) $ligne->matiere_id;

                    $matieres[] = [
                        'matiere_id' => $matiereId,
                        'matiere' => $ligne->matiere?->libelle ?? 'Matière',
                        'coefficient' => (float) $ligne->coefficient,
                        'moyenne' => $moyennes['moyennes_matieres'][$matiereId] ?? null,
                        'active' => (bool) $ligne->active,
                        'prise_en_compte_moyenne' => (bool) $ligne->prise_en_compte_moyenne,
                    ];
                }

                $bulletin = [
                    'eleve' => [
                        'id' => $eleve->id,
                        'matricule' => $eleve->matricule,
                        'nom' => $eleve->nom,
                        'prenoms' => $eleve->prenoms,
                    ],
                    'classe' => $classe->libelle,
                    'periode' => $periode,

                    'etablissement' => [
                        'nom' => $classe->etablissement?->nom ?? '',
                        'sigle' => $classe->etablissement?->sigle ?? '',
                        'adresse' => $classe->etablissement?->adresse ?? '',
                        'ville' => $classe->etablissement?->ville ?? '',
                        'telephone' => $classe->etablissement?->telephone ?? '',
                        'directeur' => $classe->etablissement?->directeur ?? '',
                        'logo' => $classe->etablissement?->logo ?? null,
                    ],

                    'annee_scolaire' => $classe->anneeScolaire?->libelle ?? '',
                    'matieres' => $matieres,
                    'moyenne_generale' => $moyennes['moyenne_generale'],
                ];
            }
        }

        return Inertia::render('Bulletins/Index', [
            'etablissements' => $etablissements,
            'etablissementSelectionne' => $etablissementSelectionne,
            'isSuperAdmin' => $estSuperAdmin,
            'classes' => $classes,
            'classeSelectionnee' => $classeId ?: null,
            'periodes' => $periodes,
            'periodeSelectionnee' => $request->input('periode'),
            'eleves' => $eleves,
            'eleveSelectionne' => $request->integer('eleve_id') ?: null,
            'bulletin' => $bulletin,
        ]);
    }
}
