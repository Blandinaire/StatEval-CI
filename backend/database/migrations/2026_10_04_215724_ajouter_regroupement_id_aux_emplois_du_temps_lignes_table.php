<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('emploi_du_temps_lignes', function (Blueprint $table) {
            $table->uuid('regroupement_id')
                ->nullable()
                ->after('enseignant_id');

            $table->index('regroupement_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emploi_du_temps_lignes', function (Blueprint $table) {
            $table->dropIndex([
                'emploi_du_temps_lignes_regroupement_id_index',
            ]);

            $table->dropColumn('regroupement_id');
        });
    }
};