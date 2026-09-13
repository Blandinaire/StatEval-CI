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
use App\Http\Controllers\UserController;
use App\Http\Controllers\EtablissementResponsableController;
use App\Http\Controllers\EducateurClasseController;
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

    Route::get('/test-superadmin', function () {
        $user = auth()->user();

        return response()->json([
            'connecte' => auth()->check(),
            'id' => $user?->id,
            'nom' => $user?->name,
            'fonction' => $user?->fonction,
            'role_superadmin' => $user?->hasRole('SuperAdmin'),
        ]);
    });
    /*
|--------------------------------------------------------------------------
| ÉTABLISSEMENTS
|--------------------------------------------------------------------------
*/

    /*
|--------------------------------------------------------------------------
| CRÉATION - SUPERADMIN UNIQUEMENT
|--------------------------------------------------------------------------
*/

    Route::middleware('role:SuperAdmin')->group(function () {

        Route::get(
            'etablissements/create',
            [EtablissementController::class, 'create']
        )->name('etablissements.create');


        Route::post(
            'etablissements',
            [EtablissementController::class, 'store']
        )->name('etablissements.store');


        Route::delete(
            'etablissements/{etablissement}',
            [EtablissementController::class, 'destroy']
        )->name('etablissements.destroy');
    });


    /*
|--------------------------------------------------------------------------
| CONSULTATION ET MODIFICATION
|--------------------------------------------------------------------------
*/

    Route::get(
        'etablissements',
        [EtablissementController::class, 'index']
    )->name('etablissements.index');


    Route::get(
        'etablissements/{etablissement}/edit',
        [EtablissementController::class, 'edit']
    )->name('etablissements.edit');


    Route::put(
        'etablissements/{etablissement}',
        [EtablissementController::class, 'update']
    )->name('etablissements.update');


    Route::patch(
        'etablissements/{etablissement}',
        [EtablissementController::class, 'update']
    );


    /*
|--------------------------------------------------------------------------
| FICHE ÉTABLISSEMENT
|--------------------------------------------------------------------------
|
| Cette route doit impérativement venir APRÈS /create
|
*/

    Route::get(
        'etablissements/{etablissement}',
        [EtablissementController::class, 'show']
    )->name('etablissements.show');

    Route::prefix('etablissements/{etablissement}')
        ->name('etablissements.')
        ->group(function () {

            Route::resource(
                'responsables',
                EtablissementResponsableController::class
            )->except([
                'show'
            ]);
        });
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    /*
|--------------------------------------------------------------------------
| RÉFÉRENTIELS - CONSULTATION POUR TOUS LES UTILISATEURS AUTHENTIFIÉS
|--------------------------------------------------------------------------
*/

    Route::resource(
        'annee-scolaires',
        AnneeScolaireController::class
    )->only([
        'index',
    ]);

    Route::resource(
        'cycles',
        CycleController::class
    )->only([
        'index',
    ]);

    Route::resource(
        'niveaux',
        NiveauController::class
    )->only([
        'index',
    ]);

    Route::resource(
        'series',
        SerieController::class
    )->only([
        'index',
    ]);

    Route::resource(
        'matieres',
        MatiereController::class
    )->only([
        'index',
    ]);

    Route::get(
        'maquettes/create',
        [MaquetteController::class, 'create']
    )->middleware('role:SuperAdmin')->name('maquettes.create');

    Route::resource(
        'maquettes',
        MaquetteController::class
    )->only([
        'index',
        'show',
    ]);


    /*
|--------------------------------------------------------------------------
| RÉFÉRENTIELS - GESTION EXCLUSIVE DU SUPERADMIN
|--------------------------------------------------------------------------
*/

    Route::middleware('role:SuperAdmin')->group(function () {


        /*
    |--------------------------------------------------------------------------
    | ANNÉES SCOLAIRES
    |--------------------------------------------------------------------------
    */

        Route::resource(
            'annee-scolaires',
            AnneeScolaireController::class
        )->only([
            'create',
            'store',
            'edit',
            'update',
            'destroy',
        ]);


        /*
    |--------------------------------------------------------------------------
    | CYCLES
    |--------------------------------------------------------------------------
    */

        Route::resource(
            'cycles',
            CycleController::class
        )->only([
            'create',
            'store',
            'edit',
            'update',
            'destroy',
        ]);


        /*
    |--------------------------------------------------------------------------
    | NIVEAUX
    |--------------------------------------------------------------------------
    */

        Route::resource(
            'niveaux',
            NiveauController::class
        )->only([
            'create',
            'store',
            'edit',
            'update',
            'destroy',
        ]);


        /*
    |--------------------------------------------------------------------------
    | SÉRIES
    |--------------------------------------------------------------------------
    */

        Route::resource(
            'series',
            SerieController::class
        )->only([
            'create',
            'store',
            'edit',
            'update',
            'destroy',
        ]);


        /*
    |--------------------------------------------------------------------------
    | MATIÈRES
    |--------------------------------------------------------------------------
    */

        Route::resource(
            'matieres',
            MatiereController::class
        )->only([
            'create',
            'store',
            'edit',
            'update',
            'destroy',
        ]);


        /*
    |--------------------------------------------------------------------------
    | MAQUETTES PÉDAGOGIQUES
    |--------------------------------------------------------------------------
    */

        Route::get(
            'maquette/create',
            fn() => redirect()->route('maquettes.create')
        );

        Route::resource(
            'maquettes',
            MaquetteController::class
        )->only([
            'store',
            'edit',
            'update',
            'destroy',
        ]);
    });


    /*
|--------------------------------------------------------------------------
| CLASSES - GESTION OPÉRATIONNELLE DES ÉTABLISSEMENTS
|--------------------------------------------------------------------------
*/

    Route::resource(
        'classes',
        ClasseController::class
    )->parameters([
        'classes' => 'classe',
    ]);

    Route::get('/users/personnel-options', [
        \App\Http\Controllers\UserController::class,
        'creationPersonnelOptions',
    ])->middleware('auth')->name('users.personnel-options');

    Route::patch('/users/{user}/reset-password', [
        \App\Http\Controllers\UserController::class,
        'resetPassword',
    ])->middleware('auth')->name('users.reset-password');

    Route::middleware('role:SuperAdmin|Administrateur')->group(function () {

        Route::get('/login/personnel-options', [
            \App\Http\Controllers\UserController::class,
            'personnelOptions',
        ])->name('login.personnel-options');

        Route::resource('users', UserController::class)->except(['show']);

        Route::patch(
            'users/{user}/toggle',
            [UserController::class, 'toggle']
        )->name('users.toggle');
    });

    Route::get(
        '/enseignants/import',
        [EnseignantController::class, 'importForm']
    )->name('enseignants.import.form');

    Route::post(
        '/enseignants/import',
        [EnseignantController::class, 'import']
    )->name('enseignants.import');

    Route::get(
        '/enseignants/import-template',
        [EnseignantController::class, 'importTemplate']
    )->name('enseignants.import.template');

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

    Route::get(
        '/absences/{absence}/billet/pdf',
        [AbsenceController::class, 'billetPdf']
    )->name('absences.billet.pdf');

    Route::get(
        '/retards/{retard}/billet/pdf',
        [RetardController::class, 'billetPdf']
    )->name('retards.billet.pdf');

    Route::resource('retards', RetardController::class)
        ->parameters([
            'retards' => 'retard',
        ]);
    Route::resource('educateurs', EducateurController::class)
        ->parameters([
            'educateurs' => 'educateur',
        ]);

    Route::get(
        '/eleves/import',
        [EleveController::class, 'importForm']
    )->name('eleves.import.form');

    Route::post(
        '/eleves/import',
        [EleveController::class, 'import']
    )->name('eleves.import');


    Route::get(
        '/eleves/import/template',
        [EleveController::class, 'importTemplate']
    )->name('eleves.import.template');

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

    /*
|--------------------------------------------------------------------------
| MATIÈRES DES MAQUETTES - CONSULTATION
|--------------------------------------------------------------------------
*/

    Route::get(
        '/maquettes/{maquette}/matieres',
        [MaquetteMatiereController::class, 'index']
    )->name('maquettes.matieres.index');


    /*
|--------------------------------------------------------------------------
| MATIÈRES DES MAQUETTES - SUPERADMIN UNIQUEMENT
|--------------------------------------------------------------------------
*/


    Route::middleware('role:SuperAdmin')->group(function () {

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
    });

    Route::get(
        '/api/enseignants-par-matiere/{matiere}',
        [AffectationController::class, 'enseignantsParMatiere']
    )->name('api.enseignants.matiere');

    Route::get(
        '/api/classes-par-etablissement',
        [EleveController::class, 'classesParEtablissement']
    )->name('api.classes.etablissement');

    Route::get(
        '/api/enseignants-par-matiere/{matiere}',
        [AffectationController::class, 'enseignantsParMatiere']
    )->name('api.enseignants.matiere');

    Route::get(
        '/api/classes-par-etablissement',
        [EleveController::class, 'classesParEtablissement']
    )->name('api.classes.etablissement');


    /*
    |----------------------------------------------------------------------
    | API - NOTES DE CONDUITE
    |----------------------------------------------------------------------
    */

    /*
    | Classes disponibles selon l'établissement et l'année scolaire.
    */
    Route::get(
        '/api/conduites/classes',
        [ConduiteController::class, 'classes']
    )->name('api.conduites.classes');


    /*
    | Élèves d'une classe sélectionnée.
    */
    Route::get(
        '/api/conduites/classes/{classe}/eleves',
        [ConduiteController::class, 'elevesParClasse']
    )->name('api.conduites.eleves');


    /*
    | Enregistrement groupé des notes de conduite.
    */
    Route::post(
        '/conduites/enregistrer-groupe',
        [ConduiteController::class, 'storeGroupe']
    )->name('conduites.store.groupe');


    Route::get('/export/{classeId}/{matiereId}', [StatistiqueController::class, 'export']);

    Route::patch(
        'educateur-classes/{educateurClasse}/toggle',
        [EducateurClasseController::class, 'toggle']
    )->name('educateur-classes.toggle');

    Route::resource('educateur-classes', EducateurClasseController::class)
        ->except(['show']);
});

require __DIR__ . '/auth.php';
