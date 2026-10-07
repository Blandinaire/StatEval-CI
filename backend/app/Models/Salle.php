<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    protected $fillable = [
        'etablissement_id',
        'nom',
        'type',
        'capacite',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function classes()
    {
        return $this->hasMany(Classe::class);
    }

    public function lignesEmploiDuTemps()
    {
        return $this->hasMany(
            EmploiDuTempsLigne::class,
            'salle_id'
        );
    }
}