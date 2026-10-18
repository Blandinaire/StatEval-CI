
<?php

use App\Http\Controllers\Api\MobileAuthController;
use App\Models\Etablissement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authentification mobile : aucune session Web requise.
Route::post('/mobile/login', [MobileAuthController::class, 'login'])
    ->middleware('throttle:10,1');

// Liste des établissements actifs pour la connexion mobile.
Route::get('/mobile/etablissements', function () {
    return response()->json(
        Etablissement::query()
            ->where('actif', true)
            ->orderBy('nom')
            ->get(['id', 'nom'])
    );
})->middleware('throttle:30,1');

// Liste du personnel pour la connexion mobile.
Route::get('/mobile/personnel-options', function (Request $request) {
    $validated = $request->validate([
        'etablissement_id' => ['required', 'integer', 'exists:etablissements,id'],
        'role' => [
            'required',
            'string',
            'in:Administrateur,Direction,Professeur,Educateur',
        ],
    ]);

    $etablissement = Etablissement::query()
        ->whereKey($validated['etablissement_id'])
        ->where('actif', true)
        ->firstOrFail();

    $personnel = User::query()
        ->where('etablissement_id', $etablissement->id)
        ->where('actif', true)
        ->whereHas('roles', function ($query) use ($validated) {
            $query->where('name', $validated['role']);
        })
        ->orderBy('name')
        ->get(['id', 'name']);

    return response()->json($personnel);
})->middleware('throttle:60,1');

// Changement obligatoire du mot de passe initial.
// Le contrôleur vérifie que ce changement est réellement requis.
Route::post('/mobile/change-password', [MobileAuthController::class, 'changePassword'])
    ->middleware(['auth:sanctum', 'abilities:password:change', 'throttle:5,1']);

// Déconnexion et profil mobile.
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/mobile/me', function (Request $request) {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'fonction' => $user->fonction,
            'etablissement_id' => $user->etablissement_id,
            'roles' => $user->getRoleNames()->values(),
            'must_change_password' => (bool) $user->must_change_password,
        ]);
    })->middleware('abilities:*');

    Route::post('/mobile/logout', [MobileAuthController::class, 'logout'])
        ->middleware('abilities:*');
});
