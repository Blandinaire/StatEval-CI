<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Affectation extends Model
{
    protected $fillable = [

        'etablissement_id',

        'annee_scolaire_id',

        'classe_id',

        'matiere_id',

        'enseignant_id',

        'coefficient',

        'volume_horaire',

        'actif',

    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
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
}