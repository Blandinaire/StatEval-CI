<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cycle extends Model
{
    protected $fillable = [
        'code',
        'libelle',
        'ordre',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

public function series()
{
    return $this->hasMany(Serie::class);
}

public function maquettes()
{
    return $this->hasMany(Maquette::class);
}
}