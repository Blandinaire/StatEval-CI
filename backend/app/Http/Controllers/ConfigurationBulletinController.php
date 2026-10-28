<?php

namespace App\Http\Controllers;

use App\Models\ConfigurationBulletin;
use App\Models\Etablissement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ConfigurationBulletinController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('SuperAdmin');

        $etablissements = $isSuperAdmin
            ? Etablissement::orderBy('nom')->get(['id', 'nom'])
            : collect();

        $etablissementId = $isSuperAdmin
            ? $request->integer('etablissement_id')
            : $user->etablissement_id;

        $configuration = null;

        if ($etablissementId) {
            $etablissementAutorise = $isSuperAdmin
                ? Etablissement::whereKey($etablissementId)->exists()
                : (int) $etablissementId === (int) $user->etablissement_id;

            if ($etablissementAutorise) {
                $configuration = ConfigurationBulletin::firstOrCreate(
                    ['etablissement_id' => $etablissementId],
                    [
                        'format' => 'a4',
                        'afficher_appreciations' => true,
                        'afficher_professeurs' => true,
                        'afficher_rang' => true,
                        'afficher_absences_retards' => true,
                        'afficher_conduite' => true,
                        'afficher_observations' => true,
                        'afficher_directeur' => true,
                        'afficher_signatures' => true,
                    ]
                );
            }
        }

        return Inertia::render('ConfigurationsBulletins/Index', [
            'configuration' => $configuration,
            'etablissements' => $etablissements,
            'etablissementSelectionne' => $etablissementId ?: null,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('SuperAdmin');

        $etablissementId = $isSuperAdmin
            ? $request->integer('etablissement_id')
            : $user->etablissement_id;

        abort_unless($etablissementId, 422, 'Veuillez sélectionner un établissement.');

        $etablissementAutorise = $isSuperAdmin
            ? Etablissement::whereKey($etablissementId)->exists()
            : (int) $etablissementId === (int) $user->etablissement_id;

        abort_unless($etablissementAutorise, 403);

        $validated = $request->validate([
            'format' => [
                'required',
                Rule::in(['a4', 'souche', 'double']),
            ],
            'afficher_appreciations' => ['required', 'boolean'],
            'afficher_professeurs' => ['required', 'boolean'],
            'afficher_rang' => ['required', 'boolean'],
            'afficher_absences_retards' => ['required', 'boolean'],
            'afficher_conduite' => ['required', 'boolean'],
            'afficher_observations' => ['required', 'boolean'],
            'afficher_directeur' => ['required', 'boolean'],
            'afficher_signatures' => ['required', 'boolean'],
        ]);

        ConfigurationBulletin::updateOrCreate(
            ['etablissement_id' => $etablissementId],
            $validated
        );

        return redirect()
            ->route('configurations-bulletins.index', $isSuperAdmin
                ? ['etablissement_id' => $etablissementId]
                : [])
            ->with('success', 'Configuration des bulletins enregistrée.');
    }
}
