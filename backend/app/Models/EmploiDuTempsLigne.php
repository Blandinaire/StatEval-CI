<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Salle;

class EmploiDuTempsLigne extends Model
{
    protected $fillable = [
        'emploi_du_temps_id',
        'creneau_horaire_id',
        'classe_id',
        'groupe',
        'matiere_id',
        'activite',
        'enseignant_id',
        'educateur_id',
        'salle_id',
        'regroupement_id',
        'bloc_id',
        'jour',
        'salle',
    ];

    public function emploiDuTemps()
    {
        return $this->belongsTo(EmploiDuTemps::class);
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
        return $this->belongsTo(Classe::class);
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function educateur()
    {
        return $this->belongsTo(Educateur::class);
    }

    public function lignesRegroupees()
    {
        return $this->hasMany(
            self::class,
            'regroupement_id',
            'regroupement_id'
        )
            ->where('id', '!=', $this->id);
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }

    public function salleAssociee()
    {
        return $this->belongsTo(Salle::class, 'salle_id');
    }
}
