<?php

namespace App\Services;

use App\Models\Maquette;
use App\Models\MaquetteMatiere;
use App\Models\Niveau;
use App\Models\Serie;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MaquetteService
{
    /**
     * Créer la première version d'une famille de maquette.
     */
    public function create(array $data): Maquette
    {
        return DB::transaction(function () use ($data) {

            $niveau = Niveau::findOrFail(
                $data['niveau_id']
            );

            $serie = null;

            if (!empty($data['serie_id'])) {
                $serie = Serie::findOrFail(
                    $data['serie_id']
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Une famille existe déjà ?
            |--------------------------------------------------------------------------
            */

            $query = Maquette::query()
                ->where(
                    'annee_scolaire_id',
                    $data['annee_scolaire_id']
                )
                ->where(
                    'cycle_id',
                    $data['cycle_id']
                )
                ->where(
                    'niveau_id',
                    $data['niveau_id']
                );

            if (!empty($data['serie_id'])) {
                $query->where(
                    'serie_id',
                    $data['serie_id']
                );
            } else {
                $query->whereNull('serie_id');
            }

            if ($query->exists()) {
                throw ValidationException::withMessages([
                    'niveau_id' =>
                        'Une maquette existe déjà pour ce niveau et cette année scolaire. Utilisez « Nouvelle version » depuis cette maquette.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Libellé
            |--------------------------------------------------------------------------
            */

            $libelle = $data['libelle']
                ?? $niveau->libelle;

            /*
            |--------------------------------------------------------------------------
            | Création V1
            |--------------------------------------------------------------------------
            */

            return Maquette::create([
                'annee_scolaire_id' =>
                    $data['annee_scolaire_id'],

                'cycle_id' =>
                    $data['cycle_id'],

                'niveau_id' =>
                    $data['niveau_id'],

                'serie_id' =>
                    $data['serie_id'] ?? null,

                'libelle' =>
                    $libelle,

                'nom_version' =>
                    $data['nom_version'] ?? 'Standard',

                'description' =>
                    $data['description'] ?? null,

                'version' =>
                    1,

                'active' =>
                    $data['active'] ?? true,
            ]);
        });
    }

    /**
     * Créer une nouvelle version à partir d'une maquette existante.
     */
    public function createVersion(
        Maquette $source,
        array $data
    ): Maquette {

        return DB::transaction(function () use (
            $source,
            $data
        ) {

            $source->load('lignes');

            /*
            |--------------------------------------------------------------------------
            | Numéro de la prochaine version
            |--------------------------------------------------------------------------
            */

            $query = Maquette::query()
                ->where(
                    'annee_scolaire_id',
                    $source->annee_scolaire_id
                )
                ->where(
                    'cycle_id',
                    $source->cycle_id
                )
                ->where(
                    'niveau_id',
                    $source->niveau_id
                );

            if ($source->serie_id) {
                $query->where(
                    'serie_id',
                    $source->serie_id
                );
            } else {
                $query->whereNull('serie_id');
            }

            $prochaineVersion =
                ((int) $query->max('version')) + 1;

            /*
            |--------------------------------------------------------------------------
            | Création de la version
            |--------------------------------------------------------------------------
            */

            $nouvelleVersion = Maquette::create([
                'annee_scolaire_id' =>
                    $source->annee_scolaire_id,

                'cycle_id' =>
                    $source->cycle_id,

                'niveau_id' =>
                    $source->niveau_id,

                'serie_id' =>
                    $source->serie_id,

                'libelle' =>
                    $source->libelle,

                'nom_version' =>
                    $data['nom_version'],

                'description' =>
                    $data['description'] ?? null,

                'version' =>
                    $prochaineVersion,

                /*
                 * Plusieurs versions peuvent être actives.
                 */
                'active' =>
                    $data['active'] ?? true,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Copie des matières
            |--------------------------------------------------------------------------
            */

            foreach ($source->lignes as $ligne) {

                MaquetteMatiere::create([
                    'maquette_id' =>
                        $nouvelleVersion->id,

                    'matiere_id' =>
                        $ligne->matiere_id,

                    'coefficient' =>
                        $ligne->coefficient,

                    'volume_horaire' =>
                        $ligne->volume_horaire,

                    'ordre' =>
                        $ligne->ordre,

                    'obligatoire' =>
                        $ligne->obligatoire,

                    'prise_en_compte_moyenne' =>
                        $ligne->prise_en_compte_moyenne,

                    'note_sur' =>
                        $ligne->note_sur,

                    'active' =>
                        $ligne->active,
                ]);
            }

            return $nouvelleVersion;
        });
    }

    /**
     * Supprimer une version.
     */
    public function delete(Maquette $maquette): void
    {
        if ($maquette->classes()->exists()) {
            throw ValidationException::withMessages([
                'general' =>
                    'Cette version de maquette est utilisée par une ou plusieurs classes et ne peut pas être supprimée.',
            ]);
        }

        DB::transaction(function () use ($maquette) {
            $maquette->delete();
        });
    }

    /**
     * Activer / désactiver une version.
     *
     * Plusieurs versions peuvent être actives simultanément.
     */
    public function toggleActive(Maquette $maquette): Maquette
    {
        $maquette->update([
            'active' => !$maquette->active,
        ]);

        return $maquette->fresh();
    }
}