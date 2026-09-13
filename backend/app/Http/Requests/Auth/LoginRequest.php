<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mode' => ['required', 'in:superadmin,personnel'],

            'email' => [
                'required_if:mode,superadmin',
                'nullable',
                'email',
            ],

            'etablissement_id' => [
                'required_if:mode,personnel',
                'nullable',
                'integer',
                'exists:etablissements,id',
            ],

            'role' => [
                'required_if:mode,personnel',
                'nullable',
                'string',
                'in:Administrateur,Direction,Professeur,Educateur',
            ],

            'user_id' => [
                'required_if:mode,personnel',
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'password' => [
                'required',
                'string',
            ],

            'remember' => [
                'boolean',
            ],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if ($this->mode === 'superadmin') {
            $success = Auth::attempt([
                'email' => $this->email,
                'password' => $this->password,
                'actif' => true,
            ], $this->boolean('remember'));

            if (!$success) {
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'email' => 'Identifiants incorrects.',
                ]);
            }
        } else {
            $user = \App\Models\User::with('roles')
                ->where('id', $this->user_id)
                ->where('etablissement_id', $this->etablissement_id)
                ->where('actif', true)
                ->first();

            if (
                !$user ||
                !$user->hasRole($this->role) ||
                !Hash::check($this->password, $user->password)
            ) {
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'user_id' => 'Identifiants incorrects.',
                ]);
            }

            Auth::login($user, $this->boolean('remember'));
        }

        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (!RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'password' => "Trop de tentatives. Réessayez dans {$seconds} secondes.",
        ]);
    }

    public function throttleKey(): string
    {
        if ($this->mode === 'superadmin') {
            return Str::transliterate(
                Str::lower($this->email) . '|' . $this->ip()
            );
        }

        return implode('|', [
            'personnel',
            $this->etablissement_id,
            $this->role,
            $this->user_id,
            $this->ip(),
        ]);
    }
}
