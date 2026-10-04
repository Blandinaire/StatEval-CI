<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Création automatique des créneaux horaires standards
        |--------------------------------------------------------------------------
        |
        | Organisation retenue :
        |
        | Matin
        | 07h30 - 08h25
        | 08h25 - 09h20
        | 09h20 - 10h15
        | 10h15 - 10h30 : Récréation
        | 10h30 - 11h25
        | 11h25 - 12h20
        |
        | Pause méridienne
        | 12h20 - 13h30
        |
        | Après-midi
        | 13h30 - 14h25
        | 14h25 - 15h20
        | 15h20 - 16h15
        |
        |--------------------------------------------------------------------------
        */

        if (!Schema::hasTable('etablissements')) {
            return;
        }

        if (!Schema::hasTable('creneaux_horaires')) {
            return;
        }

        $creneaux = [
            [
                'libelle' => 'Cours 1',
                'type' => 'cours',
                'heure_debut' => '07:30',
                'heure_fin' => '08:25',
                'ordre' => 1,
            ],
            [
                'libelle' => 'Cours 2',
                'type' => 'cours',
                'heure_debut' => '08:25',
                'heure_fin' => '09:20',
                'ordre' => 2,
            ],
            [
                'libelle' => 'Cours 3',
                'type' => 'cours',
                'heure_debut' => '09:20',
                'heure_fin' => '10:15',
                'ordre' => 3,
            ],
            [
                'libelle' => 'Récréation',
                'type' => 'pause',
                'heure_debut' => '10:15',
                'heure_fin' => '10:30',
                'ordre' => 4,
            ],
            [
                'libelle' => 'Cours 4',
                'type' => 'cours',
                'heure_debut' => '10:30',
                'heure_fin' => '11:25',
                'ordre' => 5,
            ],
            [
                'libelle' => 'Cours 5',
                'type' => 'cours',
                'heure_debut' => '11:25',
                'heure_fin' => '12:20',
                'ordre' => 6,
            ],
            [
                'libelle' => 'Pause méridienne',
                'type' => 'pause',
                'heure_debut' => '12:20',
                'heure_fin' => '13:30',
                'ordre' => 7,
            ],
            [
                'libelle' => 'Cours 6',
                'type' => 'cours',
                'heure_debut' => '13:30',
                'heure_fin' => '14:25',
                'ordre' => 8,
            ],
            [
                'libelle' => 'Cours 7',
                'type' => 'cours',
                'heure_debut' => '14:25',
                'heure_fin' => '15:20',
                'ordre' => 9,
            ],
            [
                'libelle' => 'Cours 8',
                'type' => 'cours',
                'heure_debut' => '15:20',
                'heure_fin' => '16:15',
                'ordre' => 10,
            ],
        ];

        $etablissements = DB::table('etablissements')
            ->select('id')
            ->orderBy('id')
            ->get();

        foreach ($etablissements as $etablissement) {
            foreach ($creneaux as $creneau) {

                $existe = DB::table('creneaux_horaires')
                    ->where('etablissement_id', $etablissement->id)
                    ->where('heure_debut', $creneau['heure_debut'])
                    ->where('heure_fin', $creneau['heure_fin'])
                    ->exists();

                if (!$existe) {
                    DB::table('creneaux_horaires')->insert([
                        'etablissement_id' => $etablissement->id,
                        'libelle' => $creneau['libelle'],
                        'type' => $creneau['type'],
                        'heure_debut' => $creneau['heure_debut'],
                        'heure_fin' => $creneau['heure_fin'],
                        'ordre' => $creneau['ordre'],
                        'actif' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        /*
        |--------------------------------------------------------------------------
        | On ne supprime pas les créneaux automatiquement.
        |--------------------------------------------------------------------------
        |
        | Ces données peuvent avoir été modifiées par l'utilisateur après
        | l'installation. Les supprimer lors d'un rollback serait dangereux.
        |
        */
    }
};