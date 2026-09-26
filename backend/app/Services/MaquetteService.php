<?php

namespace App\Services;

use App\Models\Maquette;
use App\Models\Niveau;
use App\Models\Serie;
use Illuminate\Support\Facades\DB;

class MaquetteService
{
    /**
     * Créer une maquette.
     */
    public function create(array $data): Maquette
    {
        return DB::transaction(function () use ($data) {

            $niveau = Niveau::findOrFail($data['niveau_id']);

            $serie = null;

            if (!empty($data['serie_id'])) {
                $serie = Serie::findOrFail($data['serie_id']);
            }

            $libelle = $niveau->libelle;

            if ($serie) {
                $libelle .= ' ' . $serie->libelle;
            }

            return Maquette::create([
                'annee_scolaire_id' => $data['annee_scolaire_id'],
                'cycle_id'          => $data['cycle_id'],
                'niveau_id'         => $data['niveau_id'],
                'serie_id'          => $data['serie_id'] ?? null,
                'libelle'           => $libelle,
                'version'           => 1,
                'active'            => true,
            ]);
        });
    }
}
