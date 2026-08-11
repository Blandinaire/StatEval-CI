<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affectations', function (Blueprint $table) {

            $table->id();

            $table->foreignId('etablissement_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('annee_scolaire_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('classe_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('matiere_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('enseignant_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('coefficient', 4, 2)->default(1);

            $table->integer('volume_horaire')->default(0);

            $table->boolean('actif')->default(true);

            $table->timestamps();

            $table->unique([
                'annee_scolaire_id',
                'classe_id',
                'matiere_id'
            ], 'affectation_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affectations');
    }
};