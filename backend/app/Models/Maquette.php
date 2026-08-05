<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Maquette extends Model
{
    //
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Maquette extends Model
{
    protected $fillable = [
        'etablissement_id',
        'annee_scolaire_id',
        'cycle_id',
        'niveau_id',
        'serie_id',
        'libelle',
        'version',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    // Relations

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

    public function lignes()
    {
        return $this->hasMany(MaquetteMatiere::class);
    }
}