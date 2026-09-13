<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Educateur extends Model
{
    protected $fillable = [
        'etablissement_id',
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
        'type',
        'grade',
        'diplome',
        'date_embauche',
        'date_prise_service',
        'statut',
        'actif',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'date_embauche' => 'date',
        'date_prise_service' => 'date',
        'actif' => 'boolean',
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

    public function conduites()
    {
        return $this->hasMany(Conduite::class);
    }

    public function absences()
    {
        return $this->hasMany(Absence::class);
    }

    public function retards()
    {
        return $this->hasMany(Retard::class);
    }

    public function affectationsClasses(): HasMany
    {
        return $this->hasMany(EducateurClasse::class);
    }
}
