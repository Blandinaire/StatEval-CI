<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('annee_scolaires', function (Blueprint $table) {
            $table->string('mode_periodes')
                ->default('trimestriel');
        });

        Schema::create('periodes_scolaires', function (Blueprint $table) {
            $table->id();

            $table->foreignId('annee_scolaire_id')
                ->constrained('annee_scolaires')
                ->cascadeOnDelete();

            $table->string('libelle', 50);
            $table->unsignedTinyInteger('ordre');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->boolean('actif')->default(true);

            $table->timestamps();

            $table->unique(
                ['annee_scolaire_id', 'ordre'],
                'periodes_annee_ordre_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('periodes_scolaires');

        Schema::table('annee_scolaires', function (Blueprint $table) {
            $table->dropColumn('mode_periodes');
        });
    }
};
