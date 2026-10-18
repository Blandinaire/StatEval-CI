
<?php

use App\Http\Controllers\Api\MobileAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authentification mobile : aucune session Web requise.
Route::post('/mobile/login', [MobileAuthController::class, 'login'])
    ->middleware('throttle:10,1');

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