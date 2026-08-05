<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etablissements', function (Blueprint $table) {

            $table->id();

            // Informations générales
            $table->string('nom');
            $table->string('sigle')->nullable();
            $table->string('code')->unique()->nullable();

            // Type d'établissement
            $table->enum('type', [
                'Public',
                'Privé',
                'Confessionnel'
            ])->default('Privé');

            // Localisation
            $table->string('adresse')->nullable();
            $table->string('ville');
            $table->string('region')->nullable();
            $table->string('inspection')->nullable();
            $table->string('academie')->nullable();

            // Contacts
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();

            // Responsable
            $table->string('directeur')->nullable();

            // Logo
            $table->string('logo')->nullable();

            // Divers
            $table->string('devise')->nullable();
            $table->boolean('actif')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etablissements');
    }
};