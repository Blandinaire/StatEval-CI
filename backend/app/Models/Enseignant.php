<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enseignant extends Model
{
    protected $fillable = [

        'etablissement_id',

        'matiere_principale_id',

        'matiere_secondaire_id',

        'nom',
        'prenoms',
        'sexe',
        'date_naissance',
        'lieu_naissance',
        'nationalite',
        'telephone',
        'email',
        'adresse',
        'photo',
        'matricule',
        'matricule_fonction_publique',
        'type',
        'grade',
        'diplome',
        'date_embauche',
        'date_prise_service',
        'volume_horaire',
        'nb_classes_max',
        'statut',
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

    public function matierePrincipale()
    {
        return $this->belongsTo(
            Matiere::class,
            'matiere_principale_id'
        );
    }

    public function matiereSecondaire()
    {
        return $this->belongsTo(
            Matiere::class,
            'matiere_secondaire_id'
        );
    }
}