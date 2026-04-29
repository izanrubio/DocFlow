<?php

namespace App\Services;

use App\Enums\TeamRole;
use App\Jobs\SendTeamInvitationJob;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Support\Str;

class TeamService
{
    public function getTeam(User $user): array
    {
        $members = User::where('tenant_id', $user->tenant_id)
            ->orderBy('created_at')
            ->get(['id', 'name', 'email', 'role', 'is_owner', 'created_at'])
            ->map(fn ($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'role'       => $u->role->value,
                'role_label' => $u->role->label(),
                'is_owner'   => (bool) $u->is_owner,
                'is_self'    => $u->id === $user->id,
                'joined_at'  => $u->created_at->toIso8601String(),
            ]);

        $invitations = TeamInvitation::where('tenant_id', $user->tenant_id)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->with('invitedBy:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($inv) => [
                'id'         => $inv->id,
                'email'      => $inv->email,
                'role'       => $inv->role->value,
                'role_label' => $inv->role->label(),
                'invited_by' => $inv->invitedBy?->name,
                'expires_at' => $inv->expires_at->toIso8601String(),
            ]);

        return ['members' => $members, 'invitations' => $invitations];
    }

    public function invite(User $inviter, string $email, TeamRole $role): TeamInvitation
    {
        abort_if(
            User::where('tenant_id', $inviter->tenant_id)->where('email', $email)->exists(),
            422,
            'Este usuario ya es miembro del equipo.'
        );

        abort_if(
            TeamInvitation::where('tenant_id', $inviter->tenant_id)
                ->where('email', $email)
                ->whereNull('accepted_at')
                ->where('expires_at', '>', now())
                ->exists(),
            422,
            'Ya existe una invitación pendiente para este email.'
        );

        $invitation = TeamInvitation::create([
            'tenant_id'  => $inviter->tenant_id,
            'email'      => $email,
            'role'       => $role,
            'token'      => Str::uuid()->toString(),
            'invited_by' => $inviter->id,
            'expires_at' => now()->addDays(7),
        ]);

        SendTeamInvitationJob::dispatch($invitation->load('invitedBy:id,name'), $inviter->tenant);

        return $invitation;
    }

    public function updateRole(User $admin, int $targetId, TeamRole $role): User
    {
        abort_if($admin->id === $targetId, 422, 'No puedes cambiar tu propio rol.');

        $target = User::where('tenant_id', $admin->tenant_id)->findOrFail($targetId);

        abort_if($target->is_owner, 403, 'No puedes cambiar el rol del propietario de la cuenta.');

        $target->update(['role' => $role]);
        $target->tokens()->delete();

        return $target->fresh();
    }

    public function remove(User $admin, int $targetId): void
    {
        abort_if($admin->id === $targetId, 422, 'No puedes eliminarte a ti mismo.');

        $target = User::where('tenant_id', $admin->tenant_id)->findOrFail($targetId);

        abort_if($target->is_owner, 403, 'No puedes eliminar al propietario de la cuenta.');

        $target->delete();
    }

    public function resend(User $admin, string $invitationId): void
    {
        $invitation = TeamInvitation::where('tenant_id', $admin->tenant_id)
            ->whereNull('accepted_at')
            ->findOrFail($invitationId);

        $invitation->update(['expires_at' => now()->addDays(7)]);

        SendTeamInvitationJob::dispatch($invitation->load('invitedBy:id,name'), $admin->tenant);
    }

    public function cancelInvitation(User $admin, string $invitationId): void
    {
        $invitation = TeamInvitation::where('tenant_id', $admin->tenant_id)
            ->whereNull('accepted_at')
            ->findOrFail($invitationId);

        $invitation->delete();
    }

    public function transferOwnership(User $owner, int $targetId): void
    {
        abort_unless($owner->is_owner, 403, 'Solo el propietario puede ceder la propiedad.');
        abort_if($owner->id === $targetId, 422, 'No puedes cederte la propiedad a ti mismo.');

        $target = User::where('tenant_id', $owner->tenant_id)->findOrFail($targetId);

        abort_unless($target->role === TeamRole::Admin, 422, 'Solo puedes ceder la propiedad a un administrador.');

        $owner->update(['is_owner' => false]);
        $target->update(['is_owner' => true]);
    }

    public function accept(string $token, string $name, string $password): User
    {
        $invitation = TeamInvitation::where('token', $token)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        abort_if(
            User::where('email', $invitation->email)->exists(),
            422,
            'Ya existe una cuenta con este email.'
        );

        $user = User::create([
            'tenant_id'  => $invitation->tenant_id,
            'name'       => $name,
            'email'      => $invitation->email,
            'password'   => $password,
            'role'       => $invitation->role,
            'invited_by' => $invitation->invited_by,
            'is_owner'   => false,
        ]);

        $user->markEmailAsVerified();

        $invitation->update(['accepted_at' => now()]);

        return $user;
    }
}
