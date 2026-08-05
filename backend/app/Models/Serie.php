<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Serie extends Model
{
    protected $fillable = [
        'cycle_id',
        'code',
        'libelle',
        'ordre',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    public function cycle()
    {
        return $this->belongsTo(Cycle::class);
    }

    public function maquettes()
{
    return $this->hasMany(Maquette::class);
}
}