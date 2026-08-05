<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cycle;

class CycleSeeder extends Seeder
{
    public function run(): void
    {
        Cycle::insert([
            [
                'code' => 'COL',
                'libelle' => 'Collège',
                'ordre' => 1,
                'actif' => true,
            ],
            [
                'code' => 'LYC',
                'libelle' => 'Lycée',
                'ordre' => 2,
                'actif' => true,
            ],
        ]);
    }
}