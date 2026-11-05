<?php

use App\Http\Controllers\Api\BusinessUnitController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EquipementController;
use App\Http\Controllers\Api\InterventionController;
use App\Http\Controllers\Api\MagasinController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Authentification (Sanctum)
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('business-units', BusinessUnitController::class);
    Route::apiResource('magasins', MagasinController::class);
   Route::apiResource('equipements', EquipementController::class);
   Route::apiResource('interventions', InterventionController::class);
    Route::apiResource('users', UserController::class);
});


   