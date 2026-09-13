<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

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

    public function user()
    {
        return $this->hasOne(User::class);
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
    public function affectations()
    {
        return $this->hasMany(Affectation::class);
    }
    protected static function booted()
    {
        static::creating(function ($enseignant) {
            $enseignant->nom = mb_strtoupper(trim($enseignant->nom), 'UTF-8');
            $enseignant->prenoms = mb_strtoupper(trim($enseignant->prenoms), 'UTF-8');
        });

        static::updating(function ($enseignant) {
            $enseignant->nom = mb_strtoupper(trim($enseignant->nom), 'UTF-8');
            $enseignant->prenoms = mb_strtoupper(trim($enseignant->prenoms), 'UTF-8');
        });
    }
}
