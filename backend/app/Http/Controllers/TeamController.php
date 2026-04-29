<?php

namespace App\Http\Controllers;

use App\Enums\TeamRole;
use App\Services\TeamService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    use ApiResponse;

    public function __construct(private TeamService $teamService) {}

    public function index(Request $request): JsonResponse
    {
        return $this->success($this->teamService->getTeam($request->user()));
    }

    public function invite(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'role'  => ['required', 'in:admin,editor,viewer'],
        ]);

        $invitation = $this->teamService->invite(
            $request->user(),
            $data['email'],
            TeamRole::from($data['role'])
        );

        return $this->success($invitation, 'Invitación enviada.', 201);
    }

    public function updateRole(Request $request, int $userId): JsonResponse
    {
        $data = $request->validate([
            'role' => ['required', 'in:admin,editor,viewer'],
        ]);

        $user = $this->teamService->updateRole(
            $request->user(),
            $userId,
            TeamRole::from($data['role'])
        );

        return $this->success(['id' => $user->id, 'role' => $user->role->value], 'Rol actualizado.');
    }

    public function remove(Request $request, int $userId): JsonResponse
    {
        $this->teamService->remove($request->user(), $userId);

        return $this->success(null, 'Miembro eliminado.');
    }

    public function resend(Request $request, string $invitationId): JsonResponse
    {
        $this->teamService->resend($request->user(), $invitationId);

        return $this->success(null, 'Invitación reenviada.');
    }

    public function cancelInvitation(Request $request, string $invitationId): JsonResponse
    {
        $this->teamService->cancelInvitation($request->user(), $invitationId);

        return $this->success(null, 'Invitación cancelada.');
    }

    public function transferOwnership(Request $request, int $userId): JsonResponse
    {
        $this->teamService->transferOwnership($request->user(), $userId);

        return $this->success(null, 'Propiedad transferida correctamente.');
    }

    public function accept(Request $request, string $token): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $this->teamService->accept($token, $data['name'], $data['password']);

        $apiToken = $user->createToken('api')->plainTextToken;

        return $this->success([
            'token' => $apiToken,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role->value,
            ],
        ], 'Cuenta creada. Bienvenido a DocFlow.', 201);
    }
}
