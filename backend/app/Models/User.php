<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use App\Models\EtablissementResponsable;
use App\Models\Etablissement;
use App\Models\Educateur;
use App\Models\Enseignant;

#[Fillable([
    'name',
    'email',
    'password',
    'fonction',
    'etablissement_id',
    'enseignant_id',
    'educateur_id',
    'actif',
    'initial_password',
    'must_change_password',
    'etablissement_responsable_id',
])]
#[Hidden([
    'password',
    'remember_token',
])]
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    /*
    |--------------------------------------------------------------------------
    | Établissement
    |--------------------------------------------------------------------------
    */

    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Enseignant
    |--------------------------------------------------------------------------
    */

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function etablissementResponsable()
    {
        return $this->belongsTo(EtablissementResponsable::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Éducateur
    |--------------------------------------------------------------------------
    */

    public function educateur()
    {
        return $this->belongsTo(Educateur::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Casts
    |--------------------------------------------------------------------------
    */

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'actif' => 'boolean',
            'must_change_password' => 'boolean',
            'initial_password' => 'encrypted',
        ];
    }
}
