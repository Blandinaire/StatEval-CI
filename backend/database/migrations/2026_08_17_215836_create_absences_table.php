<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absences', function (Blueprint $table) {

            $table->id();

            // Élève concerné
            $table->foreignId('eleve_id')
                ->constrained()
                ->cascadeOnDelete();

            // Éducateur ayant enregistré l'absence
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

            // Date de l'absence
            $table->date('date_absence');

            // Heure de début et de fin
            $table->time('heure_debut')->nullable();

            $table->time('heure_fin')->nullable();

            // Nombre d'heures d'absence
            $table->decimal('duree_heures', 5, 2)
                ->default(0);

            // Absence justifiée ou non
            $table->boolean('justifiee')
                ->default(false);

            // Motif éventuel
            $table->text('motif')->nullable();

            // Référence du billet d'absence
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

            // Index utiles pour les recherches et statistiques
            $table->index([
                'eleve_id',
                'annee_scolaire_id',
                'date_absence'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};