
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eleve_parent', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('eleve_id')
                ->constrained('eleves')
                ->cascadeOnDelete();

            $table->string('lien', 30)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'eleve_id']);
            $table->index('eleve_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eleve_parent');
    }
};
