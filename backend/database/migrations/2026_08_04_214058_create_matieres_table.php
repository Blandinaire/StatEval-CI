<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matieres', function (Blueprint $table) {

            $table->id();

            $table->string('libelle');

            $table->string('code')->unique();

            $table->unsignedInteger('coefficient')->default(1);

            $table->string('couleur')->default('#2563EB');

            $table->boolean('active')->default(true);

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matieres');
    }
};