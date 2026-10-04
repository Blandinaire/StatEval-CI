<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Vérifie l'existence d'un index MySQL.
     */
    private function indexExiste(string $table, string $index): bool
    {
        $resultat = DB::select(
            "
            SELECT COUNT(*) AS total
            FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = ?
              AND index_name = ?
            ",
            [$table, $index]
        );

        return (int) ($resultat[0]->total ?? 0) > 0;
    }

    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Ajouter les informations descriptives des versions
        |--------------------------------------------------------------------------
        */

        Schema::table('maquettes', function (Blueprint $table) {

            if (!Schema::hasColumn('maquettes', 'nom_version')) {
                $table->string('nom_version', 150)
                    ->nullable()
                    ->after('libelle');
            }

            if (!Schema::hasColumn('maquettes', 'description')) {
                $table->text('description')
                    ->nullable()
                    ->after('nom_version');
            }
        });

        /*
        |--------------------------------------------------------------------------
        | 2. Initialiser les noms de versions existantes
        |--------------------------------------------------------------------------
        */

        DB::table('maquettes')
            ->whereNull('nom_version')
            ->orderBy('id')
            ->get([
                'id',
                'version',
            ])
            ->each(function ($maquette) {

                $nomVersion =
                    ((int) $maquette->version === 1)
                    ? 'Standard'
                    : 'Variante V' . $maquette->version;

                DB::table('maquettes')
                    ->where('id', $maquette->id)
                    ->update([
                        'nom_version' => $nomVersion,
                    ]);
            });

        /*
        |--------------------------------------------------------------------------
        | 3. Moderniser la contrainte d'unicité
        |--------------------------------------------------------------------------
        |
        | Les maquettes sont déjà globales grâce à la migration
        | 2026_09_13_000002_make_maquettes_globales.
        |
        | On conserve donc cette logique et on ajoute le cycle dans
        | l'identification du contexte pédagogique.
        |
        */

        Schema::table('maquettes', function (Blueprint $table) {

            $table->unique(
                [
                    'annee_scolaire_id',
                    'cycle_id',
                    'niveau_id',
                    'serie_id',
                    'version',
                ],
                'uq_maquettes_contexte_version'
            );
        });

        if ($this->indexExiste(
            'maquettes',
            'uq_maquettes_globales'
        )) {
            Schema::table('maquettes', function (Blueprint $table) {
                $table->dropUnique(
                    'uq_maquettes_globales'
                );
            });
        }
    }

    public function down(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Suppression du nouvel index
        |--------------------------------------------------------------------------
        */

        if ($this->indexExiste(
            'maquettes',
            'uq_maquettes_contexte_version'
        )) {
            Schema::table('maquettes', function (Blueprint $table) {
                $table->dropUnique(
                    'uq_maquettes_contexte_version'
                );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Restauration de l'ancien index global
        |--------------------------------------------------------------------------
        */

        Schema::table('maquettes', function (Blueprint $table) {

            $table->unique(
                [
                    'annee_scolaire_id',
                    'niveau_id',
                    'serie_id',
                    'version',
                ],
                'uq_maquettes_globales'
            );
        });

        /*
        |--------------------------------------------------------------------------
        | Suppression des colonnes ajoutées
        |--------------------------------------------------------------------------
        */

        Schema::table('maquettes', function (Blueprint $table) {

            if (Schema::hasColumn('maquettes', 'description')) {
                $table->dropColumn('description');
            }

            if (Schema::hasColumn('maquettes', 'nom_version')) {
                $table->dropColumn('nom_version');
            }
        });
    }
};
