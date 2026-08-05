<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('classes', function (Blueprint $table) {
        $table->id();

        $table->string('libelle');

        $table->foreignId('niveau_id')
              ->constrained()
              ->cascadeOnDelete();

        $table->foreignId('annee_scolaire_id')
              ->constrained()
              ->cascadeOnDelete();

        $table->integer('capacite')->default(60);

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
