<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matieres', function (Blueprint $table) {
            $table->foreignId('matiere_parent_id')
                ->nullable()
                ->after('id')
                ->constrained('matieres')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('matieres', function (Blueprint $table) {
            $table->dropForeign(['matiere_parent_id']);
            $table->dropColumn('matiere_parent_id');
        });
    }
};
