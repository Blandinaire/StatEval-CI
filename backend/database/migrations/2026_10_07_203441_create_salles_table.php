<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->cascadeOnDelete();

            $table->string('nom', 80);
            $table->string('type', 50)->default('classe');
            $table->unsignedInteger('capacite')->nullable();
            $table->boolean('active')->default(true);

            $table->timestamps();

            $table->unique([
                'etablissement_id',
                'nom',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salles');
    }
};