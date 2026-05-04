<?php

use App\Http\Controllers\ApiKeyController;
use App\Http\Controllers\WaitlistController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\PublicApiController;
use App\Http\Controllers\SignerController;
use App\Http\Controllers\SigningController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\TeamController;
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

    // Read — all roles
    Route::get('documents',                    [DocumentController::class, 'index']);
    Route::get('documents/{id}',               [DocumentController::class, 'show']);
    Route::get('documents/{id}/download',      [DocumentController::class, 'download']);
    Route::get('documents/{id}/download-original', [DocumentController::class, 'downloadOriginal']);
    Route::get('templates',    [TemplateController::class, 'index']);
    Route::get('templates/{id}', [TemplateController::class, 'show']);

    // Write — admin + editor only
    Route::middleware('role:admin,editor')->group(function () {
        Route::post('documents',                              [DocumentController::class, 'store']);
        Route::delete('documents/{id}',                      [DocumentController::class, 'destroy']);
        Route::post('documents/{document}/signers',          [SignerController::class, 'store']);
        Route::delete('documents/{document}/signers/{signer}', [SignerController::class, 'destroy']);
        Route::post('documents/{document}/send',             [SignerController::class, 'send']);
        Route::post('templates',                             [TemplateController::class, 'store']);
        Route::put('templates/{id}',                         [TemplateController::class, 'update']);
        Route::delete('templates/{id}',                      [TemplateController::class, 'destroy']);
        Route::put('templates/{id}/variables',               [TemplateController::class, 'variables']);
        Route::post('templates/{id}/use',                    [TemplateController::class, 'use']);
    });
});

Route::middleware(['auth:sanctum', 'verified', 'throttle:api'])->prefix('notifications')->group(function () {
    Route::get('',              [NotificationController::class, 'index']);
    Route::get('unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('read-all',     [NotificationController::class, 'markAllAsRead']);
    Route::put('{id}/read',    [NotificationController::class, 'markAsRead']);
    Route::delete('{id}',      [NotificationController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'verified', 'throttle:api'])->prefix('billing')->group(function () {
    Route::get('plans',              [BillingController::class, 'plans']);
    Route::get('usage',              [BillingController::class, 'usage']);
    Route::post('checkout/{plan}',   [BillingController::class, 'checkout']);
    Route::post('portal',            [BillingController::class, 'portal']);
    Route::get('subscription',       [BillingController::class, 'subscription']);
    Route::get('invoices',           [BillingController::class, 'invoices']);
});

Route::middleware(['auth:sanctum', 'verified', 'throttle:api'])->prefix('team')->group(function () {
    Route::get('',                            [TeamController::class, 'index']);
    Route::post('invite',                     [TeamController::class, 'invite'])->middleware('role:admin');
    Route::put('{userId}/role',               [TeamController::class, 'updateRole'])->middleware('role:admin');
    Route::delete('{userId}',                 [TeamController::class, 'remove'])->middleware('role:admin');
    Route::post('invitations/{id}/resend',    [TeamController::class, 'resend'])->middleware('role:admin');
    Route::delete('invitations/{id}',         [TeamController::class, 'cancelInvitation'])->middleware('role:admin');
    Route::post('transfer-ownership/{userId}', [TeamController::class, 'transferOwnership']);
});

Route::post('team/accept/{token}', [TeamController::class, 'accept'])->middleware('throttle:api');

Route::post('stripe/webhook', [StripeWebhookController::class, 'handle']);

// ── Waitlist (public) ────────────────────────────────────────────────────
Route::get('waitlist/count', [WaitlistController::class, 'count']);
Route::post('waitlist', [WaitlistController::class, 'store'])->middleware('throttle:waitlist');

// ── Waitlist admin ────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'verified', 'throttle:api', 'role:admin', 'owner'])->prefix('admin/waitlist')->group(function () {
    Route::get('',        [WaitlistController::class, 'index']);
    Route::get('stats',   [WaitlistController::class, 'stats']);
    Route::post('launch', [WaitlistController::class, 'launch']);
});

// ── Developer: API key management (Sanctum, admin only) ───────────────────
Route::middleware(['auth:sanctum', 'verified', 'throttle:api', 'role:admin'])->prefix('developer')->group(function () {
    Route::get('keys',        [ApiKeyController::class, 'index']);
    Route::post('keys',       [ApiKeyController::class, 'store']);
    Route::put('keys/{id}',   [ApiKeyController::class, 'update']);
    Route::delete('keys/{id}', [ApiKeyController::class, 'destroy']);
});

// ── Public API v1 (API key auth) ──────────────────────────────────────────
Route::middleware('api.key')->prefix('v1')->group(function () {
    Route::get('me', [PublicApiController::class, 'me']);

    Route::get('documents',                              [PublicApiController::class, 'listDocuments']);
    Route::post('documents',                             [PublicApiController::class, 'storeDocument']);
    Route::get('documents/{id}',                         [PublicApiController::class, 'showDocument']);
    Route::delete('documents/{id}',                      [PublicApiController::class, 'destroyDocument']);
    Route::get('documents/{id}/download',                [PublicApiController::class, 'downloadDocument']);
    Route::get('documents/{id}/download-original',       [PublicApiController::class, 'downloadOriginal']);
    Route::post('documents/{id}/signers',                [PublicApiController::class, 'storeSigner']);
    Route::delete('documents/{id}/signers/{signerId}',   [PublicApiController::class, 'destroySigner']);
    Route::post('documents/{id}/send',                   [PublicApiController::class, 'sendDocument']);

    Route::get('templates', [PublicApiController::class, 'listTemplates']);
});

Route::get('sign/{token}',          [SigningController::class, 'show'])->middleware('throttle:sign');
Route::post('sign/{token}',         [SigningController::class, 'sign'])->middleware('throttle:sign_submit');
Route::post('sign/{token}/reject',  [SigningController::class, 'reject'])->middleware('throttle:sign_submit');

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
