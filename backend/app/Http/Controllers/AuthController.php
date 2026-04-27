<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register(
            $request->name,
            $request->email,
            $request->password,
        );

        $user->sendEmailVerificationNotification();

        return $this->success(
            ['email_verified' => false, 'email' => $user->email],
            'Revisa tu email para verificar tu cuenta.',
            201
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return $this->error('Credenciales incorrectas.', 401);
        }

        $user = Auth::user();

        if (! $user->hasVerifiedEmail()) {
            return $this->error('Debes verificar tu email antes de iniciar sesión.', 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success(
            ['user' => $user->load('tenant'), 'token' => $token],
            'Login successful'
        );
    }

    public function verifyEmail(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        abort_unless(
            hash_equals($hash, sha1($user->getEmailForVerification())),
            403,
            'Enlace de verificación inválido.'
        );

        abort_unless($request->hasValidSignature(), 403, 'El enlace ha expirado o no es válido.');

        if ($user->hasVerifiedEmail()) {
            $token = $user->createToken('auth-token')->plainTextToken;

            return $this->success(
                ['user' => $user->load('tenant'), 'token' => $token],
                'El email ya estaba verificado.'
            );
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success(
            ['user' => $user->load('tenant'), 'token' => $token],
            '¡Email verificado! Tu cuenta está activa.'
        );
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->error('El email ya está verificado.', 422);
        }

        $user->sendEmailVerificationNotification();

        return $this->success(null, 'Email de verificación reenviado.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success($request->user()->load('tenant'));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }
}
