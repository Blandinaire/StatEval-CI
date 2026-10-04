<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreneauHoraire extends Model
{
    protected $table = 'creneaux_horaires';

    protected $fillable = [
        'etablissement_id',
        'libelle',
        'type',
        'heure_debut',
        'heure_fin',
        'ordre',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    public function etablissement()
    {
        return $this->belongsTo(
            Etablissement::class
        );
    }

    public function lignes()
    {
        return $this->hasMany(
            EmploiDuTempsLigne::class,
            'creneau_horaire_id'
        );
    }
}