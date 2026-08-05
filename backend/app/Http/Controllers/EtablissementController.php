<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEtablissementRequest;
use App\Http\Requests\UpdateEtablissementRequest;
use App\Models\Etablissement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EtablissementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Etablissements/Index', [
            'etablissements' => Etablissement::orderBy('nom')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Etablissements/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEtablissementRequest $request)
{
    Etablissement::create($request->validated());

    return redirect()
        ->route('etablissements.index')
        ->with('success', 'Établissement créé avec succès.');
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
