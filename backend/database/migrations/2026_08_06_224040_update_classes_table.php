<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {

            $table->foreignId('etablissement_id')
                ->after('id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('cycle_id')
                ->after('annee_scolaire_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('serie_id')
                ->nullable()
                ->after('niveau_id')
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('maquette_id')
                ->after('serie_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->boolean('active')
                ->default(true)
                ->after('capacite');

        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {

            $table->dropForeign(['etablissement_id']);
            $table->dropForeign(['cycle_id']);
            $table->dropForeign(['serie_id']);
            $table->dropForeign(['maquette_id']);

            $table->dropColumn([
                'etablissement_id',
                'cycle_id',
                'serie_id',
                'maquette_id',
                'active'
            ]);

        });
    }
};