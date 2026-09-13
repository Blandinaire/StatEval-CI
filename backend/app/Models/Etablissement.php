<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Etablissement extends Model
{
    protected $fillable = [

        /*
        |--------------------------------------------------------------------------
        | IDENTITÉ
        |--------------------------------------------------------------------------
        */

        'nom',
        'sigle',
        'code',
        'type',

        /*
        |--------------------------------------------------------------------------
        | IDENTITÉ COMPLÉMENTAIRE
        |--------------------------------------------------------------------------
        */

        'devise',
        'slogan',

        /*
        |--------------------------------------------------------------------------
        | LOCALISATION
        |--------------------------------------------------------------------------
        */

        'adresse',
        'quartier',
        'commune',
        'ville',
        'region',

        /*
        |--------------------------------------------------------------------------
        | ADMINISTRATION ÉDUCATIVE
        |--------------------------------------------------------------------------
        */

        'direction_regionale',
        'inspection',
        'academie',

        /*
        |--------------------------------------------------------------------------
        | CONTACTS
        |--------------------------------------------------------------------------
        */

        'telephone',
        'telephone_secondaire',
        'whatsapp',
        'email',
        'site_web',

        /*
        |--------------------------------------------------------------------------
        | RESPONSABLE PRINCIPAL
        |--------------------------------------------------------------------------
        */

        'directeur',

        /*
        |--------------------------------------------------------------------------
        | LOGO
        |--------------------------------------------------------------------------
        */

        'logo',

        /*
        |--------------------------------------------------------------------------
        | STATUT
        |--------------------------------------------------------------------------
        */

        'actif',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function maquettes()
    {
        return $this->hasMany(Maquette::class);
    }

    public function responsables()
    {
        return $this->hasMany(
            EtablissementResponsable::class
        );
    }

    public function responsablePrincipal()
    {
        return $this->hasOne(
            EtablissementResponsable::class
        )->where('principal', true);
    }

    public function utilisateurs()
    {
        return $this->hasMany(User::class);
    }

    public function affectationsEducateurs(): HasMany
    {
        return $this->hasMany(EducateurClasse::class);
    }
}
