<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emploi_du_temps_lignes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('emploi_du_temps_id')
                ->constrained('emplois_du_temps')
                ->cascadeOnDelete();

            $table->foreignId('creneau_horaire_id')
                ->constrained('creneaux_horaires')
                ->restrictOnDelete();

            $table->foreignId('classe_id')
                ->constrained('classes')
                ->cascadeOnDelete();

            $table->foreignId('matiere_id')
                ->constrained('matieres')
                ->cascadeOnDelete();

            $table->foreignId('enseignant_id')
                ->nullable()
                ->constrained('enseignants')
                ->nullOnDelete();

            $table->string('jour', 15);

            $table->string('salle', 80)
                ->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Une seule séance pour une classe sur un créneau donné
            |--------------------------------------------------------------------------
            */

            $table->unique(
                [
                    'emploi_du_temps_id',
                    'jour',
                    'creneau_horaire_id',
                    'classe_id',
                ],
                'uq_edt_ligne_classe_creneau'
            );

            /*
            |--------------------------------------------------------------------------
            | Détection rapide des conflits enseignants
            |--------------------------------------------------------------------------
            */

            $table->index(
                [
                    'emploi_du_temps_id',
                    'jour',
                    'creneau_horaire_id',
                    'enseignant_id',
                ],
                'idx_edt_enseignant_conflit'
            );

            /*
            |--------------------------------------------------------------------------
            | Détection rapide des conflits de salle
            |--------------------------------------------------------------------------
            */

            $table->index(
                [
                    'emploi_du_temps_id',
                    'jour',
                    'creneau_horaire_id',
                    'salle',
                ],
                'idx_edt_salle_conflit'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emploi_du_temps_lignes');
    }
};