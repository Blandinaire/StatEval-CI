<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Affectation;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Conduite;
use App\Models\Educateur;
use App\Models\Eleve;
use App\Models\Enseignant;
use App\Models\Etablissement;
use App\Models\Retard;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Vérifie si l'utilisateur est SuperAdmin.
     */
    private function estSuperAdmin($user): bool
    {
        return $user->hasRole('SuperAdmin');
    }

    /**
     * Vérifie si l'utilisateur est professeur.
     */
    private function estProfesseur($user): bool
    {
        return $user->hasRole('Professeur');
    }

    /**
     * Retourne les classes actuellement affectées
     * au professeur.
     */
    private function classesDuProfesseur($user)
    {
        abort_unless(
            $user->enseignant_id,
            403,
            'Votre compte professeur n’est pas correctement rattaché à un enseignant.'
        );

        return Affectation::query()
            ->where(
                'enseignant_id',
                $user->enseignant_id
            )
            ->where(
                'annee_scolaire_id',
                AnneeScolaire::activeId()
            )
            ->where('actif', true)
            ->pluck('classe_id')
            ->unique()
            ->values();
    }

    /**
     * Afficher le tableau de bord.
     */
    public function index()
    {
        $user = Auth::user();

        $aujourdhui =
            Carbon::today();

        $estSuperAdmin =
            $this->estSuperAdmin($user);

        $estProfesseur =
            $this->estProfesseur($user);

        $etablissementId =
            $user->etablissement_id;

        /*
        |--------------------------------------------------------------------------
        | CLASSES DU PROFESSEUR
        |--------------------------------------------------------------------------
        */

        $classesProfesseur =
            collect();

        if ($estProfesseur) {

            $classesProfesseur =
                $this->classesDuProfesseur($user);
        }

        /*
        |--------------------------------------------------------------------------
        | ACTIVITÉS RÉCENTES : CONDUITES
        |--------------------------------------------------------------------------
        */

        $queryConduites =
            Conduite::with([
                'eleve',
                'educateur',
                'classe',
            ]);

        if ($estProfesseur) {

            $queryConduites->whereIn(
                'classe_id',
                $classesProfesseur
            );
        } elseif (!$estSuperAdmin) {

            $queryConduites->whereHas(
                'eleve',
                function ($query) use (
                    $etablissementId
                ) {

                    $query->where(
                        'etablissement_id',
                        $etablissementId
                    );
                }
            );
        }

        $dernieresConduites =
            $queryConduites
            ->latest()
            ->take(5)
            ->get()
            ->map(
                function ($conduite) {

                    return [

                        'id' =>
                        $conduite->id,

                        'type' =>
                        'conduite',

                        'titre' =>
                        'Note de conduite',

                        'eleve' =>
                        $conduite->eleve
                            ? $conduite->eleve->nom
                            . ' ' .
                            $conduite->eleve->prenoms
                            : 'Élève inconnu',

                        'classe' =>
                        $conduite
                            ->classe
                            ?->libelle
                            ?? '-',

                        'valeur' =>
                        number_format(
                            (float)
                            $conduite->note,
                            2,
                            ',',
                            ' '
                        )
                            . '/20',

                        'date' =>
                        $conduite
                            ->created_at,
                    ];
                }
            );

        /*
        |--------------------------------------------------------------------------
        | ABSENCES
        |--------------------------------------------------------------------------
        */

        $queryAbsences =
            Absence::with([
                'eleve',
                'educateur',
                'classe',
            ]);

        if ($estProfesseur) {

            $queryAbsences->whereIn(
                'classe_id',
                $classesProfesseur
            );
        } elseif (!$estSuperAdmin) {

            $queryAbsences->whereHas(
                'eleve',
                function ($query) use (
                    $etablissementId
                ) {

                    $query->where(
                        'etablissement_id',
                        $etablissementId
                    );
                }
            );
        }

        $dernieresAbsences =
            $queryAbsences
            ->latest('date_absence')
            ->latest('id')
            ->take(5)
            ->get()
            ->map(
                function ($absence) {

                    return [

                        'id' =>
                        $absence->id,

                        'type' =>
                        'absence',

                        'titre' =>
                        'Absence enregistrée',

                        'eleve' =>
                        $absence->eleve
                            ? $absence->eleve->nom
                            . ' ' .
                            $absence->eleve->prenoms
                            : 'Élève inconnu',

                        'classe' =>
                        $absence
                            ->classe
                            ?->libelle
                            ?? '-',

                        'valeur' =>
                        $absence->justifiee
                            ? 'Justifiée'
                            : 'Non justifiée',

                        'date' =>
                        $absence->date_absence,
                    ];
                }
            );

        /*
        |--------------------------------------------------------------------------
        | RETARDS
        |--------------------------------------------------------------------------
        */

        $queryRetards =
            Retard::with([
                'eleve',
                'educateur',
                'classe',
            ]);

        if ($estProfesseur) {

            $queryRetards->whereIn(
                'classe_id',
                $classesProfesseur
            );
        } elseif (!$estSuperAdmin) {

            $queryRetards->whereHas(
                'eleve',
                function ($query) use (
                    $etablissementId
                ) {

                    $query->where(
                        'etablissement_id',
                        $etablissementId
                    );
                }
            );
        }

        $derniersRetards =
            $queryRetards
            ->latest('date_retard')
            ->latest('id')
            ->take(5)
            ->get()
            ->map(
                function ($retard) {

                    return [

                        'id' =>
                        $retard->id,

                        'type' =>
                        'retard',

                        'titre' =>
                        'Retard enregistré',

                        'eleve' =>
                        $retard->eleve
                            ? $retard->eleve->nom
                            . ' ' .
                            $retard->eleve->prenoms
                            : 'Élève inconnu',

                        'classe' =>
                        $retard
                            ->classe
                            ?->libelle
                            ?? '-',

                        'valeur' =>
                        $retard->duree_minutes
                            . ' min',

                        'date' =>
                        $retard->date_retard,
                    ];
                }
            );

        /*
        |--------------------------------------------------------------------------
        | FUSION DES ACTIVITÉS
        |--------------------------------------------------------------------------
        */

        $activitesRecentes =
            $dernieresConduites
            ->concat(
                $dernieresAbsences
            )
            ->concat(
                $derniersRetards
            )
            ->sortByDesc('date')
            ->take(8)
            ->values();

        /*
        |--------------------------------------------------------------------------
        | REQUÊTES STATISTIQUES
        |--------------------------------------------------------------------------
        */

        $elevesQuery =
            Eleve::query();

        $enseignantsQuery =
            Enseignant::query();

        $educateursQuery =
            Educateur::query();

        $classesQuery =
            Classe::query();

        $conduitesQuery =
            Conduite::query();

        $absencesQuery =
            Absence::query();

        $retardsQuery =
            Retard::query();

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR
        |--------------------------------------------------------------------------
        |
        | IMPORTANT :
        | On ne filtre PAS simplement par établissement.
        |
        | On filtre directement par ses classes.
        |
        */

        if ($estProfesseur) {

            /*
            |--------------------------------------------------------------------------
            | ÉLÈVES
            |--------------------------------------------------------------------------
            */

            $elevesQuery->whereIn(
                'classe_id',
                $classesProfesseur
            );

            /*
            |--------------------------------------------------------------------------
            | CLASSES
            |--------------------------------------------------------------------------
            */

            $classesQuery->whereIn(
                'id',
                $classesProfesseur
            );

            /*
            |--------------------------------------------------------------------------
            | CONDUITES
            |--------------------------------------------------------------------------
            */

            $conduitesQuery->whereIn(
                'classe_id',
                $classesProfesseur
            );

            /*
            |--------------------------------------------------------------------------
            | ABSENCES
            |--------------------------------------------------------------------------
            */

            $absencesQuery->whereIn(
                'classe_id',
                $classesProfesseur
            );

            /*
            |--------------------------------------------------------------------------
            | RETARDS
            |--------------------------------------------------------------------------
            */

            $retardsQuery->whereIn(
                'classe_id',
                $classesProfesseur
            );

            /*
            |--------------------------------------------------------------------------
            | ENSEIGNANTS
            |--------------------------------------------------------------------------
            |
            | Un professeur n'a pas à connaître le nombre
            | d'enseignants de l'établissement.
            |
            */

            $enseignantsQuery->where(
                'id',
                $user->enseignant_id
            );

            /*
            |--------------------------------------------------------------------------
            | ÉDUCATEURS
            |--------------------------------------------------------------------------
            |
            | On ne lui expose pas les autres éducateurs.
            |
            */

            $educateursQuery->whereRaw(
                '1 = 0'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | AUTRES UTILISATEURS
        |--------------------------------------------------------------------------
        */ elseif (!$estSuperAdmin) {

            /*
            |--------------------------------------------------------------------------
            | ÉLÈVES
            |--------------------------------------------------------------------------
            */

            $elevesQuery->where(
                'etablissement_id',
                $etablissementId
            );

            /*
            |--------------------------------------------------------------------------
            | ENSEIGNANTS
            |--------------------------------------------------------------------------
            */

            $enseignantsQuery->where(
                'etablissement_id',
                $etablissementId
            );

            /*
            |--------------------------------------------------------------------------
            | ÉDUCATEURS
            |--------------------------------------------------------------------------
            */

            $educateursQuery->where(
                'etablissement_id',
                $etablissementId
            );

            /*
            |--------------------------------------------------------------------------
            | CLASSES
            |--------------------------------------------------------------------------
            */

            $classesQuery->where(
                'etablissement_id',
                $etablissementId
            );

            /*
            |--------------------------------------------------------------------------
            | CONDUITES
            |--------------------------------------------------------------------------
            */

            $conduitesQuery->whereHas(
                'eleve',
                function ($query) use (
                    $etablissementId
                ) {

                    $query->where(
                        'etablissement_id',
                        $etablissementId
                    );
                }
            );

            /*
            |--------------------------------------------------------------------------
            | ABSENCES
            |--------------------------------------------------------------------------
            */

            $absencesQuery->whereHas(
                'eleve',
                function ($query) use (
                    $etablissementId
                ) {

                    $query->where(
                        'etablissement_id',
                        $etablissementId
                    );
                }
            );

            /*
            |--------------------------------------------------------------------------
            | RETARDS
            |--------------------------------------------------------------------------
            */

            $retardsQuery->whereHas(
                'eleve',
                function ($query) use (
                    $etablissementId
                ) {

                    $query->where(
                        'etablissement_id',
                        $etablissementId
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | NOMBRE D'ÉTABLISSEMENTS
        |--------------------------------------------------------------------------
        */

        $nombreEtablissements =
            $estSuperAdmin
            ? Etablissement::count()
            : (
                $etablissementId
                ? 1
                : 0
            );

        /*
        |--------------------------------------------------------------------------
        | DASHBOARD
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Dashboard',
            [

                'stats' => [

                    /*
                    |--------------------------------------------------------------------------
                    | ÉTABLISSEMENTS
                    |--------------------------------------------------------------------------
                    */

                    'etablissements' =>
                    $nombreEtablissements,

                    /*
                    |--------------------------------------------------------------------------
                    | ÉLÈVES
                    |--------------------------------------------------------------------------
                    */

                    'eleves' =>
                    $elevesQuery->count(),

                    /*
                    |--------------------------------------------------------------------------
                    | ENSEIGNANTS
                    |--------------------------------------------------------------------------
                    */

                    'enseignants' =>
                    $enseignantsQuery->count(),

                    /*
                    |--------------------------------------------------------------------------
                    | ÉDUCATEURS
                    |--------------------------------------------------------------------------
                    */

                    'educateurs' =>
                    $educateursQuery->count(),

                    /*
                    |--------------------------------------------------------------------------
                    | CLASSES
                    |--------------------------------------------------------------------------
                    */

                    'classes' =>
                    $classesQuery->count(),

                    /*
                    |--------------------------------------------------------------------------
                    | CONDUITES
                    |--------------------------------------------------------------------------
                    */

                    'conduites' =>
                    $conduitesQuery->count(),

                    /*
                    |--------------------------------------------------------------------------
                    | ABSENCES
                    |--------------------------------------------------------------------------
                    */

                    'absences' =>
                    $absencesQuery->count(),

                    /*
                    |--------------------------------------------------------------------------
                    | RETARDS
                    |--------------------------------------------------------------------------
                    */

                    'retards' =>
                    $retardsQuery->count(),

                    /*
                    |--------------------------------------------------------------------------
                    | ABSENCES AUJOURD'HUI
                    |--------------------------------------------------------------------------
                    */

                    'absences_aujourdhui' =>
                    $absencesQuery
                        ->whereDate(
                            'date_absence',
                            $aujourdhui
                        )
                        ->count(),

                    /*
                    |--------------------------------------------------------------------------
                    | RETARDS AUJOURD'HUI
                    |--------------------------------------------------------------------------
                    */

                    'retards_aujourdhui' =>
                    $retardsQuery
                        ->whereDate(
                            'date_retard',
                            $aujourdhui
                        )
                        ->count(),
                ],

                /*
                |--------------------------------------------------------------------------
                | ACTIVITÉS RÉCENTES
                |--------------------------------------------------------------------------
                */

                'activitesRecentes' =>
                $activitesRecentes,
            ]
        );
    }
}
