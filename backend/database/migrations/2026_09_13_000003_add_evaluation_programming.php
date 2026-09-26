<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->string('origine')->default('professeur')->after('enseignant_id');
            $table->string('statut')->default('active')->after('origine');
            $table->foreignId('cree_par')->nullable()->after('statut')->constrained('users')->nullOnDelete();
        });

        Schema::create('evaluation_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained('evaluations')->cascadeOnDelete();
            $table->foreignId('classe_id')->constrained('classes')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['evaluation_id', 'classe_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_classes');

        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropForeign(['cree_par']);
            $table->dropColumn(['origine', 'statut', 'cree_par']);
        });
    }
};
