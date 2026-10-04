<?php

namespace App\Http\Controllers;

use App\Models\CreneauHoraire;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CreneauHoraireController extends Controller
{
    /**
     * Affichage et gestion des créneaux horaires.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        abort_unless($user->hasAnyRole(['SuperAdmin', 'Administrateur', 'Direction']), 403);

        return redirect()->route('emplois-du-temps.index');
    }

    /**
     * Création d'un créneau.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Directeur',
                'Direction',
            ]),
            403
        );

        $etablissementId = $user->hasRole('SuperAdmin')
            ? $request->integer('etablissement_id')
            : (int) $user->etablissement_id;

        abort_unless($etablissementId, 422, 'Sélectionnez un établissement.');

        $validated = $request->validate([
            'libelle' => [
                'required',
                'string',
                'max:100',
            ],
            'type' => ['required', 'in:cours,pause'],
            'heure_debut' => [
                'required',
                'date_format:H:i',
            ],
            'heure_fin' => [
                'required',
                'date_format:H:i',
                'after:heure_debut',
            ],
            'ordre' => ['required', 'integer', 'min:1'],
        ]);

        $this->verifierAbsenceChevauchement(
            $etablissementId,
            $validated['heure_debut'],
            $validated['heure_fin']
        );

        CreneauHoraire::create([
            'etablissement_id' => $etablissementId,
            'libelle' => $validated['libelle'],
            'type' => $validated['type'],
            'heure_debut' => $validated['heure_debut'],
            'heure_fin' => $validated['heure_fin'],
            'ordre' => $validated['ordre'],
            'actif' => true,
        ]);

        return back()->with(
            'success',
            'Créneau horaire ajouté avec succès.'
        );
    }

    /**
     * Modification d'un créneau.
     */
    public function update(
        Request $request,
        CreneauHoraire $creneau
    ) {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Directeur',
                'Direction',
            ]),
            403
        );

        $this->verifierAcces($user, $creneau);

        $validated = $request->validate([
            'libelle' => [
                'required',
                'string',
                'max:100',
            ],
            'type' => ['required', 'in:cours,pause'],
            'heure_debut' => [
                'required',
                'date_format:H:i',
            ],
            'heure_fin' => [
                'required',
                'date_format:H:i',
                'after:heure_debut',
            ],
            'ordre' => ['required', 'integer', 'min:1'],
        ]);

        $this->verifierAbsenceChevauchement(
            (int) $creneau->etablissement_id,
            $validated['heure_debut'],
            $validated['heure_fin'],
            (int) $creneau->id
        );

        $creneau->update($validated);

        return back()->with(
            'success',
            'Créneau horaire modifié avec succès.'
        );
    }

    /**
     * Activer / désactiver un créneau.
     */
    public function toggle(
        Request $request,
        CreneauHoraire $creneau
    ) {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Directeur',
                'Direction',
            ]),
            403
        );

        $this->verifierAcces($user, $creneau);

        $creneau->update([
            'actif' => !$creneau->actif,
        ]);

        return back()->with(
            'success',
            $creneau->actif
                ? 'Créneau activé avec succès.'
                : 'Créneau désactivé avec succès.'
        );
    }

    /**
     * Suppression d'un créneau.
     *
     * Un créneau déjà utilisé dans un emploi du temps
     * ne doit pas être supprimé.
     */
    public function destroy(
        Request $request,
        CreneauHoraire $creneau
    ) {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole([
                'SuperAdmin',
                'Administrateur',
                'Directeur',
                'Direction',
            ]),
            403
        );

        $this->verifierAcces($user, $creneau);

        if ($creneau->lignes()->exists()) {
            return back()->with(
                'error',
                'Ce créneau est déjà utilisé dans un emploi du temps. '
                    . 'Veuillez le désactiver plutôt que le supprimer.'
            );
        }

        $creneau->delete();

        return back()->with(
            'success',
            'Créneau horaire supprimé avec succès.'
        );
    }

    /**
     * Vérifie qu'un utilisateur ne manipule pas
     * un créneau appartenant à un autre établissement.
     */
    private function verifierAcces(
        $user,
        CreneauHoraire $creneau
    ): void {
        if (
            !$user->hasRole('SuperAdmin')
            && (int) $creneau->etablissement_id !== (int) $user->etablissement_id
        ) {
            abort(403);
        }
    }

    private function verifierAbsenceChevauchement(
        int $etablissementId,
        string $debut,
        string $fin,
        ?int $ignoreId = null
    ): void {
        $chevauchement = CreneauHoraire::query()
            ->where('etablissement_id', $etablissementId)
            ->where('actif', true)
            ->when($ignoreId, fn($query) => $query->where('id', '!=', $ignoreId))
            ->where('heure_debut', '<', $fin)
            ->where('heure_fin', '>', $debut)
            ->exists();

        if ($chevauchement) {
            throw ValidationException::withMessages([
                'heure_debut' => 'Cet horaire chevauche un autre créneau actif.',
            ]);
        }
    }
}
