<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropForeign(['enseignant_id']);
            $table->unsignedBigInteger('enseignant_id')
                ->nullable()
                ->change();

            $table->foreign('enseignant_id')
                ->references('id')
                ->on('enseignants')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropForeign(['enseignant_id']);
            $table->unsignedBigInteger('enseignant_id')
                ->nullable(false)
                ->change();

            $table->foreign('enseignant_id')
                ->references('id')
                ->on('enseignants')
                ->cascadeOnDelete();
        });
    }
};
