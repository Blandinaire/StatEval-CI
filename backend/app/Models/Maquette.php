<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maquette extends Model
{
    use HasFactory;

    protected $fillable = [
        'annee_scolaire_id',
        'cycle_id',
        'niveau_id',
        'serie_id',
        'libelle',
        'version',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Relations
     */

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    public function cycle()
    {
        return $this->belongsTo(Cycle::class);
    }

    public function niveau()
    {
        return $this->belongsTo(Niveau::class);
    }

    public function serie()
    {
        return $this->belongsTo(Serie::class);
    }

    /**
     * Lignes de la maquette (table pivot enrichie)
     */
    public function lignes()
    {
        return $this->hasMany(MaquetteMatiere::class)
            ->orderBy('ordre');
    }

    /**
     * Matières de la maquette
     */
    public function matieres()
    {
        return $this->belongsToMany(
            Matiere::class,
            'maquette_matieres'
        )->withPivot([
            'coefficient',
            'volume_horaire',
            'ordre',
            'obligatoire',
            'prise_en_compte_moyenne',
            'note_sur',
            'active',
        ])
            ->withTimestamps()
            ->orderByPivot('ordre');
    }
}
