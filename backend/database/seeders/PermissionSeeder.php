<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | PERMISSIONS
        |--------------------------------------------------------------------------
        */

        $permissions = [

            // Tableau de bord
            'dashboard.view',

            // Établissements
            'etablissements.view',
            'etablissements.create',
            'etablissements.edit',
            'etablissements.delete',

            // Années scolaires
            'annees.view',
            'annees.create',
            'annees.edit',
            'annees.delete',

            // Cycles
            'cycles.view',
            'cycles.create',
            'cycles.edit',
            'cycles.delete',

            // Niveaux
            'niveaux.view',
            'niveaux.create',
            'niveaux.edit',
            'niveaux.delete',

            // Classes
            'classes.view',
            'classes.create',
            'classes.edit',
            'classes.delete',

            // Matières
            'matieres.view',
            'matieres.create',
            'matieres.edit',
            'matieres.delete',

            // Maquettes pédagogiques
            'maquettes.view',
            'maquettes.create',
            'maquettes.edit',
            'maquettes.delete',

            // Enseignants
            'enseignants.view',
            'enseignants.create',
            'enseignants.edit',
            'enseignants.delete',

            // Éducateurs
            'educateurs.view',
            'educateurs.create',
            'educateurs.edit',
            'educateurs.delete',

            // Affectations
            'affectations.view',
            'affectations.create',
            'affectations.edit',
            'affectations.delete',

            // Utilisateurs
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Évaluations
            'evaluations.view',
            'evaluations.create',
            'evaluations.edit',
            'evaluations.delete',

            // Notes
            'notes.view',
            'notes.create',
            'notes.edit',
            'notes.delete',

            // Résultats
            'resultats.view',
            'resultats.export',

            // Statistiques
            'statistiques.view',
            'statistiques.export',

            // Paramètres
            'settings.view',
            'settings.edit',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | RÔLES
        |--------------------------------------------------------------------------
        */

        $roles = [
            'SuperAdmin',
            'Administrateur',
            'Direction',
            'Professeur',
            'Educateur',
            'Élève',
            'Parent',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | SUPER ADMINISTRATEUR
        |--------------------------------------------------------------------------
        */

        Role::findByName('SuperAdmin')->syncPermissions(
            Permission::all()
        );

        /*
        |--------------------------------------------------------------------------
        | ADMINISTRATEUR
        |--------------------------------------------------------------------------
        */

        Role::findByName('Administrateur')->syncPermissions([
            'dashboard.view',

            'etablissements.view',
            'etablissements.edit',

            'annees.view',
            'annees.create',
            'annees.edit',

            'cycles.view',
            'cycles.create',
            'cycles.edit',

            'niveaux.view',
            'niveaux.create',
            'niveaux.edit',

            'classes.view',
            'classes.create',
            'classes.edit',

            'matieres.view',
            'matieres.create',
            'matieres.edit',

            'maquettes.view',
            'maquettes.create',
            'maquettes.edit',

            'enseignants.view',
            'enseignants.create',
            'enseignants.edit',

            'educateurs.view',
            'educateurs.create',
            'educateurs.edit',

            'affectations.view',
            'affectations.create',
            'affectations.edit',

            'users.view',
            'users.create',
            'users.edit',

            'evaluations.view',
            'notes.view',
            'notes.edit',

            'resultats.view',
            'resultats.export',

            'statistiques.view',
            'statistiques.export',
        ]);

        /*
        |--------------------------------------------------------------------------
        | DIRECTION
        |--------------------------------------------------------------------------
        */

        Role::findByName('Direction')->syncPermissions([
            'dashboard.view',

            'annees.view',
            'cycles.view',
            'niveaux.view',
            'classes.view',
            'matieres.view',
            'maquettes.view',

            'enseignants.view',
            'educateurs.view',
            'affectations.view',

            'evaluations.view',
            'evaluations.create',
            'evaluations.edit',

            'notes.view',
            'notes.create',
            'notes.edit',

            'resultats.view',
            'resultats.export',

            'statistiques.view',
            'statistiques.export',
        ]);

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR
        |--------------------------------------------------------------------------
        */

        Role::findByName('Professeur')->syncPermissions([
            'dashboard.view',

            'classes.view',
            'matieres.view',

            'evaluations.view',
            'evaluations.create',
            'evaluations.edit',

            'notes.view',
            'notes.create',
            'notes.edit',

            'resultats.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | EDUCATEUR
        |--------------------------------------------------------------------------
        */

        Role::findByName('Educateur')->syncPermissions([
            'dashboard.view',

            'classes.view',

            'enseignants.view',
            'educateurs.view',

            'evaluations.view',

            'notes.view',

            'resultats.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | ÉLÈVE
        |--------------------------------------------------------------------------
        */

        Role::findByName('Élève')->syncPermissions([
            'dashboard.view',
            'classes.view',
            'matieres.view',
            'notes.view',
            'resultats.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | PARENT
        |--------------------------------------------------------------------------
        */

        Role::findByName('Parent')->syncPermissions([
            'dashboard.view',
            'notes.view',
            'resultats.view',
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}