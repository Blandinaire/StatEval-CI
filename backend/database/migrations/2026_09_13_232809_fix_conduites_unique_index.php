<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // La structure de la table conduites a été corrigée
        // directement dans MySQL afin de préserver les
        // contraintes de clés étrangères existantes.
    }

    public function down(): void
    {
        // Aucun rollback automatique.
    }
};