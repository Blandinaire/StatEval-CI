<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retards', function (Blueprint $table) {

            $table->id();

            // Élève concerné
            $table->foreignId('eleve_id')
                ->constrained()
                ->cascadeOnDelete();

            // Éducateur ayant enregistré le retard
            $table->foreignId('educateur_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Année scolaire
            $table->foreignId('annee_scolaire_id')
                ->constrained()
                ->cascadeOnDelete();

            // Classe de l'élève
            $table->foreignId('classe_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Date du retard
            $table->date('date_retard');

            // Heure prévue d'arrivée
            $table->time('heure_prevue')->nullable();

            // Heure réelle d'arrivée
            $table->time('heure_arrivee')->nullable();

            // Durée du retard en minutes
            $table->unsignedInteger('duree_minutes')
                ->default(0);

            // Motif éventuel
            $table->text('motif')->nullable();

            // Référence du billet de retard
            $table->string('numero_billet')
                ->nullable()
                ->unique();

            // Billet édité ou non
            $table->boolean('billet_edite')
                ->default(false);

            // Date d'édition du billet
            $table->timestamp('billet_edite_le')
                ->nullable();

            // Observation complémentaire
            $table->text('observation')
                ->nullable();

            $table->timestamps();

            // Index pour recherches et statistiques
            $table->index([
                'eleve_id',
                'annee_scolaire_id',
                'date_retard'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retards');
    }
};