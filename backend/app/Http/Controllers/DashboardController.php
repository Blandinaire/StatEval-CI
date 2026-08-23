<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Classe;
use App\Models\Conduite;
use App\Models\Educateur;
use App\Models\Eleve;
use App\Models\Enseignant;
use App\Models\Etablissement;
use App\Models\Retard;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $aujourdhui = Carbon::today();

        /*
        |--------------------------------------------------------------------------
        | Dernières activités de la vie scolaire
        |--------------------------------------------------------------------------
        */

        $dernieresConduites = Conduite::with([
            'eleve',
            'educateur',
            'classe',
        ])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($conduite) {
                return [
                    'id' => $conduite->id,
                    'type' => 'conduite',
                    'titre' => 'Note de conduite',
                    'eleve' => $conduite->eleve
                        ? $conduite->eleve->nom . ' ' .
                            $conduite->eleve->prenoms
                        : 'Élève inconnu',
                    'classe' => $conduite->classe?->libelle ?? '-',
                    'valeur' => number_format(
                        (float) $conduite->note,
                        2,
                        ',',
                        ' '
                    ) . '/20',
                    'date' => $conduite->created_at,
                ];
            });

        $dernieresAbsences = Absence::with([
            'eleve',
            'educateur',
            'classe',
        ])
            ->latest('date_absence')
            ->latest('id')
            ->take(5)
            ->get()
            ->map(function ($absence) {
                return [
                    'id' => $absence->id,
                    'type' => 'absence',
                    'titre' => 'Absence enregistrée',
                    'eleve' => $absence->eleve
                        ? $absence->eleve->nom . ' ' .
                            $absence->eleve->prenoms
                        : 'Élève inconnu',
                    'classe' => $absence->classe?->libelle ?? '-',
                    'valeur' => $absence->justifiee
                        ? 'Justifiée'
                        : 'Non justifiée',
                    'date' => $absence->date_absence,
                ];
            });

        $derniersRetards = Retard::with([
            'eleve',
            'educateur',
            'classe',
        ])
            ->latest('date_retard')
            ->latest('id')
            ->take(5)
            ->get()
            ->map(function ($retard) {
                return [
                    'id' => $retard->id,
                    'type' => 'retard',
                    'titre' => 'Retard enregistré',
                    'eleve' => $retard->eleve
                        ? $retard->eleve->nom . ' ' .
                            $retard->eleve->prenoms
                        : 'Élève inconnu',
                    'classe' => $retard->classe?->libelle ?? '-',
                    'valeur' => $retard->duree_minutes . ' min',
                    'date' => $retard->date_retard,
                ];
            });

        /*
        |--------------------------------------------------------------------------
        | Fusion et tri des activités
        |--------------------------------------------------------------------------
        */

        $activitesRecentes = $dernieresConduites
            ->concat($dernieresAbsences)
            ->concat($derniersRetards)
            ->sortByDesc('date')
            ->take(8)
            ->values();

        return Inertia::render('Dashboard', [
            'stats' => [
                'etablissements' => Etablissement::count(),
                'eleves' => Eleve::count(),
                'enseignants' => Enseignant::count(),
                'educateurs' => Educateur::count(),
                'classes' => Classe::count(),

                'conduites' => Conduite::count(),
                'absences' => Absence::count(),
                'retards' => Retard::count(),

                'absences_aujourdhui' => Absence::whereDate(
                    'date_absence',
                    $aujourdhui
                )->count(),

                'retards_aujourdhui' => Retard::whereDate(
                    'date_retard',
                    $aujourdhui
                )->count(),
            ],

            'activitesRecentes' => $activitesRecentes,
        ]);
    }
}