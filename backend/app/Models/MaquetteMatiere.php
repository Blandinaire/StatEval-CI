<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaquetteMatiere extends Model
{
    protected $fillable = [
        'maquette_id',
        'matiere_id',
        'coefficient',
        'volume_horaire',
        'ordre',
        'obligatoire',
        'prise_en_compte_moyenne',
        'note_sur',
        'active',
    ];

    protected $casts = [
        'obligatoire' => 'boolean',
        'prise_en_compte_moyenne' => 'boolean',
        'active' => 'boolean',
    ];

    public function maquette()
    {
        return $this->belongsTo(Maquette::class);
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }
}