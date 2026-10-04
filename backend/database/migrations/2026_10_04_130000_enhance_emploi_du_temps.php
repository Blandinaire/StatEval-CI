<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('emplois_du_temps', 'ordre_classes')) {
            Schema::table('emplois_du_temps', function (Blueprint $table) {
                $table->json('ordre_classes')->nullable()->after('statut');
            });
        }

        if (!Schema::hasColumn('creneaux_horaires', 'type')) {
            Schema::table('creneaux_horaires', function (Blueprint $table) {
                $table->string('type', 16)->default('cours')->after('libelle');
            });
        }

        $indexes = collect(Schema::getIndexes('creneaux_horaires'))->pluck('name')->all();

        if (!in_array('creneaux_etablissement_id_index', $indexes, true)) {
            Schema::table('creneaux_horaires', function (Blueprint $table) {
                $table->index('etablissement_id', 'creneaux_etablissement_id_index');
            });
        }

        if (in_array('uq_creneaux_etablissement_ordre', $indexes, true)) {
            Schema::table('creneaux_horaires', function (Blueprint $table) {
                $table->dropUnique('uq_creneaux_etablissement_ordre');
            });
        }
    }

    public function down(): void
    {
        Schema::table('creneaux_horaires', function (Blueprint $table) {
            $table->unique(['etablissement_id', 'ordre'], 'uq_creneaux_etablissement_ordre');
            $table->dropIndex('creneaux_etablissement_id_index');
        });

        Schema::table('creneaux_horaires', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        Schema::table('emplois_du_temps', function (Blueprint $table) {
            $table->dropColumn('ordre_classes');
        });
    }
};
