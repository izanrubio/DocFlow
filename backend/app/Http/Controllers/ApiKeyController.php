<?php

namespace App\Http\Controllers;

use App\Models\ApiKey;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiKeyController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $keys = ApiKey::where('tenant_id', $request->user()->tenant_id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($k) => $this->format($k, false));

        return $this->success($keys);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:100'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ]);

        $key = ApiKey::create([
            'tenant_id'  => $request->user()->tenant_id,
            'user_id'    => $request->user()->id,
            'name'       => $data['name'],
            'expires_at' => $data['expires_at'] ?? null,
        ]);

        return $this->success(
            array_merge($this->format($key, true), ['shown_once' => true]),
            'API key creada.',
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $key = ApiKey::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        $data = $request->validate([
            'name'      => ['sometimes', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $key->update($data);

        return $this->success($this->format($key->fresh(), false));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $key = ApiKey::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $key->update(['is_active' => false]);

        return $this->success(null, 'API key revocada.');
    }

    private function format(ApiKey $key, bool $showFull): array
    {
        return [
            'id'           => $key->id,
            'name'         => $key->name,
            'key'          => $showFull ? $key->key : (substr($key->key, 0, 12) . '...'),
            'is_active'    => $key->is_active,
            'last_used_at' => $key->last_used_at?->toIso8601String(),
            'expires_at'   => $key->expires_at?->toIso8601String(),
            'created_at'   => $key->created_at->toIso8601String(),
        ];
    }
}
