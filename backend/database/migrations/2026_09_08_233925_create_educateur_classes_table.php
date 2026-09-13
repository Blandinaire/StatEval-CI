<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('educateur_classes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->cascadeOnDelete();

            $table->foreignId('annee_scolaire_id')
                ->constrained('annee_scolaires')
                ->cascadeOnDelete();

            $table->foreignId('educateur_id')
                ->constrained('educateurs')
                ->cascadeOnDelete();

            $table->foreignId('classe_id')
                ->constrained('classes')
                ->cascadeOnDelete();

            $table->boolean('actif')->default(true);

            $table->timestamps();

            $table->unique(
                ['annee_scolaire_id', 'educateur_id', 'classe_id'],
                'educateur_classe_unique'
            );

            $table->index([
                'etablissement_id',
                'annee_scolaire_id'
            ]);

            $table->index([
                'educateur_id',
                'annee_scolaire_id'
            ]);

            $table->index([
                'classe_id',
                'annee_scolaire_id'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('educateur_classes');
    }
};
