<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Exécuter la migration.
     */
    public function up(): void
    {
        Schema::table('eleves', function (Blueprint $table) {

            /*
            |--------------------------------------------------------------------------
            | Informations du père
            |--------------------------------------------------------------------------
            */

            $table->string('pere_nom')->nullable()->after('responsable_adresse');

            $table->string('pere_prenoms')->nullable()->after('pere_nom');

            $table->string('pere_telephone')->nullable()->after('pere_prenoms');

            $table->string('pere_email')->nullable()->after('pere_telephone');

            $table->string('pere_profession')->nullable()->after('pere_email');

            $table->string('pere_adresse')->nullable()->after('pere_profession');


            /*
            |--------------------------------------------------------------------------
            | Informations de la mère
            |--------------------------------------------------------------------------
            */

            $table->string('mere_nom')->nullable()->after('pere_adresse');

            $table->string('mere_prenoms')->nullable()->after('mere_nom');

            $table->string('mere_telephone')->nullable()->after('mere_prenoms');

            $table->string('mere_email')->nullable()->after('mere_telephone');

            $table->string('mere_profession')->nullable()->after('mere_email');

            $table->string('mere_adresse')->nullable()->after('mere_profession');


            /*
            |--------------------------------------------------------------------------
            | Identification du tuteur légal
            |--------------------------------------------------------------------------
            */

            $table->enum('type_tuteur_legal', [
                'PERE',
                'MERE',
                'AUTRE',
            ])
                ->default('AUTRE')
                ->after('mere_adresse');


            /*
            |--------------------------------------------------------------------------
            | Informations propres au tuteur
            |--------------------------------------------------------------------------
            | Ces champs sont utiles uniquement lorsque type_tuteur_legal = AUTRE.
            |--------------------------------------------------------------------------
            */

            $table->string('tuteur_nom')->nullable()->after('type_tuteur_legal');

            $table->string('tuteur_prenoms')->nullable()->after('tuteur_nom');

            $table->string('tuteur_telephone')->nullable()->after('tuteur_prenoms');

            $table->string('tuteur_email')->nullable()->after('tuteur_telephone');

            $table->string('tuteur_profession')->nullable()->after('tuteur_email');

            $table->string('tuteur_adresse')->nullable()->after('tuteur_profession');
        });
    }

    /**
     * Annuler la migration.
     */
    public function down(): void
    {
        Schema::table('eleves', function (Blueprint $table) {

            $table->dropColumn([
                'pere_nom',
                'pere_prenoms',
                'pere_telephone',
                'pere_email',
                'pere_profession',
                'pere_adresse',

                'mere_nom',
                'mere_prenoms',
                'mere_telephone',
                'mere_email',
                'mere_profession',
                'mere_adresse',

                'type_tuteur_legal',

                'tuteur_nom',
                'tuteur_prenoms',
                'tuteur_telephone',
                'tuteur_email',
                'tuteur_profession',
                'tuteur_adresse',
            ]);
        });
    }
};