<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | RÔLES SYSTÈME
        |--------------------------------------------------------------------------
        |
        | Le rôle "Direction" est volontairement générique.
        | La fonction réelle de l'utilisateur est stockée séparément
        | dans users.fonction :
        |
        | Directeur des Études
        | Proviseur
        | Censeur
        | Responsable pédagogique
        | Directeur pédagogique
        | etc.
        |
        */

        $roles = [
            'SuperAdmin',
            'Administrateur',
            'Direction',
            'Educateur',
            'Professeur',
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

            // Utilisateurs
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Enseignants
            'enseignants.view',
            'enseignants.create',
            'enseignants.edit',
            'enseignants.delete',
            'enseignants.import',

            // Élèves
            'eleves.view',
            'eleves.create',
            'eleves.edit',
            'eleves.delete',
            'eleves.import',

            // Parents
            'parents.view',
            'parents.create',
            'parents.edit',
            'parents.delete',

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

            // Statistiques
            'statistiques.view',
            'statistiques.export',

            // Absences
            'absences.view',
            'absences.create',
            'absences.edit',
            'absences.delete',

            // Discipline
            'discipline.view',
            'discipline.create',
            'discipline.edit',
            'discipline.delete',

            // Communication
            'communications.view',
            'communications.create',
            'communications.delete',

            // Configuration
            'settings.view',
            'settings.edit',

            // Gestion des rôles
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        $superAdmin = Role::findByName(
            'SuperAdmin',
            'web'
        );

        $superAdmin->syncPermissions(
            Permission::all()
        );

        /*
        |--------------------------------------------------------------------------
        | ADMINISTRATEUR
        |--------------------------------------------------------------------------
        */

        Role::findByName('Administrateur', 'web')
            ->syncPermissions([
                'dashboard.view',

                'etablissements.view',
                'etablissements.edit',

                'users.view',
                'users.create',
                'users.edit',

                'enseignants.view',
                'enseignants.create',
                'enseignants.edit',
                'enseignants.delete',
                'enseignants.import',

                'eleves.view',
                'eleves.create',
                'eleves.edit',
                'eleves.delete',
                'eleves.import',

                'parents.view',
                'parents.create',
                'parents.edit',

                'classes.view',
                'classes.create',
                'classes.edit',

                'matieres.view',
                'matieres.create',
                'matieres.edit',

                'evaluations.view',
                'notes.view',
                'notes.create',
                'notes.edit',

                'resultats.view',

                'statistiques.view',
                'statistiques.export',

                'absences.view',
                'absences.create',
                'absences.edit',

                'discipline.view',
                'discipline.create',
                'discipline.edit',

                'communications.view',
                'communications.create',

                'settings.view',
            ]);

        /*
        |--------------------------------------------------------------------------
        | DIRECTION
        |--------------------------------------------------------------------------
        */

        Role::findByName('Direction', 'web')
            ->syncPermissions([
                'dashboard.view',

                'etablissements.view',

                'users.view',

                'enseignants.view',
                'enseignants.create',
                'enseignants.edit',
                'enseignants.import',

                'eleves.view',
                'eleves.create',
                'eleves.edit',

                'parents.view',

                'classes.view',
                'classes.create',
                'classes.edit',

                'matieres.view',

                'evaluations.view',
                'evaluations.create',
                'evaluations.edit',

                'notes.view',
                'notes.create',
                'notes.edit',

                'resultats.view',

                'statistiques.view',
                'statistiques.export',

                'absences.view',

                'discipline.view',
                'discipline.create',
                'discipline.edit',

                'communications.view',
                'communications.create',
            ]);

        /*
        |--------------------------------------------------------------------------
        | EDUCATEUR
        |--------------------------------------------------------------------------
        */

        Role::findByName('Educateur', 'web')
            ->syncPermissions([
                'dashboard.view',

                'eleves.view',
                'eleves.edit',

                'classes.view',

                'parents.view',

                'absences.view',
                'absences.create',
                'absences.edit',

                'discipline.view',
                'discipline.create',
                'discipline.edit',

                'communications.view',
                'communications.create',

                'resultats.view',
            ]);

        /*
        |--------------------------------------------------------------------------
        | PROFESSEUR
        |--------------------------------------------------------------------------
        */

        Role::findByName('Professeur', 'web')
            ->syncPermissions([
                'dashboard.view',

                'eleves.view',

                'classes.view',

                'matieres.view',

                'evaluations.view',
                'evaluations.create',
                'evaluations.edit',

                'notes.view',
                'notes.create',
                'notes.edit',

                'resultats.view',

                'statistiques.view',

                'absences.view',

                'communications.view',
            ]);

        /*
        |--------------------------------------------------------------------------
        | ÉLÈVE
        |--------------------------------------------------------------------------
        */

        Role::findByName('Élève', 'web')
            ->syncPermissions([
                'dashboard.view',

                'eleves.view',

                'classes.view',

                'notes.view',

                'resultats.view',

                'absences.view',

                'communications.view',
            ]);

        /*
        |--------------------------------------------------------------------------
        | PARENT
        |--------------------------------------------------------------------------
        */

        Role::findByName('Parent', 'web')
            ->syncPermissions([
                'dashboard.view',

                'eleves.view',

                'notes.view',

                'resultats.view',

                'absences.view',

                'communications.view',
            ]);
    }
}