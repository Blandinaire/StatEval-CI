<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EducateurClasse extends Model
{
    use HasFactory;

    protected $table = 'educateur_classes';

    protected $fillable = [
        'etablissement_id',
        'annee_scolaire_id',
        'educateur_id',
        'classe_id',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function anneeScolaire(): BelongsTo
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    public function educateur(): BelongsTo
    {
        return $this->belongsTo(Educateur::class);
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }
}