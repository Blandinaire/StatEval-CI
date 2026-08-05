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
    Schema::create('maquette_matieres', function (Blueprint $table) {

        $table->id();

        $table->foreignId('maquette_id')
              ->constrained()
              ->cascadeOnDelete();

        $table->foreignId('matiere_id')
              ->constrained()
              ->cascadeOnDelete();

        $table->decimal('coefficient', 4, 2);

        $table->decimal('volume_horaire', 4, 2);

        $table->unsignedInteger('ordre')->default(1);

        $table->boolean('obligatoire')->default(true);

        $table->boolean('prise_en_compte_moyenne')->default(true);

        $table->decimal('note_sur', 5, 2)->default(20);

        $table->boolean('active')->default(true);

        $table->timestamps();

        $table->unique(
            ['maquette_id', 'matiere_id'],
            'uq_maquette_matiere'
        );
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maquette_matieres');
    }
};
