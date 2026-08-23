<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRetardRequest;
use App\Http\Requests\UpdateRetardRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Educateur;
use App\Models\Eleve;
use App\Models\Retard;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RetardController extends Controller
{
    /**
     * Liste des retards.
     */
    public function index(): Response
    {
        $retards = Retard::with([
            'eleve',
            'educateur',
            'anneeScolaire',
            'classe',
        ])
            ->orderByDesc('date_retard')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Retards/Index', [
            'retards' => $retards,
        ]);
    }

    /**
     * Formulaire de création.
     */
    public function create(): Response
    {
        return Inertia::render('Retards/Create', [
            'eleves' => Eleve::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'educateurs' => Educateur::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'anneesScolaires' => AnneeScolaire::orderByDesc('id')
                ->get(),

            'classes' => Classe::orderBy('libelle')
                ->get(),
        ]);
    }

    /**
     * Enregistrement d'un retard.
     */
    public function store(
        StoreRetardRequest $request
    ): RedirectResponse {
        $data = $request->validated();

        $data['duree_minutes'] = $this->calculerDureeRetard(
            $data['heure_prevue'] ?? null,
            $data['heure_arrivee'] ?? null
        );

        Retard::create($data);

        return redirect()
            ->route('retards.index')
            ->with(
                'success',
                'Retard enregistré avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(
        Retard $retard
    ): Response {
        return Inertia::render('Retards/Edit', [
            'retard' => $retard,

            'eleves' => Eleve::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'educateurs' => Educateur::orderBy('nom')
                ->orderBy('prenoms')
                ->get(),

            'anneesScolaires' => AnneeScolaire::orderByDesc('id')
                ->get(),

            'classes' => Classe::orderBy('libelle')
                ->get(),
        ]);
    }

    /**
     * Mise à jour d'un retard.
     */
    public function update(
        UpdateRetardRequest $request,
        Retard $retard
    ): RedirectResponse {
        $data = $request->validated();

        $data['duree_minutes'] = $this->calculerDureeRetard(
            $data['heure_prevue'] ?? null,
            $data['heure_arrivee'] ?? null
        );

        $retard->update($data);

        return redirect()
            ->route('retards.index')
            ->with(
                'success',
                'Retard modifié avec succès.'
            );
    }

    /**
     * Suppression d'un retard.
     */
    public function destroy(
        Retard $retard
    ): RedirectResponse {
        $retard->delete();

        return redirect()
            ->route('retards.index')
            ->with(
                'success',
                'Retard supprimé avec succès.'
            );
    }

    /**
     * Calcul automatique de la durée du retard.
     */
    private function calculerDureeRetard(
        ?string $heurePrevue,
        ?string $heureArrivee
    ): int {
        if (!$heurePrevue || !$heureArrivee) {
            return 0;
        }

        $prevue = Carbon::createFromFormat(
            'H:i',
            substr($heurePrevue, 0, 5)
        );

        $arrivee = Carbon::createFromFormat(
            'H:i',
            substr($heureArrivee, 0, 5)
        );

        if ($arrivee->lessThanOrEqualTo($prevue)) {
            return 0;
        }

        return $prevue->diffInMinutes($arrivee);
    }
}