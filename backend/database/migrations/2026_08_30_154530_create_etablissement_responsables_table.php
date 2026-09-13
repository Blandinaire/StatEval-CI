<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'etablissement_responsables',
            function (Blueprint $table) {

                $table->id();

                /*
                |--------------------------------------------------------------------------
                | ÉTABLISSEMENT
                |--------------------------------------------------------------------------
                */

                $table->foreignId('etablissement_id')
                    ->constrained()
                    ->cascadeOnDelete();

                /*
                |--------------------------------------------------------------------------
                | IDENTITÉ DU RESPONSABLE
                |--------------------------------------------------------------------------
                */

                $table->string('civilite')
                    ->nullable();

                $table->string('nom');

                $table->string('prenoms')
                    ->nullable();

                /*
                |--------------------------------------------------------------------------
                | FONCTION
                |--------------------------------------------------------------------------
                */

                $table->string('fonction');

                /*
                |--------------------------------------------------------------------------
                | CONTACTS
                |--------------------------------------------------------------------------
                */

                $table->string('telephone')
                    ->nullable();

                $table->string('whatsapp')
                    ->nullable();

                $table->string('email')
                    ->nullable();

                /*
                |--------------------------------------------------------------------------
                | STATUT
                |--------------------------------------------------------------------------
                */

                $table->boolean('actif')
                    ->default(true);

                /*
                |--------------------------------------------------------------------------
                | RESPONSABLE PRINCIPAL
                |--------------------------------------------------------------------------
                */

                $table->boolean('principal')
                    ->default(false);

                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'etablissement_responsables'
        );
    }
};