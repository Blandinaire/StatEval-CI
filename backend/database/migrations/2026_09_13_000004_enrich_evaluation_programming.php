<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->foreignId('niveau_id')->nullable()->after('annee_scolaire_id')->constrained('niveaux')->nullOnDelete();
            $table->time('heure_debut')->nullable()->after('date_evaluation');
            $table->time('heure_fin')->nullable()->after('heure_debut');
            $table->boolean('prise_en_compte_moyenne')->default(true)->after('coefficient');
            $table->boolean('notifier_professeurs')->default(false)->after('prise_en_compte_moyenne');
            $table->boolean('publier_eleves')->default(false)->after('notifier_professeurs');
            $table->boolean('publier_parents')->default(false)->after('publier_eleves');
        });

        Schema::table('evaluation_classes', function (Blueprint $table) {
            $table->foreignId('enseignant_id')->nullable()->after('classe_id')->constrained('enseignants')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_classes', function (Blueprint $table) {
            $table->dropForeign(['enseignant_id']);
            $table->dropColumn('enseignant_id');
        });

        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropForeign(['niveau_id']);
            $table->dropColumn([
                'niveau_id',
                'heure_debut',
                'heure_fin',
                'prise_en_compte_moyenne',
                'notifier_professeurs',
                'publier_eleves',
                'publier_parents',
            ]);
        });
    }
};
