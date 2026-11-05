<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
    // Personnaliser la redirection des invités (non authentifiés)
    $middleware->redirectGuestsTo(function ($request) {
        // Si c'est une requête API, répondre en JSON avec 401
        if ($request->is('api/*')) {
            abort(response()->json(['message' => 'Unauthenticated.'], 401));
        }
        // Sinon, rediriger vers la page de login (si vous en avez une)
        return route('login');
    });

    // (Optionnel) Si vous voulez désactiver le mode stateful pour l'API,
    // ne pas ajouter EnsureFrontendRequestsAreStateful dans le groupe api
    // comme vu précédemment.
})
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
