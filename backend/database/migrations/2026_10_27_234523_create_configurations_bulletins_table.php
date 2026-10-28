<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configurations_bulletins', function (Blueprint $table) {
            $table->id();

            $table->foreignId('etablissement_id')
                ->unique()
                ->constrained('etablissements')
                ->cascadeOnDelete();

            $table->string('format', 30)->default('a4');

            $table->boolean('afficher_appreciations')->default(true);
            $table->boolean('afficher_professeurs')->default(true);
            $table->boolean('afficher_rang')->default(true);
            $table->boolean('afficher_absences_retards')->default(true);
            $table->boolean('afficher_conduite')->default(true);
            $table->boolean('afficher_observations')->default(true);
            $table->boolean('afficher_directeur')->default(true);
            $table->boolean('afficher_signatures')->default(true);

            $table->json('options_supplementaires')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configurations_bulletins');
    }
};
