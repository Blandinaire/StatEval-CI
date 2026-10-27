<?php

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Evaluation;
use App\Services\CalculMoyennesService;
use App\Models\Etablissement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ResultatController extends Controller
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
            ? $request->integer('etablissement_id') ?: null
            : $user->etablissement_id;

        $queryClasses = Classe::query()
            ->with('maquette')
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

        $resultats = [];
        $periodes = [];

        if ($classe) {
            $periodes = Evaluation::query()
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

            $periode = $request->input('periode');

            $evaluations = Evaluation::query()
                ->where('etablissement_id', $classe->etablissement_id)
                ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                ->where(function ($query) use ($classe) {
                    $query->where('classe_id', $classe->id)
                        ->orWhereHas('classes', function ($q) use ($classe) {
                            $q->where('classes.id', $classe->id);
                        });
                })
                ->when($periode, fn($q) => $q->where('periode', $periode))
                ->with([
                    'matiere',
                    'notes.eleve',
                ])
                ->get();

            $notesParEleve = [];

            foreach ($evaluations as $evaluation) {
                foreach ($evaluation->notes as $note) {
                    if (!$note->eleve) {
                        continue;
                    }

                    if (
                        (int) $note->eleve->classe_id !== (int) $classe->id ||
                        !(bool) $note->eleve->actif
                    ) {
                        continue;
                    }

                    $note->setRelation('evaluation', $evaluation);

                    $notesParEleve[$note->eleve_id][] = $note;
                }
            }

            $eleves = Eleve::query()
                ->where('etablissement_id', $classe->etablissement_id)
                ->where('annee_scolaire_id', $classe->annee_scolaire_id)
                ->where('classe_id', $classe->id)
                ->where('actif', true)
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get();

            $lignesMaquette = $classe->maquette
                ? $classe->maquette->lignes
                : collect();

            foreach ($eleves as $eleve) {
                $notes = collect($notesParEleve[$eleve->id] ?? []);

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
                    ];
                }

                $resultats[] = [
                    'eleve_id' => $eleve->id,
                    'matricule' => $eleve->matricule,
                    'nom' => $eleve->nom,
                    'prenoms' => $eleve->prenoms,
                    'matieres' => $matieres,
                    'moyenne_generale' => $moyennes['moyenne_generale'],
                ];
            }

            usort($resultats, function ($a, $b) {
                if ($a['moyenne_generale'] === null) {
                    return 1;
                }

                if ($b['moyenne_generale'] === null) {
                    return -1;
                }

                return $b['moyenne_generale'] <=> $a['moyenne_generale'];
            });
        }

        return Inertia::render('Resultats/Index', [
            'classes' => $classes,
            'classeSelectionnee' => $classeId ?: null,
            'periodeSelectionnee' => $request->input('periode'),
            'periodes' => $periodes,
            'resultats' => $resultats,
            'isSuperAdmin' => $estSuperAdmin,
            'etablissements' => $etablissements,
            'etablissementSelectionne' => $etablissementSelectionne,
        ]);
    }
}
