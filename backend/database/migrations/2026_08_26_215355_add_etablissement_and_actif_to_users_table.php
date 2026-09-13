<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            if (!Schema::hasColumn('users', 'etablissement_id')) {
                $table->foreignId('etablissement_id')
                    ->nullable()
                    ->after('fonction')
                    ->constrained('etablissements')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('users', 'actif')) {
                $table->boolean('actif')
                    ->default(true)
                    ->after('etablissement_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            if (Schema::hasColumn('users', 'etablissement_id')) {
                $table->dropForeign(['etablissement_id']);
                $table->dropColumn('etablissement_id');
            }

            if (Schema::hasColumn('users', 'actif')) {
                $table->dropColumn('actif');
            }
        });
    }
};