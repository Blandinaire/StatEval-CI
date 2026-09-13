<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conduite extends Model
{
    protected $fillable = [
        'eleve_id',
        'educateur_id',
        'annee_scolaire_id',
        'classe_id',
        'evaluation_id',
        'periode',
        'note',
        'observation',
    ];

    protected $casts = [
        'note' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }

    public function educateur()
    {
        return $this->belongsTo(Educateur::class);
    }

    public function anneeScolaire()
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function evaluation()
    {
        return $this->belongsTo(Evaluation::class);
    }
}