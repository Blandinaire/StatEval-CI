<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    protected $fillable = [
        'eleve_id',
        'educateur_id',
        'annee_scolaire_id',
        'classe_id',
        'date_absence',
        'heure_debut',
        'heure_fin',
        'duree_heures',
        'justifiee',
        'motif',
        'numero_billet',
        'billet_edite',
        'billet_edite_le',
        'observation',
    ];

    protected $casts = [
        'date_absence' => 'date',
        'justifiee' => 'boolean',
        'billet_edite' => 'boolean',
        'billet_edite_le' => 'datetime',
        'duree_heures' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    public function educateur()
    {
        return $this->belongsTo(Educateur::class);
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }
}