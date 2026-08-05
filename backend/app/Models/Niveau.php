<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Niveau extends Model
{
    use HasFactory;

    protected $fillable = [
        'libelle',
        'code',
        'ordre',
    ];

    protected $casts = [
        'ordre' => 'integer',
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