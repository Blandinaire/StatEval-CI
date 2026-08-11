<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {

            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Contexte scolaire
            |--------------------------------------------------------------------------
            */

            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->cascadeOnDelete();

            $table->foreignId('annee_scolaire_id')
                ->constrained('annee_scolaires')
                ->cascadeOnDelete();

            $table->foreignId('classe_id')
                ->constrained('classes')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Matière et enseignant
            |--------------------------------------------------------------------------
            */

            $table->foreignId('matiere_id')
                ->constrained('matieres')
                ->cascadeOnDelete();

            $table->foreignId('enseignant_id')
                ->constrained('enseignants')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Identification de l'évaluation
            |--------------------------------------------------------------------------
            */

            $table->string('libelle');

            $table->enum('type', [
                'Interrogation',
                'Devoir',
                'Composition',
                'Examen',
                'Autre',
            ])->default('Devoir');

            $table->unsignedInteger('numero')->nullable();

            $table->date('date_evaluation');

            /*
            |--------------------------------------------------------------------------
            | Paramètres de notation
            |--------------------------------------------------------------------------
            */

            $table->decimal('bareme', 5, 2)
                ->default(20);

            $table->decimal('coefficient', 5, 2)
                ->default(1);

            /*
            |--------------------------------------------------------------------------
            | Période scolaire
            |--------------------------------------------------------------------------
            */

            $table->enum('periode', [
                'Trimestre 1',
                'Trimestre 2',
                'Trimestre 3',
            ])->default('Trimestre 1');

            /*
            |--------------------------------------------------------------------------
            | Statut
            |--------------------------------------------------------------------------
            */

            $table->boolean('active')
                ->default(true);

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};