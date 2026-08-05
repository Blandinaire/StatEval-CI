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
    Schema::create('series', function (Blueprint $table) {

        $table->id();

        $table->foreignId('cycle_id')
              ->constrained()
              ->cascadeOnDelete();

        $table->string('code');
        $table->string('libelle');

        $table->unsignedInteger('ordre')->default(1);

        $table->boolean('actif')->default(true);

        $table->timestamps();

        $table->unique(['cycle_id', 'code']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('series');
    }
};
