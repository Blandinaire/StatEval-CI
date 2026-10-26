<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FonctionPersonnel extends Model
{
    protected $table = 'fonctions_personnel';

    protected $fillable = [
        'libelle',
        'description',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
        ];
    }

    /**
     * Personnels exerçant cette fonction.
     */
    public function personnels(): HasMany
    {
        return $this->hasMany(
            AutrePersonnel::class,
            'fonction_personnel_id'
        );
    }
}
