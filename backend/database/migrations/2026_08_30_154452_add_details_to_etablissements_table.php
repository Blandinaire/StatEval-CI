<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ajouter les informations détaillées
     * de l'établissement.
     */
    public function up(): void
    {
        Schema::table('etablissements', function (Blueprint $table) {

            /*
            |--------------------------------------------------------------------------
            | IDENTITÉ
            |--------------------------------------------------------------------------
            */

            $table->string('nom_complet')
                ->nullable()
                ->after('nom');

            $table->string('slogan')
                ->nullable()
                ->after('devise');

            /*
            |--------------------------------------------------------------------------
            | LOCALISATION
            |--------------------------------------------------------------------------
            */

            $table->string('pays')
                ->nullable()
                ->after('adresse');

            $table->string('departement')
                ->nullable()
                ->after('region');

            $table->string('commune')
                ->nullable()
                ->after('departement');

            $table->string('quartier')
                ->nullable()
                ->after('ville');

            $table->string('direction_regionale')
                ->nullable()
                ->after('academie');

            /*
            |--------------------------------------------------------------------------
            | CONTACTS
            |--------------------------------------------------------------------------
            */

            $table->string('telephone_secondaire')
                ->nullable()
                ->after('telephone');

            $table->string('whatsapp')
                ->nullable()
                ->after('telephone_secondaire');

            $table->string('email_secondaire')
                ->nullable()
                ->after('email');

            $table->string('site_web')
                ->nullable()
                ->after('email_secondaire');

            /*
            |--------------------------------------------------------------------------
            | INFORMATIONS ADMINISTRATIVES
            |--------------------------------------------------------------------------
            */

            $table->year('annee_creation')
                ->nullable()
                ->after('type');

            $table->date('date_ouverture')
                ->nullable()
                ->after('annee_creation');

            $table->string('numero_autorisation')
                ->nullable()
                ->after('date_ouverture');

            $table->string('numero_decision_ouverture')
                ->nullable()
                ->after('numero_autorisation');
        });
    }

    /**
     * Supprimer les colonnes ajoutées.
     */
    public function down(): void
    {
        Schema::table('etablissements', function (Blueprint $table) {

            $table->dropColumn([
                'nom_complet',
                'slogan',
                'pays',
                'departement',
                'commune',
                'quartier',
                'direction_regionale',
                'telephone_secondaire',
                'whatsapp',
                'email_secondaire',
                'site_web',
                'annee_creation',
                'date_ouverture',
                'numero_autorisation',
                'numero_decision_ouverture',
            ]);
        });
    }
};