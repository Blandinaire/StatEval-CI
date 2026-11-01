<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->foreignId('professeur_principal_id')
                ->nullable()
                ->after('salle_id')
                ->constrained('enseignants')
                ->nullOnDelete();

            $table->foreignId('delegue_id')
                ->nullable()
                ->after('professeur_principal_id')
                ->constrained('eleves')
                ->nullOnDelete();

            $table->foreignId('sous_delegue_id')
                ->nullable()
                ->after('delegue_id')
                ->constrained('eleves')
                ->nullOnDelete();

            $table->text('observations')->nullable()
                ->after('sous_delegue_id');
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('professeur_principal_id');
            $table->dropConstrainedForeignId('delegue_id');
            $table->dropConstrainedForeignId('sous_delegue_id');
            $table->dropColumn('observations');
        });
    }
};
