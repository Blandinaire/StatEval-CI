
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Sous MySQL, le champ type devient un VARCHAR flexible.
        // Sous SQLite, le type créé par Laravel est déjà compatible
        // avec les valeurs libres : aucune modification n'est nécessaire.
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement(
            "ALTER TABLE evaluations
             MODIFY type VARCHAR(255) NOT NULL DEFAULT 'Devoir'"
        );
    }

    public function down(): void
    {
        // Restaurer l'ENUM uniquement sous MySQL.
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement(
            "ALTER TABLE evaluations
             MODIFY type ENUM(
                 'Interrogation',
                 'Devoir',
                 'Composition',
                 'Examen',
                 'Autre'
             ) NOT NULL DEFAULT 'Devoir'"
        );
    }
};
