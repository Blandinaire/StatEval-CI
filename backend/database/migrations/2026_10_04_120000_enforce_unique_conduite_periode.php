<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conduites', function (Blueprint $table) {
            $table->unique(
                ['eleve_id', 'annee_scolaire_id', 'periode'],
                'conduites_eleve_annee_periode_unique'
            );
        });

        $indexNames = collect(Schema::getIndexes('conduites'))
            ->pluck('name')
            ->all();

        foreach (
            [
                'conduites_eleve_annee_classe_periode_unique',
                'conduites_eleve_evaluation_unique',
            ] as $indexName
        ) {
            if (in_array($indexName, $indexNames, true)) {
                Schema::table('conduites', function (Blueprint $table) use ($indexName) {
                    $table->dropUnique($indexName);
                });
            }
        }
    }

    public function down(): void
    {
        Schema::table('conduites', function (Blueprint $table) {
            $table->dropUnique('conduites_eleve_annee_periode_unique');
        });
    }
};
