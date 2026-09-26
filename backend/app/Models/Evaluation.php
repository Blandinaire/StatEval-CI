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
        'niveau_id',
        'classe_id',

        /*
        |--------------------------------------------------------------------------
        | Matière et enseignant
        |--------------------------------------------------------------------------
        */

        'matiere_id',
        'enseignant_id',
        'origine',
        'statut',
        'cree_par',

        /*
        |--------------------------------------------------------------------------
        | Identification
        |--------------------------------------------------------------------------
        */

        'libelle',
        'type',
        'numero',
        'date_evaluation',
        'heure_debut',
        'heure_fin',

        /*
        |--------------------------------------------------------------------------
        | Notation
        |--------------------------------------------------------------------------
        */

        'bareme',
        'coefficient',
        'prise_en_compte_moyenne',
        'notifier_professeurs',
        'publier_eleves',
        'publier_parents',

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

        'prise_en_compte_moyenne' => 'boolean',
        'notifier_professeurs' => 'boolean',
        'publier_eleves' => 'boolean',
        'publier_parents' => 'boolean',

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

    public function niveau()
    {
        return $this->belongsTo(
            Niveau::class
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

    public function classes()
    {
        return $this->belongsToMany(Classe::class, 'evaluation_classes')
            ->withPivot('enseignant_id')
            ->withTimestamps();
    }

    public function createur()
    {
        return $this->belongsTo(User::class, 'cree_par');
    }
}
