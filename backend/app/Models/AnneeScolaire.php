<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnneeScolaire extends Model
{
    protected $fillable = [
        'libelle',
        'date_debut',
        'date_fin',
        'active',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'active' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function classes()
    {
        return $this->hasMany(Classe::class);
    }

    public function maquettes()
    {
        return $this->hasMany(Maquette::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Année scolaire active
    |--------------------------------------------------------------------------
    */

    /**
     * Retourne l'année scolaire actuellement active.
     *
     * Exemple :
     * $anneeActive = AnneeScolaire::active();
     */
    public static function active(): ?self
    {
        return static::where('active', true)->first();
    }

    /**
     * Retourne l'identifiant de l'année scolaire active.
     *
     * Exemple :
     * $anneeId = AnneeScolaire::activeId();
     */
    public static function activeId(): ?int
    {
        return static::where('active', true)->value('id');
    }

    public function affectationsEducateurs(): HasMany
    {
        return $this->hasMany(EducateurClasse::class);
    }
}
