<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EtablissementResponsable extends Model
{
    protected $fillable = [
        'etablissement_id',

        'civilite',

        'nom',
        'prenoms',

        'fonction',

        'telephone',
        'whatsapp',
        'email',

        'actif',
        'principal',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATION
    |--------------------------------------------------------------------------
    */

    public function etablissement()
    {
        return $this->belongsTo(
            Etablissement::class
        );
    }

    public function user()
    {
        return $this->hasOne(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | FORMATAGE DES ATTRIBUTS
    |--------------------------------------------------------------------------
    */

    public function getNomAttribute($value)
    {
        return mb_strtoupper(
            $value ?? '',
            'UTF-8'
        );
    }

    public function getPrenomsAttribute($value)
    {
        return mb_convert_case(
            mb_strtolower(
                $value ?? '',
                'UTF-8'
            ),
            MB_CASE_TITLE,
            'UTF-8'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | NOM COMPLET
    |--------------------------------------------------------------------------
    */

    public function getNomCompletAttribute()
    {
        return trim(
            $this->civilite .
                ' ' .
                $this->prenoms .
                ' ' .
                $this->nom
        );
    }
}
