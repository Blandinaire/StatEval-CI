<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etablissement extends Model
{
    protected $fillable = [
        'nom',
        'code',
        'ville',
        'adresse',
        'telephone',
        'email',
        'logo',
    ];

    public function maquettes()
{
    return $this->hasMany(Maquette::class);
}
}