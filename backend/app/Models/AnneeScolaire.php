<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnneeScolaire extends Model
{
    protected $fillable = [
        'libelle',
        'date_debut',
        'date_fin',
        'active',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'active' => 'boolean',
    ];

    public function classes()
    {
        return $this->hasMany(Classe::class);
    }

    public function maquettes()
{
    return $this->hasMany(Maquette::class);
}
}