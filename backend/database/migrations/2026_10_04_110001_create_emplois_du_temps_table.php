<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emplois_du_temps', function (Blueprint $table) {
            $table->id();

            $table->foreignId('etablissement_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('annee_scolaire_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('nom', 150);

            $table->enum(
                'statut',
                [
                    'brouillon',
                    'publie',
                ]
            )->default('brouillon');

            $table->timestamps();

            $table->unique(
                [
                    'etablissement_id',
                    'annee_scolaire_id',
                    'nom',
                ],
                'uq_emplois_etablissement_annee_nom'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emplois_du_temps');
    }
};