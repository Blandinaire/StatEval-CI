<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('emploi_du_temps_lignes', function (Blueprint $table) {
            $table->dropForeign(['matiere_id']);
            $table->foreignId('matiere_id')
                ->nullable()
                ->change();
            $table->foreign('matiere_id')
                ->references('id')
                ->on('matieres')
                ->nullOnDelete();

            $table->string('activite', 10)->nullable();
            $table->foreignId('educateur_id')
                ->nullable()
                ->after('enseignant_id')
                ->constrained('educateurs')
                ->nullOnDelete();
            $table->uuid('bloc_id')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('emploi_du_temps_lignes', function (Blueprint $table) {
            $table->dropIndex(['bloc_id']);
            $table->dropForeign(['educateur_id']);
            $table->dropColumn(['activite', 'educateur_id', 'bloc_id']);
            $table->foreignId('matiere_id')
                ->nullable(false)
                ->change();
            $table->foreign('matiere_id')
                ->references('id')
                ->on('matieres')
                ->cascadeOnDelete();
        });
    }
};
