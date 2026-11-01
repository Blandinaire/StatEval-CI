<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Eleve;

class Classe extends Model
{
    use HasFactory;

    protected $fillable = [
        'etablissement_id',
        'annee_scolaire_id',
        'cycle_id',
        'niveau_id',
        'serie_id',
        'maquette_id',
        'libelle',
        'salle_par_defaut',
        'salle_id',
        'professeur_principal_id',
        'delegue_id',
        'sous_delegue_id',
        'observations',
        'capacite',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
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

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    public function cycle()
    {
        return $this->belongsTo(Cycle::class);
    }

    public function niveau()
    {
        return $this->belongsTo(Niveau::class);
    }

    public function serie()
    {
        return $this->belongsTo(Serie::class);
    }

    public function maquette()
    {
        return $this->belongsTo(Maquette::class);
    }

    public function affectationsEducateurs(): HasMany
    {
        return $this->hasMany(EducateurClasse::class);
    }

    public function eleves(): HasMany
    {
        return $this->hasMany(Eleve::class);
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }

    public function professeurPrincipal()
    {
        return $this->belongsTo(Enseignant::class, 'professeur_principal_id');
    }

    public function delegue()
    {
        return $this->belongsTo(Eleve::class, 'delegue_id');
    }

    public function sousDelegue()
    {
        return $this->belongsTo(Eleve::class, 'sous_delegue_id');
    }
}
