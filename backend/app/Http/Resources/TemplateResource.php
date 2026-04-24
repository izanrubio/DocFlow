<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'is_system'   => $this->tenant_id === null,
            'created_at'  => $this->created_at->toIso8601String(),
            'user'        => $this->whenLoaded('user', fn () => $this->user ? [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ] : null),
            'preview_url'   => $this->when(
                isset($this->resource->preview_url),
                $this->resource->preview_url ?? null
            ),
            'variables'          => $this->resource->variables ?? [],
            'has_variables'      => !empty($this->resource->variables),
            'variables_detected' => $this->when(
                isset($this->resource->variables_detected),
                $this->resource->variables_detected ?? 0
            ),
        ];
    }
}
