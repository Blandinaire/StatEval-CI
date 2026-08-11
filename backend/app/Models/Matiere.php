<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\MaquetteMatiere;

class Matiere extends Model
{
    use HasFactory;

    protected $fillable = [
        'libelle',
        'code',
        'couleur',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

public function lignesMaquette()
{
    return $this->hasMany(MaquetteMatiere::class);
}

public function maquettes()
{
    return $this->belongsToMany(
        Maquette::class,
        'maquette_matieres'
    )->withPivot([
        'coefficient',
        'volume_horaire',
        'ordre',
        'obligatoire',
        'prise_en_compte_moyenne',
        'note_sur',
        'active',
    ]);
}

}