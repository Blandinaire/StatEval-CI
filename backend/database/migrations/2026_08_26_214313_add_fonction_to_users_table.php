<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'fonction')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('fonction', 150)
                    ->nullable()
                    ->after('name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'fonction')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('fonction');
            });
        }
    }
};