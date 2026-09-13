<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conduites', function (Blueprint $table) {

            $table->string('periode')
                ->nullable()
                ->after('classe_id');

            $table->index([
                'annee_scolaire_id',
                'classe_id',
                'periode',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('conduites', function (Blueprint $table) {

            $table->dropIndex([
                'annee_scolaire_id',
                'classe_id',
                'periode',
            ]);

            $table->dropColumn('periode');
        });
    }
};