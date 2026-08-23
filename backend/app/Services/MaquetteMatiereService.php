<?php

namespace App\Services;

use App\Models\MaquetteMatiere;
use Illuminate\Support\Facades\DB;

class MaquetteMatiereService
{
    /**
     * Ajouter une matière à une maquette.
     * L'ordre est attribué automatiquement.
     */
    public function create(array $data): MaquetteMatiere
    {
        return DB::transaction(function () use ($data) {

            $dernierOrdre = MaquetteMatiere::where(
                'maquette_id',
                $data['maquette_id']
            )
                ->orderByDesc('ordre')
                ->lockForUpdate()
                ->value('ordre');

            $nouvelOrdre = ($dernierOrdre ?? 0) + 1;

            return MaquetteMatiere::create([
                'maquette_id' => $data['maquette_id'],
                'matiere_id' => $data['matiere_id'],
                'coefficient' => $data['coefficient'],
                'volume_horaire' => $data['volume_horaire'],
                'ordre' => $nouvelOrdre,
                'obligatoire' => $data['obligatoire'] ?? true,
                'prise_en_compte_moyenne' =>
                $data['prise_en_compte_moyenne'] ?? true,
                'note_sur' => $data['note_sur'] ?? 20,
                'active' => $data['active'] ?? true,
            ]);
        });
    }

    /**
     * Modifier une ligne de maquette.
     * L'ordre n'est pas modifié manuellement.
     */
    public function update(
        MaquetteMatiere $ligne,
        array $data
    ): MaquetteMatiere {
        $ligne->update($data);

        return $ligne;
    }

    /**
     * Supprimer une ligne puis réorganiser automatiquement
     * les ordres restants.
     */
    public function delete(MaquetteMatiere $ligne): void
    {
        DB::transaction(function () use ($ligne) {

            $maquetteId = $ligne->maquette_id;
            $ordreSupprime = $ligne->ordre;

            $ligne->delete();

            MaquetteMatiere::where('maquette_id', $maquetteId)
                ->where('ordre', '>', $ordreSupprime)
                ->decrement('ordre');
        });
    }
    /**
     * Monter une matière d'une position.
     */
    public function monter(
        MaquetteMatiere $ligne
    ): void {
        DB::transaction(function () use ($ligne) {

            $ligne = $ligne->fresh();

            $lignePrecedente = MaquetteMatiere::where(
                'maquette_id',
                $ligne->maquette_id
            )
                ->where('ordre', '<', $ligne->ordre)
                ->orderByDesc('ordre')
                ->lockForUpdate()
                ->first();

            if (! $lignePrecedente) {
                return;
            }

            $ordreActuel = $ligne->ordre;

            $ligne->update([
                'ordre' => $lignePrecedente->ordre,
            ]);

            $lignePrecedente->update([
                'ordre' => $ordreActuel,
            ]);
        });
    }
    /**
     * Descendre une matière d'une position.
     */
    public function descendre(
        MaquetteMatiere $ligne
    ): void {
        DB::transaction(function () use ($ligne) {

            $ligne = $ligne->fresh();

            $ligneSuivante = MaquetteMatiere::where(
                'maquette_id',
                $ligne->maquette_id
            )
                ->where('ordre', '>', $ligne->ordre)
                ->orderBy('ordre')
                ->lockForUpdate()
                ->first();

            if (! $ligneSuivante) {
                return;
            }

            $ordreActuel = $ligne->ordre;

            $ligne->update([
                'ordre' => $ligneSuivante->ordre,
            ]);

            $ligneSuivante->update([
                'ordre' => $ordreActuel,
            ]);
        });
    }
}
