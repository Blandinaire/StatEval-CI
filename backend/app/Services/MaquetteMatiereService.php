<?php

namespace App\Services;

use App\Models\MaquetteMatiere;
use Illuminate\Support\Facades\DB;

class MaquetteMatiereService
{
    /**
     * Ajouter une matière à une maquette.
     */
    public function create(array $data): MaquetteMatiere
    {
        return DB::transaction(function () use ($data) {

            return MaquetteMatiere::create([
                'maquette_id' => $data['maquette_id'],
                'matiere_id' => $data['matiere_id'],
                'coefficient' => $data['coefficient'],
                'volume_horaire' => $data['volume_horaire'],
                'ordre' => $data['ordre'] ?? 1,
                'obligatoire' => $data['obligatoire'] ?? true,
                'prise_en_compte_moyenne' => $data['prise_en_compte_moyenne'] ?? true,
                'note_sur' => $data['note_sur'] ?? 20,
                'active' => $data['active'] ?? true,
            ]);

        });
    }

    /**
     * Modifier une ligne de maquette.
     */
    public function update(MaquetteMatiere $ligne, array $data): MaquetteMatiere
    {
        $ligne->update($data);

        return $ligne;
    }

    /**
     * Supprimer une ligne.
     */
    public function delete(MaquetteMatiere $ligne): void
    {
        $ligne->delete();
    }
}