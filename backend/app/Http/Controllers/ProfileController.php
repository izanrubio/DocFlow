<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    use ApiResponse;

    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('tenant');

        return $this->success([
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'created_at'        => $user->created_at,
            'tenant'            => [
                'name' => $user->tenant->name,
                'plan' => $user->tenant->plan,
            ],
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user        = $request->user();
        $emailChanged = $user->email !== $request->email;

        $user->name = $request->name;
        $user->email = $request->email;

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return $this->success([
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'created_at'        => $user->created_at,
            'email_changed'     => $emailChanged,
        ], $emailChanged
            ? 'Perfil actualizado. Verifica tu nuevo email para seguir usando DocFlow.'
            : 'Perfil actualizado correctamente.'
        );
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->error('La contraseña actual no es correcta.', 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        $currentTokenId = $request->user()->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return $this->success(null, 'Contraseña actualizada correctamente.');
    }
}
