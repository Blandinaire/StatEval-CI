<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('eleves', function (Blueprint $table) {

            // Identifiant interne de l'élève
            $table->string('code_eleve', 30)
                ->nullable()
                ->after('id');

            // Le matricule national peut être absent à l'inscription
            $table->string('matricule')
                ->nullable()
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('eleves', function (Blueprint $table) {

            $table->dropColumn('code_eleve');

            $table->string('matricule')
                ->nullable(false)
                ->change();
        });
    }
};