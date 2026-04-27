<?php

use App\Exceptions\PlanLimitExceededException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (PlanLimitExceededException $e, Request $request) {
            return response()->json([
                'data'    => null,
                'message' => $e->getMessage(),
                'status'  => 422,
            ], 422);
        });

        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'data'    => null,
                    'message' => 'Recurso no encontrado.',
                    'status'  => 404,
                ], 404);
            }
        });

        $exceptions->render(function (AuthorizationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'data'    => null,
                    'message' => 'No tienes permiso para realizar esta acción.',
                    'status'  => 403,
                ], 403);
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'data'    => null,
                    'message' => 'Datos inválidos.',
                    'status'  => 422,
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (TooManyRequestsHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'data'    => null,
                    'message' => 'Demasiadas peticiones. Inténtalo más tarde.',
                    'status'  => 429,
                ], 429);
            }
        });

        $exceptions->render(function (HttpException $e, Request $request) {
            if ($request->is('api/*')) {
                $messages = [
                    403 => 'No tienes permiso para realizar esta acción.',
                    404 => 'Recurso no encontrado.',
                    405 => 'Método no permitido.',
                    500 => 'Error interno del servidor.',
                ];
                $status = $e->getStatusCode();
                return response()->json([
                    'data'    => null,
                    'message' => $messages[$status] ?? ($e->getMessage() ?: 'Error del servidor.'),
                    'status'  => $status,
                ], $status);
            }
        });

        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'data'    => null,
                    'message' => 'Error interno del servidor.',
                    'status'  => 500,
                ], 500);
            }
        });
    })->create();
