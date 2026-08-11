<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eleves', function (Blueprint $table) {

            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Établissement et scolarité
            |--------------------------------------------------------------------------
            */

            $table->foreignId('etablissement_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('annee_scolaire_id')
                ->constrained('annee_scolaires')
                ->cascadeOnDelete();

            $table->foreignId('classe_id')
                ->constrained('classes')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Identification de l'élève
            |--------------------------------------------------------------------------
            */

            $table->string('matricule')->unique();

            $table->string('nom');

            $table->string('prenoms');

            $table->enum('sexe', [
                'Masculin',
                'Féminin'
            ]);

            $table->date('date_naissance')->nullable();

            $table->string('lieu_naissance')->nullable();

            $table->string('nationalite')
                ->default('Ivoirienne');

            $table->string('photo')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Informations complémentaires
            |--------------------------------------------------------------------------
            */

            $table->string('adresse')->nullable();

            $table->string('telephone')->nullable();

            $table->string('email')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Situation scolaire
            |--------------------------------------------------------------------------
            */

            $table->boolean('redoublant')
                ->default(false);

            $table->boolean('boursier')
                ->default(false);

            $table->enum('regime', [
                'Externe',
                'Demi-pensionnaire',
                'Interne'
            ])->default('Externe');

            $table->enum('statut', [
                'Actif',
                'Transféré',
                'Exclu',
                'Abandonné',
                'Diplômé'
            ])->default('Actif');

            /*
            |--------------------------------------------------------------------------
            | Responsable légal
            |--------------------------------------------------------------------------
            */

            $table->string('responsable_nom')->nullable();

            $table->string('responsable_prenoms')->nullable();

            $table->string('responsable_telephone')->nullable();

            $table->string('responsable_email')->nullable();

            $table->string('responsable_profession')->nullable();

            $table->string('responsable_adresse')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Informations médicales
            |--------------------------------------------------------------------------
            */

            $table->string('groupe_sanguin')->nullable();

            $table->text('allergies')->nullable();

            $table->text('observations_medicales')->nullable();

            $table->string('contact_urgence_nom')->nullable();

            $table->string('contact_urgence_telephone')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Statut système
            |--------------------------------------------------------------------------
            */

            $table->boolean('actif')->default(true);

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eleves');
    }
};