<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('educateurs', function (Blueprint $table) {

            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Rattachement
            |--------------------------------------------------------------------------
            */

            $table->foreignId('etablissement_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Identité
            |--------------------------------------------------------------------------
            */

            $table->string('nom');

            $table->string('prenoms');

            $table->enum('sexe', [
                'Masculin',
                'Féminin',
            ]);

            $table->date('date_naissance')->nullable();

            $table->string('lieu_naissance')->nullable();

            $table->string('nationalite')
                ->default('Ivoirienne');

            /*
            |--------------------------------------------------------------------------
            | Coordonnées
            |--------------------------------------------------------------------------
            */

            $table->string('telephone')->nullable();

            $table->string('email')->nullable();

            $table->string('adresse')->nullable();

            $table->string('photo')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Situation professionnelle
            |--------------------------------------------------------------------------
            */

            $table->string('matricule')->unique();

            $table->enum('type', [
                'Permanent',
                'Contractuel',
            ])->default('Contractuel');

            $table->string('grade')->nullable();

            $table->string('diplome')->nullable();

            $table->date('date_embauche')->nullable();

            $table->date('date_prise_service')->nullable();

            $table->enum('statut', [
                'Actif',
                'Suspendu',
                'Retraité',
            ])->default('Actif');

            $table->boolean('actif')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('educateurs');
    }
};