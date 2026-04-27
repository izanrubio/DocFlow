<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'title'             => $this->title,
            'status'            => $this->status->value,
            'original_filename' => $this->original_filename,
            'created_at'        => $this->created_at->toIso8601String(),
            'expires_at'        => $this->expires_at?->toIso8601String(),
            'signers_count'        => $this->whenCounted('signers'),
            'signers_signed_count' => $this->when(isset($this->resource->signers_signed_count), $this->resource->signers_signed_count ?? 0),
            'user'              => $this->whenLoaded('user', fn () => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
            'signers'           => $this->whenLoaded('signers', fn () => $this->signers->map(fn ($s) => [
                'id'        => $s->id,
                'name'      => $s->name,
                'email'     => $s->email,
                'status'    => $s->status->value,
                'signed_at' => $s->signed_at?->toIso8601String(),
                'order'     => $s->order,
            ])),
            'events'            => $this->whenLoaded('events', fn () => $this->events->map(fn ($e) => [
                'id'         => $e->id,
                'type'       => $e->type->value,
                'signer_id'  => $e->signer_id,
                'metadata'   => $e->metadata,
                'created_at' => $e->created_at->toIso8601String(),
            ])),
            'preview_url'       => $this->when($this->resource->preview_url !== null, $this->resource->preview_url),
            'has_signed_file'        => $this->resource->signed_file_path !== null,
            'signature_positions'    => $this->resource->signature_positions,
        ];
    }
}
