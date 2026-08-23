<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Eleve extends Model
{
    protected $fillable = [

        'etablissement_id',
        'annee_scolaire_id',
        'classe_id',

        'code_eleve',
        'matricule',
        'nom',
        'prenoms',
        'sexe',
        'date_naissance',
        'lieu_naissance',
        'nationalite',
        'photo',

        'adresse',
        'telephone',
        'email',

        'redoublant',
        'boursier',
        'regime',
        'statut',
        'statut_affectation',

        'pere_nom',
        'pere_prenoms',
        'pere_telephone',
        'pere_email',
        'pere_profession',
        'pere_adresse',

        'mere_nom',
        'mere_prenoms',
        'mere_telephone',
        'mere_email',
        'mere_profession',
        'mere_adresse',

        'type_tuteur',

        'responsable_nom',
        'responsable_prenoms',
        'responsable_telephone',
        'responsable_email',
        'responsable_profession',
        'responsable_adresse',

        'groupe_sanguin',
        'allergies',
        'observations_medicales',
        'contact_urgence_nom',
        'contact_urgence_telephone',

        'actif',
    ];

    protected $casts = [

        /*
        |--------------------------------------------------------------------------
        | Dates
        |--------------------------------------------------------------------------
        */

        'date_naissance' => 'date',

        /*
        |--------------------------------------------------------------------------
        | Booléens
        |--------------------------------------------------------------------------
        */

        'redoublant' => 'boolean',
        'boursier' => 'boolean',
        'actif' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    /**
     * Établissement fréquenté par l'élève.
     */
    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }

    /**
     * Année scolaire de l'élève.
     */
    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    /**
     * Classe de l'élève.
     */
    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    /**
     * Notes obtenues par l'élève.
     */
    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    /**
     * Conduites de l'élève.
     */
    public function conduites()
    {
        return $this->hasMany(Conduite::class);
    }

    /**
     * Absences de l'élève.
     */
    public function absences()
    {
        return $this->hasMany(Absence::class);
    }

    /**
     * Retards de l'élève.
     */
    public function retards()
    {
        return $this->hasMany(Retard::class);
    }
}
