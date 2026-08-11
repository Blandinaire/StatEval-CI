<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enseignants', function (Blueprint $table) {

            $table->id();

            $table->foreignId('etablissement_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('matiere_principale_id')
                ->nullable()
                ->constrained('matieres')
                ->nullOnDelete();

            $table->foreignId('matiere_secondaire_id')
                ->nullable()
                ->constrained('matieres')
                ->nullOnDelete();

            $table->string('nom');

            $table->string('prenoms');

            $table->enum('sexe', ['Masculin', 'Féminin']);

            $table->date('date_naissance')->nullable();

            $table->string('lieu_naissance')->nullable();

            $table->string('nationalite')->default('Ivoirienne');

            $table->string('telephone')->nullable();

            $table->string('email')->nullable();

            $table->string('adresse')->nullable();

            $table->string('photo')->nullable();

            $table->string('matricule')->unique();

            $table->string('matricule_fonction_publique')->nullable();

            $table->enum('type', [
                'Permanent',
                'Vacataire',
                'Contractuel'
            ])->default('Vacataire');

            $table->string('grade')->nullable();

            $table->string('diplome')->nullable();

            $table->date('date_embauche')->nullable();

            $table->date('date_prise_service')->nullable();

            $table->integer('volume_horaire')->default(0);

            $table->integer('nb_classes_max')->default(10);

            $table->enum('statut', [
                'Actif',
                'Suspendu',
                'Retraité'
            ])->default('Actif');

            $table->boolean('actif')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enseignants');
    }
};