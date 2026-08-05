<?php

namespace App\Http\Controllers;

use App\Models\Etablissement;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'etablissements' => Etablissement::count(),
                'eleves' => 0,
                'enseignants' => 0,
                'classes' => 0,
            ],
        ]);
    }
}