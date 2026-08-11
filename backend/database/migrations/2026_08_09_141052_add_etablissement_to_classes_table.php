<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Cette migration est conservée pour cohérence avec l'historique
     * du projet. La colonne etablissement_id existe déjà dans la table
     * classes.
     */
    public function up(): void
    {
        //
    }

    /**
     * Aucun retour arrière nécessaire.
     */
    public function down(): void
    {
        //
    }
};