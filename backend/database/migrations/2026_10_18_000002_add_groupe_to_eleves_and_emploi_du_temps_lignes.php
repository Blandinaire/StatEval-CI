<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('eleves', function (Blueprint $table) {
            $table->string('groupe', 50)->nullable()->after('classe_id');
        });

        Schema::table('emploi_du_temps_lignes', function (Blueprint $table) {
            $table->dropUnique('uq_edt_ligne_classe_creneau');
            $table->string('groupe', 50)->default('')->after('classe_id');
            $table->unique(
                ['emploi_du_temps_id', 'jour', 'creneau_horaire_id', 'classe_id', 'groupe'],
                'uq_edt_classe_groupe_creneau'
            );
        });
    }

    public function down(): void
    {
        Schema::table('emploi_du_temps_lignes', function (Blueprint $table) {
            $table->dropUnique('uq_edt_classe_groupe_creneau');
            $table->dropColumn('groupe');
            $table->unique(
                ['emploi_du_temps_id', 'jour', 'creneau_horaire_id', 'classe_id'],
                'uq_edt_ligne_classe_creneau'
            );
        });

        Schema::table('eleves', function (Blueprint $table) {
            $table->dropColumn('groupe');
        });
    }
};
