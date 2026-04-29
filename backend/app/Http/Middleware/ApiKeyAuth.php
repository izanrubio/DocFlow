<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyAuth
{
    private const MAX_REQUESTS = 100;

    public function handle(Request $request, Closure $next): Response
    {
        $rawKey = $request->header('X-API-Key')
            ?? $this->extractBearer($request->header('Authorization'));

        if (!$rawKey || !str_starts_with($rawKey, 'df_live_')) {
            return $this->error('API key inválida o ausente.', 'unauthorized', 401);
        }

        $apiKey = ApiKey::where('key', $rawKey)->first();

        if (!$apiKey) {
            return $this->error('API key inválida.', 'unauthorized', 401);
        }

        if (!$apiKey->is_active) {
            return $this->error('API key revocada.', 'unauthorized', 401);
        }

        if ($apiKey->expires_at && $apiKey->expires_at->isPast()) {
            return $this->error('API key expirada.', 'unauthorized', 401);
        }

        $rlKey = 'apikey:' . $apiKey->id;

        if (RateLimiter::tooManyAttempts($rlKey, self::MAX_REQUESTS)) {
            $retryAfter = RateLimiter::availableIn($rlKey);
            return $this->error('Demasiadas peticiones. Espera antes de volver a intentarlo.', 'rate_limit_exceeded', 429, [
                'X-RateLimit-Limit'     => self::MAX_REQUESTS,
                'X-RateLimit-Remaining' => 0,
                'X-RateLimit-Reset'     => now()->addSeconds($retryAfter)->timestamp,
                'Retry-After'           => $retryAfter,
            ]);
        }

        RateLimiter::hit($rlKey, 60);
        $remaining = RateLimiter::remaining($rlKey, self::MAX_REQUESTS);

        $apiKey->updateQuietly(['last_used_at' => now()]);

        $request->attributes->set('api_key', $apiKey);
        $request->attributes->set('api_tenant', $apiKey->tenant()->with('users')->first() ?? $apiKey->tenant);
        $request->attributes->set('api_user', $apiKey->user);

        $response = $next($request);

        return $response->withHeaders([
            'X-RateLimit-Limit'     => self::MAX_REQUESTS,
            'X-RateLimit-Remaining' => $remaining,
            'X-RateLimit-Reset'     => now()->addMinute()->timestamp,
        ]);
    }

    private function extractBearer(?string $authorization): ?string
    {
        if (!$authorization || !str_starts_with($authorization, 'Bearer ')) {
            return null;
        }
        $key = substr($authorization, 7);
        return str_starts_with($key, 'df_live_') ? $key : null;
    }

    private function error(string $message, string $code, int $status, array $headers = []): Response
    {
        return response()->json([
            'error' => ['code' => $code, 'message' => $message, 'status' => $status],
        ], $status, $headers);
    }
}
