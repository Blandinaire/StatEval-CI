<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfigurationBulletin extends Model
{
    protected $table = 'configurations_bulletins';

    protected $fillable = [
        'etablissement_id',
        'format',
        'afficher_appreciations',
        'afficher_professeurs',
        'afficher_rang',
        'afficher_absences_retards',
        'afficher_conduite',
        'afficher_observations',
        'afficher_directeur',
        'afficher_signatures',
        'options_supplementaires',
    ];

    protected function casts(): array
    {
        return [
            'afficher_appreciations' => 'boolean',
            'afficher_professeurs' => 'boolean',
            'afficher_rang' => 'boolean',
            'afficher_absences_retards' => 'boolean',
            'afficher_conduite' => 'boolean',
            'afficher_observations' => 'boolean',
            'afficher_directeur' => 'boolean',
            'afficher_signatures' => 'boolean',
            'options_supplementaires' => 'array',
        ];
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
