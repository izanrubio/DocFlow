<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\SignerController;
use App\Http\Controllers\SigningController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\TemplateController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])
        ->middleware('throttle:register');

    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:login');

    Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware('signed')
        ->name('verification.verify');

    Route::post('email/resend', [AuthController::class, 'resendVerification'])
        ->middleware('throttle:resend');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('profile',             [ProfileController::class, 'show']);
    Route::put('profile',             [ProfileController::class, 'update']);
    Route::put('profile/password',    [ProfileController::class, 'updatePassword']);
});

Route::middleware(['auth:sanctum', 'verified', 'throttle:api'])->group(function () {
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);

    Route::get('documents', [DocumentController::class, 'index']);
    Route::post('documents', [DocumentController::class, 'store']);
    Route::get('documents/{id}', [DocumentController::class, 'show']);
    Route::delete('documents/{id}', [DocumentController::class, 'destroy']);

    Route::post('documents/{document}/signers', [SignerController::class, 'store']);
    Route::delete('documents/{document}/signers/{signer}', [SignerController::class, 'destroy']);
    Route::post('documents/{document}/send', [SignerController::class, 'send']);

    Route::get('documents/{id}/download', [DocumentController::class, 'download']);

    Route::get('templates', [TemplateController::class, 'index']);
    Route::post('templates', [TemplateController::class, 'store']);
    Route::get('templates/{id}', [TemplateController::class, 'show']);
    Route::put('templates/{id}', [TemplateController::class, 'update']);
    Route::delete('templates/{id}', [TemplateController::class, 'destroy']);
    Route::put('templates/{id}/variables', [TemplateController::class, 'variables']);
    Route::post('templates/{id}/use', [TemplateController::class, 'use']);
});

Route::middleware(['auth:sanctum', 'verified', 'throttle:api'])->prefix('billing')->group(function () {
    Route::get('plans',              [BillingController::class, 'plans']);
    Route::get('usage',              [BillingController::class, 'usage']);
    Route::post('checkout/{plan}',   [BillingController::class, 'checkout']);
    Route::post('portal',            [BillingController::class, 'portal']);
    Route::get('subscription',       [BillingController::class, 'subscription']);
});

Route::post('stripe/webhook', [StripeWebhookController::class, 'handle']);

Route::get('sign/{token}',  [SigningController::class, 'show'])->middleware('throttle:sign');
Route::post('sign/{token}', [SigningController::class, 'sign'])->middleware('throttle:sign_submit');

if (app()->environment('local')) {
    Route::get('dev/trigger-reminders', function () {
        Artisan::call('documents:send-reminders');
        return response()->json(['data' => ['output' => Artisan::output()], 'message' => 'OK', 'status' => 200]);
    });
    Route::get('dev/trigger-expiration', function () {
        Artisan::call('documents:expire');
        return response()->json(['data' => ['output' => Artisan::output()], 'message' => 'OK', 'status' => 200]);
    });

    Route::middleware('auth:sanctum')->post('dev/set-plan/{plan}', function (string $plan, \Illuminate\Http\Request $request) {
        abort_unless(in_array($plan, ['free', 'pro', 'business']), 422, 'Plan inválido.');
        $request->user()->tenant->update(['plan' => $plan]);
        return response()->json(['data' => ['plan' => $plan], 'message' => 'Plan actualizado.', 'status' => 200]);
    });

    Route::get('dev/test-rate-limit', function () {
        $key      = 'login:127.0.0.1';
        $maxAttempts = 5;
        RateLimiter::clear($key);

        $results  = [];
        $throttledAt = null;
        for ($i = 1; $i <= 10; $i++) {
            $throttled = RateLimiter::tooManyAttempts($key, $maxAttempts);
            if ($throttled) {
                $throttledAt ??= $i;
                $results[] = ['attempt' => $i, 'throttled' => true, 'remaining' => 0];
            } else {
                RateLimiter::hit($key, 60);
                $results[] = ['attempt' => $i, 'throttled' => false, 'remaining' => RateLimiter::remaining($key, $maxAttempts)];
            }
        }

        RateLimiter::clear($key);

        return response()->json([
            'data'    => ['attempts' => $results, 'throttled_at_attempt' => $throttledAt],
            'message' => "Límite activado en intento #{$throttledAt} (máx {$maxAttempts}/min).",
            'status'  => 200,
        ]);
    });
}
