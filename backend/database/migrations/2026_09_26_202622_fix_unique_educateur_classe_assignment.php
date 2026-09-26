<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Nettoyage des éventuels doublons existants
        |--------------------------------------------------------------------------
        |
        | Une classe ne doit avoir qu'un seul éducateur pour une année scolaire
        | et un établissement donnés.
        |
        | En cas de doublon, on conserve l'enregistrement ayant le plus grand ID
        | (donc le plus récent).
        |
        */

        $doublons = DB::table('educateur_classes')
            ->select(
                'annee_scolaire_id',
                'etablissement_id',
                'classe_id',
                DB::raw('MAX(id) as id_a_conserver'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy(
                'annee_scolaire_id',
                'etablissement_id',
                'classe_id'
            )
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($doublons as $doublon) {
            DB::table('educateur_classes')
                ->where('annee_scolaire_id', $doublon->annee_scolaire_id)
                ->where('etablissement_id', $doublon->etablissement_id)
                ->where('classe_id', $doublon->classe_id)
                ->where('id', '!=', $doublon->id_a_conserver)
                ->delete();
        }

        /*
        |--------------------------------------------------------------------------
        | 2. Création du nouvel index UNIQUE
        |--------------------------------------------------------------------------
        |
        | IMPORTANT :
        | On le crée AVANT de supprimer l'ancien index.
        |
        | L'ordre commence par annee_scolaire_id afin que cet index puisse
        | également satisfaire la clé étrangère sur annee_scolaire_id.
        |
        */

        Schema::table('educateur_classes', function (Blueprint $table) {
            $table->unique(
                [
                    'annee_scolaire_id',
                    'etablissement_id',
                    'classe_id',
                ],
                'educateur_classe_classe_unique'
            );
        });

        /*
        |--------------------------------------------------------------------------
        | 3. Suppression de l'ancien index UNIQUE
        |--------------------------------------------------------------------------
        |
        | Ancienne règle :
        | année + éducateur + classe
        |
        | Cette règle permettait à une même classe d'avoir plusieurs
        | éducateurs différents.
        |
        */

        Schema::table('educateur_classes', function (Blueprint $table) {
            $table->dropUnique('educateur_classe_unique');
        });
    }

    public function down(): void
    {
        /*
        | On restaure l'ancienne contrainte.
        */

        Schema::table('educateur_classes', function (Blueprint $table) {
            $table->dropUnique('educateur_classe_classe_unique');

            $table->unique(
                [
                    'annee_scolaire_id',
                    'educateur_id',
                    'classe_id',
                ],
                'educateur_classe_unique'
            );
        });
    }
};