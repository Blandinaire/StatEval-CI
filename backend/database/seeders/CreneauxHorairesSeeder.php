<?php

namespace Database\Seeders;

use App\Models\CreneauHoraire;
use App\Models\Etablissement;
use Illuminate\Database\Seeder;

class CreneauxHorairesSeeder extends Seeder
{
    public function run(): void
    {
        $creneaux = [
            [
                'libelle' => '07h30 - 08h25',
                'heure_debut' => '07:30:00',
                'heure_fin' => '08:25:00',
                'ordre' => 1,
            ],
            [
                'libelle' => '08h25 - 09h20',
                'heure_debut' => '08:25:00',
                'heure_fin' => '09:20:00',
                'ordre' => 2,
            ],
            [
                'libelle' => '09h20 - 10h15',
                'heure_debut' => '09:20:00',
                'heure_fin' => '10:15:00',
                'ordre' => 3,
            ],
            [
                'libelle' => '10h30 - 11h25',
                'heure_debut' => '10:30:00',
                'heure_fin' => '11:25:00',
                'ordre' => 4,
            ],
            [
                'libelle' => '11h25 - 12h20',
                'heure_debut' => '11:25:00',
                'heure_fin' => '12:20:00',
                'ordre' => 5,
            ],
            [
                'libelle' => '13h30 - 14h25',
                'heure_debut' => '13:30:00',
                'heure_fin' => '14:25:00',
                'ordre' => 6,
            ],
            [
                'libelle' => '14h25 - 15h20',
                'heure_debut' => '14:25:00',
                'heure_fin' => '15:20:00',
                'ordre' => 7,
            ],
            [
                'libelle' => '15h20 - 16h15',
                'heure_debut' => '15:20:00',
                'heure_fin' => '16:15:00',
                'ordre' => 8,
            ],
        ];

        $etablissements = Etablissement::query()->get();

        foreach ($etablissements as $etablissement) {
            foreach ($creneaux as $creneau) {
                CreneauHoraire::updateOrCreate(
                    [
                        'etablissement_id' => $etablissement->id,
                        'heure_debut' => $creneau['heure_debut'],
                        'heure_fin' => $creneau['heure_fin'],
                    ],
                    [
                        'libelle' => $creneau['libelle'],
                        'ordre' => $creneau['ordre'],
                        'actif' => true,
                    ]
                );
            }
        }
    }
}