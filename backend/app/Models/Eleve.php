<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Eleve extends Model
{
    protected $fillable = [

        /*
        |--------------------------------------------------------------------------
        | Établissement et scolarité
        |--------------------------------------------------------------------------
        */

        'etablissement_id',
        'annee_scolaire_id',
        'classe_id',

        /*
        |--------------------------------------------------------------------------
        | Identification
        |--------------------------------------------------------------------------
        */

        'code_eleve',
        'matricule',
        'nom',
        'prenoms',
        'sexe',
        'date_naissance',
        'lieu_naissance',
        'nationalite',
        'photo',

        /*
        |--------------------------------------------------------------------------
        | Informations complémentaires
        |--------------------------------------------------------------------------
        */

        'adresse',
        'telephone',
        'email',

        /*
        |--------------------------------------------------------------------------
        | Situation scolaire
        |--------------------------------------------------------------------------
        */

        'redoublant',
        'boursier',
        'regime',
        'statut',

        /*
        |--------------------------------------------------------------------------
        | Responsable légal
        |--------------------------------------------------------------------------
        */

        'responsable_nom',
        'responsable_prenoms',
        'responsable_telephone',
        'responsable_email',
        'responsable_profession',
        'responsable_adresse',

        /*
        |--------------------------------------------------------------------------
        | Informations médicales
        |--------------------------------------------------------------------------
        */

        'groupe_sanguin',
        'allergies',
        'observations_medicales',
        'contact_urgence_nom',
        'contact_urgence_telephone',

        /*
        |--------------------------------------------------------------------------
        | Statut système
        |--------------------------------------------------------------------------
        */

        'actif',
    ];

    protected $casts = [

        'date_naissance' => 'date',

        'redoublant' => 'boolean',

        'boursier' => 'boolean',

        'actif' => 'boolean',

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

    /**
     * Notes obtenues par cet élève.
     */
    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
