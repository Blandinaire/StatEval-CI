<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Exécuter la migration.
     */
    public function up(): void
    {
        Schema::table('eleves', function (Blueprint $table) {

            $table->enum('statut_affectation', [
                'AFFECTÉ',
                'NON AFFECTÉ',
            ])
                ->default('NON AFFECTÉ')
                ->after('statut');

        });
    }

    /**
     * Annuler la migration.
     */
    public function down(): void
    {
        Schema::table('eleves', function (Blueprint $table) {

            $table->dropColumn('statut_affectation');

        });
    }
};