<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('emploi_du_temps_lignes', function (Blueprint $table) {
            $table->foreignId('salle_id')
                ->nullable()
                ->after('enseignant_id')
                ->constrained('salles')
                ->nullOnDelete();

            $table->index([
                'emploi_du_temps_id',
                'jour',
                'salle_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('emploi_du_temps_lignes', function (Blueprint $table) {
            $table->dropIndex([
                'emploi_du_temps_lignes_emploi_du_temps_id_jour_salle_id_index',
            ]);

            $table->dropForeign(['salle_id']);
            $table->dropColumn('salle_id');
        });
    }
};