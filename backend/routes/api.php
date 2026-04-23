<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\SignerController;
use App\Http\Controllers\SigningController;
use App\Http\Controllers\TemplateController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
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
    Route::post('templates/{id}/use', [TemplateController::class, 'use']);
});

Route::get('sign/{token}', [SigningController::class, 'show']);
Route::post('sign/{token}', [SigningController::class, 'sign']);

if (app()->environment('local')) {
    Route::get('dev/trigger-reminders', function () {
        Artisan::call('documents:send-reminders');
        return response()->json(['data' => ['output' => Artisan::output()], 'message' => 'OK', 'status' => 200]);
    });
    Route::get('dev/trigger-expiration', function () {
        Artisan::call('documents:expire');
        return response()->json(['data' => ['output' => Artisan::output()], 'message' => 'OK', 'status' => 200]);
    });
}
