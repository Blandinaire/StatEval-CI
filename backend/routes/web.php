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
use App\Http\Controllers\MaquetteMatiereController;
use App\Http\Controllers\EnseignantController;
use App\Http\Controllers\AffectationController;
use App\Http\Controllers\EleveController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\StatistiqueController;
use App\Http\Controllers\EducateurController;
use App\Http\Controllers\ConduiteController;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\RetardController;
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
    Route::resource('enseignants', EnseignantController::class);
    Route::resource('affectations', AffectationController::class);
    Route::resource('conduites', ConduiteController::class)
        ->parameters([
            'conduites' => 'conduite',
        ]);
    Route::resource('absences', AbsenceController::class)
        ->parameters([
            'absences' => 'absence',
        ]);
    Route::resource('retards', RetardController::class)
        ->parameters([
            'retards' => 'retard',
        ]);
    Route::resource('educateurs', EducateurController::class)
        ->parameters([
            'educateurs' => 'educateur',
        ]);
    Route::resource('eleves', EleveController::class)

        ->parameters([
            'eleves' => 'eleve',
        ]);
    Route::resource('evaluations', EvaluationController::class);

    Route::get(
        '/evaluations/{evaluation}/statistiques',
        [EvaluationController::class, 'statistiques']
    )->name('evaluations.statistiques');

    Route::get(
        '/evaluations/{evaluation}/notes/create',
        [NoteController::class, 'create']
    )->name('notes.create');

    Route::post(
        '/evaluations/{evaluation}/notes',
        [NoteController::class, 'store']
    )->name('notes.store');

    Route::get('/notes', [NoteController::class, 'index'])
        ->name('notes.index');

    Route::get(
        '/statistiques',
        [StatistiqueController::class, 'index']
    )->name('statistiques.index');

    // Matières d'une maquette

    Route::get(
        '/maquettes/{maquette}/matieres',
        [MaquetteMatiereController::class, 'index']
    )->name('maquettes.matieres.index');

    Route::get(
        '/maquettes/{maquette}/matieres/create',
        [MaquetteMatiereController::class, 'create']
    )->name('maquettes.matieres.create');

    Route::post(
        '/maquettes/{maquette}/matieres',
        [MaquetteMatiereController::class, 'store']
    )->name('maquettes.matieres.store');

    Route::get(
        '/maquettes/{maquette}/matieres/{maquetteMatiere}/edit',
        [MaquetteMatiereController::class, 'edit']
    )->name('maquettes.matieres.edit');

    Route::put(
        '/maquettes/{maquette}/matieres/{maquetteMatiere}',
        [MaquetteMatiereController::class, 'update']
    )->name('maquettes.matieres.update');

    Route::delete(
        '/maquettes/{maquette}/matieres/{maquetteMatiere}',
        [MaquetteMatiereController::class, 'destroy']
    )->name('maquettes.matieres.destroy');

    Route::post(
        '/maquettes/{maquette}/matieres/{maquetteMatiere}/monter',
        [MaquetteMatiereController::class, 'monter']
    )->name('maquettes.matieres.monter');

    Route::post(
        '/maquettes/{maquette}/matieres/{maquetteMatiere}/descendre',
        [MaquetteMatiereController::class, 'descendre']
    )->name('maquettes.matieres.descendre');

    Route::get(
        '/api/enseignants-par-matiere/{matiere}',
        [AffectationController::class, 'enseignantsParMatiere']
    )->name('api.enseignants.matiere');

    Route::get(
        '/api/classes-par-etablissement',
        [EleveController::class, 'classesParEtablissement']
    )->name('api.classes.etablissement');

    Route::get('/export/{classeId}/{matiereId}', [StatistiqueController::class, 'export']);
});

require __DIR__ . '/auth.php';
