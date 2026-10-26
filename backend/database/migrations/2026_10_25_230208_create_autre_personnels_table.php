
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('autres_personnels', function (Blueprint $table) {
            $table->id();

            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->cascadeOnDelete();

            $table->foreignId('fonction_personnel_id')
                ->constrained('fonctions_personnel')
                ->restrictOnDelete();

            // Le compte applicatif est facultatif
            $table->foreignId('user_id')
                ->nullable()
                ->unique()
                ->constrained('users')
                ->nullOnDelete();

            // Identité
            $table->string('matricule', 50)->nullable();
            $table->string('nom', 100);
            $table->string('prenoms', 150);
            $table->string('sexe', 20);
            $table->date('date_naissance')->nullable();
            $table->string('lieu_naissance', 150)->nullable();
            $table->string('nationalite', 100)->nullable();

            // Coordonnées
            $table->string('telephone', 30)->nullable();
            $table->string('email')->nullable();
            $table->text('adresse')->nullable();
            $table->string('photo')->nullable();

            // Situation professionnelle
            $table->string('type', 30)->default('Contractuel');
            $table->string('grade', 100)->nullable();
            $table->date('date_embauche')->nullable();
            $table->date('date_prise_service')->nullable();
            $table->string('statut', 30)->default('Actif');
            $table->boolean('actif')->default(true);
            $table->text('observations')->nullable();

            $table->timestamps();

            // Le matricule est unique dans un même établissement
            $table->unique(
                ['etablissement_id', 'matricule'],
                'autres_personnels_etablissement_matricule_unique'
            );

            $table->index(['etablissement_id', 'nom', 'prenoms']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('autres_personnels');
    }
};
