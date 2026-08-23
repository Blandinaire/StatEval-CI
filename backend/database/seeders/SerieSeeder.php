<?php

namespace Database\Seeders;

use App\Models\Cycle;
use App\Models\Serie;
use Illuminate\Database\Seeder;

class SerieSeeder extends Seeder
{
    public function run(): void
    {
        $college = Cycle::where('code', 'COL')->firstOrFail();
        $lycee = Cycle::where('code', 'LYC')->firstOrFail();

        Serie::firstOrCreate(
            [
                'cycle_id' => $college->id,
                'code' => 'GEN',
            ],
            [
                'libelle' => 'Générale',
                'ordre' => 1,
                'actif' => true,
            ]
        );

        Serie::firstOrCreate(
            [
                'cycle_id' => $lycee->id,
                'code' => 'A',
            ],
            [
                'libelle' => 'Série A',
                'ordre' => 1,
                'actif' => true,
            ]
        );

        Serie::firstOrCreate(
            [
                'cycle_id' => $lycee->id,
                'code' => 'C',
            ],
            [
                'libelle' => 'Série C',
                'ordre' => 2,
                'actif' => true,
            ]
        );

        Serie::firstOrCreate(
            [
                'cycle_id' => $lycee->id,
                'code' => 'D',
            ],
            [
                'libelle' => 'Série D',
                'ordre' => 3,
                'actif' => true,
            ]
        );
    }
}