<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMaquetteMatiereRequest;
use App\Models\Maquette;
use App\Models\Matiere;
use App\Models\MaquetteMatiere;
use App\Services\MaquetteMatiereService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MaquetteMatiereController extends Controller
{
    public function __construct(
        protected MaquetteMatiereService $service
    ) {}

    /**
     * Liste des matières d'une maquette.
     */
    public function index(Maquette $maquette)
    {
        $maquette->load([
            'anneeScolaire',
            'cycle',
            'niveau',
            'serie',
        ]);

        $lignes = $maquette->lignes()
            ->with('matiere')
            ->orderBy('ordre')
            ->orderBy('id')
            ->get();

        return Inertia::render('MaquettesMatieres/Index', [
            'maquette' => $maquette,
            'lignes' => $lignes,
        ]);
    }

    /**
     * Formulaire d'ajout.
     */
    public function create(Maquette $maquette)
    {
        $matieresDejaAjoutees = $maquette->lignes()
            ->pluck('matiere_id');

        $matieres = Matiere::whereNotIn(
            'id',
            $matieresDejaAjoutees
        )
            ->orderBy('libelle')
            ->get();

        return Inertia::render('MaquettesMatieres/Create', [
            'maquette' => $maquette,
            'matieres' => $matieres,
        ]);
    }

    /**
     * Enregistrement d'une matière.
     */
    public function store(StoreMaquetteMatiereRequest $request)
    {
        $this->service->create(
            $request->validated()
        );

        return redirect()
            ->route(
                'maquettes.matieres.index',
                $request->maquette_id
            )
            ->with(
                'success',
                'Matière ajoutée avec succès.'
            );
    }

    /**
     * Formulaire de modification.
     */
    public function edit(
        Maquette $maquette,
        MaquetteMatiere $maquetteMatiere
    ) {
        abort_unless(
            (int) $maquetteMatiere->maquette_id ===
                (int) $maquette->id,
            404
        );

        return Inertia::render('MaquettesMatieres/Edit', [
            'maquette' => $maquette,
            'ligne' => $maquetteMatiere,
            'matieres' => Matiere::orderBy('libelle')->get(),
        ]);
    }

    /**
     * Mise à jour d'une matière.
     */
    public function update(
        StoreMaquetteMatiereRequest $request,
        Maquette $maquette,
        MaquetteMatiere $maquetteMatiere
    ) {
        abort_unless(
            (int) $maquetteMatiere->maquette_id ===
                (int) $maquette->id,
            404
        );

        $this->service->update(
            $maquetteMatiere,
            $request->validated()
        );

        return redirect()
            ->route(
                'maquettes.matieres.index',
                $maquette->id
            )
            ->with(
                'success',
                'Matière modifiée avec succès.'
            );
    }

    /**
     * Suppression d'une matière.
     */
    public function destroy(
        Maquette $maquette,
        MaquetteMatiere $maquetteMatiere
    ) {
        abort_unless(
            (int) $maquetteMatiere->maquette_id ===
                (int) $maquette->id,
            404
        );

        $this->service->delete($maquetteMatiere);

        return redirect()
            ->route(
                'maquettes.matieres.index',
                $maquette->id
            )
            ->with(
                'success',
                'Matière supprimée avec succès.'
            );
    }

    /**
     * Enregistrement global de l'ordre des matières.
     *
     * Le frontend transmet un tableau d'identifiants
     * dans l'ordre souhaité.
     */
    public function enregistrerOrdre(
        Request $request,
        Maquette $maquette
    ) {
            $validated = $request->validate([
            'ordre' => [
                'required',
                'array',
                'min:1',
            ],

            'ordre.*' => [
                'required',
                'integer',
                'distinct',
                'exists:maquette_matieres,id',
            ],
        ]);

        $ids = array_map(
            'intval',
            $validated['ordre']
        );

        /*
     * Récupérer toutes les lignes appartenant
     * à cette maquette.
     */
        $idsMaquette = $maquette->lignes()
            ->orderBy('id')
            ->pluck('id')
            ->map(fn($id) => (int) $id)
            ->all();

        /*
     * Vérifier que le frontend transmet exactement
     * toutes les lignes de la maquette.
     */
        $idsTransmisTries = $ids;
        $idsMaquetteTries = $idsMaquette;

        sort($idsTransmisTries);
        sort($idsMaquetteTries);

        if ($idsTransmisTries !== $idsMaquetteTries) {
            return back()->withErrors([
                'ordre' =>
                'Le classement transmis ne correspond pas aux matières de cette maquette. Rechargez la page et réessayez.',
            ]);
        }

        /*
     * Mise à jour atomique de l'ordre.
     */
        DB::transaction(function () use ($maquette, $ids) {
            foreach ($ids as $index => $id) {
                $maquette->lignes()
                    ->whereKey($id)
                    ->update([
                        'ordre' => $index + 1,
                    ]);
            }
        });

        return redirect()
            ->route(
                'maquettes.matieres.index',
                $maquette->id
            )
            ->with(
                'success',
                'Ordre des matières enregistré avec succès.'
            );
    }

    /**
     * Ancienne méthode de déplacement vers le haut.
     * Conservée pour compatibilité avec les anciennes routes.
     */
    public function monter(
        Maquette $maquette,
        MaquetteMatiere $maquetteMatiere
    ) {
        abort_unless(
            (int) $maquetteMatiere->maquette_id ===
                (int) $maquette->id,
            404
        );

        $this->service->monter($maquetteMatiere);

        return redirect()
            ->route(
                'maquettes.matieres.index',
                $maquette->id
            );
    }

    /**
     * Ancienne méthode de déplacement vers le bas.
     * Conservée pour compatibilité avec les anciennes routes.
     */
    public function descendre(
        Maquette $maquette,
        MaquetteMatiere $maquetteMatiere
    ) {
        abort_unless(
            (int) $maquetteMatiere->maquette_id ===
                (int) $maquette->id,
            404
        );

        $this->service->descendre($maquetteMatiere);

        return redirect()
            ->route(
                'maquettes.matieres.index',
                $maquette->id
            );
    }
}
