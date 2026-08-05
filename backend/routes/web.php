<?php

use App\Http\Controllers\AnneeScolaireController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EtablissementController;
use App\Http\Controllers\NiveauController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\MatiereController;
use App\Http\Controllers\CycleController;
use App\Http\Controllers\SerieController;
use App\Http\Controllers\MaquetteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('etablissements', EtablissementController::class);
    Route::resource('annee-scolaires', AnneeScolaireController::class);
    Route::resource('niveaux', NiveauController::class);
    Route::resource('classes', ClasseController::class);
    Route::resource('matieres', MatiereController::class);
    Route::resource('cycles', CycleController::class);
    Route::resource('series', SerieController::class);
    Route::resource('maquettes', MaquetteController::class);
});

require __DIR__.'/auth.php';
