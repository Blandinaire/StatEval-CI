<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conduites', function (Blueprint $table) {

            $table->id();

            // Élève concerné
            $table->foreignId('eleve_id')
                ->constrained()
                ->cascadeOnDelete();

            // Éducateur ayant saisi la note
            $table->foreignId('educateur_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Année scolaire
            $table->foreignId('annee_scolaire_id')
                ->constrained()
                ->cascadeOnDelete();

            // Classe de l'élève au moment de la saisie
            $table->foreignId('classe_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Évaluation ou période concernée
            $table->foreignId('evaluation_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Note de conduite
            $table->decimal('note', 5, 2);

            // Observation éventuelle
            $table->text('observation')->nullable();

            $table->timestamps();

            // Une seule note de conduite par élève et par évaluation
            $table->unique(
                ['eleve_id', 'evaluation_id'],
                'conduites_eleve_evaluation_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conduites');
    }
};