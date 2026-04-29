<?php

use App\Exceptions\PlanLimitExceededException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
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
        $middleware->redirectGuestsTo(fn () => null);
        $middleware->alias([
            'role'    => \App\Http\Middleware\RequireRole::class,
            'api.key' => \App\Http\Middleware\ApiKeyAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // ── Public API (v1) — structured error format ──────────────────────
        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if ($request->is('api/v1/*')) {
                return response()->json(['error' => ['code' => 'not_found', 'message' => 'Recurso no encontrado.', 'status' => 404]], 404);
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/v1/*')) {
                return response()->json(['error' => ['code' => 'validation_error', 'message' => 'Datos inválidos.', 'status' => 422, 'errors' => $e->errors()]], 422);
            }
        });

        $exceptions->render(function (PlanLimitExceededException $e, Request $request) {
            if ($request->is('api/v1/*')) {
                return response()->json(['error' => ['code' => 'plan_limit_exceeded', 'message' => $e->getMessage(), 'status' => 422]], 422);
            }
        });

        $exceptions->render(function (HttpException $e, Request $request) {
            if ($request->is('api/v1/*')) {
                $codeMap = [401 => 'unauthorized', 403 => 'forbidden', 404 => 'not_found', 405 => 'method_not_allowed', 422 => 'unprocessable', 429 => 'rate_limit_exceeded', 500 => 'internal_error'];
                $status  = $e->getStatusCode();
                return response()->json(['error' => ['code' => $codeMap[$status] ?? 'internal_error', 'message' => $e->getMessage() ?: 'Error del servidor.', 'status' => $status]], $status);
            }
        });

        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/v1/*')) {
                return response()->json(['error' => ['code' => 'internal_error', 'message' => 'Error interno del servidor.', 'status' => 500]], 500);
            }
        });

        // ── Internal API ───────────────────────────────────────────────────
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['data' => null, 'message' => 'No autenticado.', 'status' => 401], 401);
            }
        });

        $exceptions->render(function (PlanLimitExceededException $e, Request $request) {
            return response()->json(['data' => null, 'message' => $e->getMessage(), 'status' => 422], 422);
        });

        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['data' => null, 'message' => 'Recurso no encontrado.', 'status' => 404], 404);
            }
        });

        $exceptions->render(function (AuthorizationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['data' => null, 'message' => 'No tienes permiso para realizar esta acción.', 'status' => 403], 403);
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['data' => null, 'message' => 'Datos inválidos.', 'status' => 422, 'errors' => $e->errors()], 422);
            }
        });

        $exceptions->render(function (TooManyRequestsHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                $retryAfter = $e->getHeaders()['Retry-After'] ?? null;
                $headers    = $retryAfter ? ['Retry-After' => $retryAfter] : [];
                return response()->json(['data' => null, 'message' => 'Demasiadas peticiones. Por favor espera antes de volver a intentarlo.', 'status' => 429, 'retry_after' => $retryAfter ? (int) $retryAfter : null], 429, $headers);
            }
        });

        $exceptions->render(function (HttpException $e, Request $request) {
            if ($request->is('api/*')) {
                $messages = [403 => 'No tienes permiso para realizar esta acción.', 404 => 'Recurso no encontrado.', 405 => 'Método no permitido.', 500 => 'Error interno del servidor.'];
                $status   = $e->getStatusCode();
                return response()->json(['data' => null, 'message' => $messages[$status] ?? ($e->getMessage() ?: 'Error del servidor.'), 'status' => $status], $status);
            }
        });

        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['data' => null, 'message' => 'Error interno del servidor.', 'status' => 500], 500);
            }
        });
    })->create();
