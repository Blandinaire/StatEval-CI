<?php

namespace App\Models;

use App\Models\Note;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory;

    protected $fillable = [

        /*
        |--------------------------------------------------------------------------
        | Contexte scolaire
        |--------------------------------------------------------------------------
        */

        'etablissement_id',
        'annee_scolaire_id',
        'classe_id',

        /*
        |--------------------------------------------------------------------------
        | Matière et enseignant
        |--------------------------------------------------------------------------
        */

        'matiere_id',
        'enseignant_id',

        /*
        |--------------------------------------------------------------------------
        | Identification
        |--------------------------------------------------------------------------
        */

        'libelle',
        'type',
        'numero',
        'date_evaluation',

        /*
        |--------------------------------------------------------------------------
        | Notation
        |--------------------------------------------------------------------------
        */

        'bareme',
        'coefficient',

        /*
        |--------------------------------------------------------------------------
        | Période
        |--------------------------------------------------------------------------
        */

        'periode',

        /*
        |--------------------------------------------------------------------------
        | Statut
        |--------------------------------------------------------------------------
        */

        'active',
    ];

    protected $casts = [

        'date_evaluation' => 'date',

        'bareme' => 'decimal:2',

        'coefficient' => 'decimal:2',

        'active' => 'boolean',

    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

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

    /**
     * Notes attribuées pour cette évaluation.
     */
    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
