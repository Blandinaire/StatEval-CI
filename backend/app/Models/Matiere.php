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
        'coefficient',
        'couleur',
        'active',
    ];

    protected $casts = [
        'coefficient' => 'integer',
        'active' => 'boolean',
    ];

public function maquettes()
{
    return $this->hasMany(MaquetteMatiere::class);
}

}