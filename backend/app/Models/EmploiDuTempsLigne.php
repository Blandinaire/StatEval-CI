<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploiDuTempsLigne extends Model
{
    protected $fillable = [
        'emploi_du_temps_id',
        'creneau_horaire_id',
        'classe_id',
        'matiere_id',
        'enseignant_id',
        'jour',
        'salle',
    ];

    public function emploiDuTemps()
    {
        return $this->belongsTo(
            EmploiDuTemps::class
        );
    }

    public function creneau()
    {
        return $this->belongsTo(
            CreneauHoraire::class,
            'creneau_horaire_id'
        );
    }

    public function classe()
    {
        return $this->belongsTo(
            Classe::class
        );
    }

    public function matiere()
    {
        return $this->belongsTo(
            Matiere::class
        );
    }

    public function enseignant()
    {
        return $this->belongsTo(
            Enseignant::class
        );
    }
}