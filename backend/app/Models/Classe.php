<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classe extends Model
{
    protected $fillable = [
        'libelle',
        'niveau_id',
        'annee_scolaire_id',
        'capacite',
    ];

    public function niveau()
    {
        return $this->belongsTo(Niveau::class);
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }
}