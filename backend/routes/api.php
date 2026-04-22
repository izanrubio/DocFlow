<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\SignerController;
use App\Http\Controllers\SigningController;
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
});

Route::get('sign/{token}', [SigningController::class, 'show']);
