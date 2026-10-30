<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use App\Models\EtablissementResponsable;
use App\Models\Etablissement;
use App\Models\Educateur;
use App\Models\Enseignant;

#[Fillable([
    'name',
    'email',
    'telephone',
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
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

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

    public function autrePersonnel(): HasOne
    {
        return $this->hasOne(AutrePersonnel::class, 'user_id');
    }

    /**
     * Élèves associés au compte parent.
     */
    public function eleves(): BelongsToMany
    {
        return $this->belongsToMany(
            Eleve::class,
            'eleve_parent',
            'user_id',
            'eleve_id'
        )
            ->withPivot('lien')
            ->withTimestamps();
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
