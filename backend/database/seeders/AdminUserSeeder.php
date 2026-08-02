<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            [
                'email' => 'admin@stateval.ci'
            ],
            [
                'name' => 'Administrateur',
                'password' => Hash::make('Admin@2026'),
            ]
        );

        $admin->assignRole('Administrateur');
    }
}