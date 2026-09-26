<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE evaluations MODIFY type VARCHAR(255) NOT NULL DEFAULT 'Devoir'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE evaluations MODIFY type ENUM('Interrogation','Devoir','Composition','Examen','Autre') NOT NULL DEFAULT 'Devoir'");
    }
};
