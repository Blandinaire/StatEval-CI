<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploiDuTemps extends Model
{
    protected $table = 'emplois_du_temps';

    protected $fillable = [
        'etablissement_id',
        'annee_scolaire_id',
        'nom',
        'statut',
        'ordre_classes',
    ];

    protected $casts = [
        'ordre_classes' => 'array',
    ];

    public function etablissement()
    {
        return $this->belongsTo(
            Etablissement::class
        );
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(
            AnneeScolaire::class
        );
    }

    public function lignes()
    {
        return $this->hasMany(
            EmploiDuTempsLigne::class
        );
    }
}
