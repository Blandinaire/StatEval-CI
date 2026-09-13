<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('etablissement_responsable_id')
                ->nullable()
                ->after('educateur_id')
                ->constrained('etablissement_responsables')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['etablissement_responsable_id']);
            $table->dropColumn('etablissement_responsable_id');
        });
    }
};
