<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fonctions_personnel', function (Blueprint $table) {
            $table->id();

            // Fonction globale définie par le SuperAdmin
            $table->string('libelle', 150)->unique();
            $table->text('description')->nullable();

            // Une fonction peut être désactivée sans être supprimée
            $table->boolean('actif')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fonctions_personnel');
    }
};
