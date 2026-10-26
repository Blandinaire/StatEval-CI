<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutrePersonnel extends Model
{
    protected $table = 'autres_personnels';

    protected $fillable = [
        'etablissement_id',
        'fonction_personnel_id',
        'user_id',
        'matricule',
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
        'type',
        'grade',
        'date_embauche',
        'date_prise_service',
        'statut',
        'actif',
        'observations',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
            'date_embauche' => 'date',
            'date_prise_service' => 'date',
            'actif' => 'boolean',
        ];
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function fonction(): BelongsTo
    {
        return $this->belongsTo(
            FonctionPersonnel::class,
            'fonction_personnel_id'
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
