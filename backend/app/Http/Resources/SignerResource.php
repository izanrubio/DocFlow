<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SignerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'email'     => $this->email,
            'order'     => $this->order,
            'status'    => $this->status->value,
            'signed_at' => $this->signed_at?->toIso8601String(),
        ];
    }
}
