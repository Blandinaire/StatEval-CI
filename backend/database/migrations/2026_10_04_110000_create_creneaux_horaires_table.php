<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creneaux_horaires', function (Blueprint $table) {
            $table->id();

            $table->foreignId('etablissement_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('libelle', 100);

            $table->time('heure_debut');

            $table->time('heure_fin');

            $table->unsignedSmallInteger('ordre')
                ->default(1);

            $table->boolean('actif')
                ->default(true);

            $table->timestamps();

            $table->unique(
                [
                    'etablissement_id',
                    'ordre',
                ],
                'uq_creneaux_etablissement_ordre'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creneaux_horaires');
    }
};