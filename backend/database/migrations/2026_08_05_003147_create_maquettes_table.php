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
    Schema::create('maquettes', function (Blueprint $table) {

        $table->id();

        // Établissement
        $table->foreignId('etablissement_id')
              ->constrained()
              ->cascadeOnDelete();

        // Année scolaire
        $table->foreignId('annee_scolaire_id')
              ->constrained()
              ->cascadeOnDelete();

        // Référentiels pédagogiques
        $table->foreignId('cycle_id')
              ->constrained()
              ->cascadeOnDelete();

        $table->foreignId('niveau_id')
              ->constrained()
              ->cascadeOnDelete();

        // Nullable pour les niveaux sans série (6e, 5e, 4e, 3e...)
        $table->foreignId('serie_id')
              ->nullable()
              ->constrained()
              ->nullOnDelete();

        // Informations générales
        $table->string('libelle');

        $table->unsignedInteger('version')->default(1);

        $table->boolean('active')->default(true);

        $table->timestamps();

        // Une seule maquette par combinaison
        $table->unique(
    [
        'etablissement_id',
        'annee_scolaire_id',
        'niveau_id',
        'serie_id',
        'version'
    ],
    'uq_maquettes'
);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maquettes');
    }
};
