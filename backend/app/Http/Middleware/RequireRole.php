<?php

namespace App\Http\Middleware;

use App\Enums\TeamRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'No autenticado.');
        }

        $userRole = $user->role instanceof TeamRole ? $user->role->value : $user->role;

        if (!in_array($userRole, $roles, true)) {
            abort(403, 'No tienes permiso para realizar esta acción.');
        }

        return $next($request);
    }
}
