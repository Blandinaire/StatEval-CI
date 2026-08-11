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
        Schema::create('notes', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Relations
            |--------------------------------------------------------------------------
            */

            $table->foreignId('evaluation_id')
                ->constrained('evaluations')
                ->cascadeOnDelete();

            $table->foreignId('eleve_id')
                ->constrained('eleves')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Note
            |--------------------------------------------------------------------------
            */

            $table->decimal('note', 5, 2)
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Gestion des absences
            |--------------------------------------------------------------------------
            */

            $table->boolean('absent')
                ->default(false);

            /*
            |--------------------------------------------------------------------------
            | Informations complémentaires
            |--------------------------------------------------------------------------
            */

            $table->string('appreciation')
                ->nullable();

            $table->text('observation')
                ->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Une seule note par élève et par évaluation
            |--------------------------------------------------------------------------
            */

            $table->unique([
                'evaluation_id',
                'eleve_id',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};