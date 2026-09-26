<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maquettes', function (Blueprint $table) {
            $table->dropForeign(['etablissement_id']);
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign(['maquette_id']);
        });

        Schema::table('maquettes', function (Blueprint $table) {
            $table->dropUnique('uq_maquettes');
            $table->dropColumn('etablissement_id');
        });

        Schema::table('maquettes', function (Blueprint $table) {
            $table->unique(
                [
                    'annee_scolaire_id',
                    'niveau_id',
                    'serie_id',
                    'version',
                ],
                'uq_maquettes_globales'
            );
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->foreign('maquette_id')
                ->references('id')
                ->on('maquettes')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign(['maquette_id']);
        });

        Schema::table('maquettes', function (Blueprint $table) {
            $table->dropUnique('uq_maquettes_globales');
            $table->foreignId('etablissement_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->nullOnDelete();
        });

        Schema::table('maquettes', function (Blueprint $table) {
            $table->unique(
                [
                    'etablissement_id',
                    'annee_scolaire_id',
                    'niveau_id',
                    'serie_id',
                    'version',
                ],
                'uq_maquettes'
            );
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->foreign('maquette_id')
                ->references('id')
                ->on('maquettes')
                ->cascadeOnDelete();
        });
    }
};
