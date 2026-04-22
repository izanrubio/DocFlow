<?php

namespace App\Http\Controllers;

use App\Enums\DocumentEventType;
use App\Enums\DocumentStatus;
use App\Enums\SignerStatus;
use App\Models\Signer;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class SigningController extends Controller
{
    use ApiResponse;

    public function show(string $token): JsonResponse
    {
        $signer = Signer::where('token', $token)
            ->with(['document.user:id,name', 'document.signers' => fn ($q) => $q->orderBy('order')])
            ->firstOrFail();

        $document = $signer->document;

        if ($signer->status === SignerStatus::Signed) {
            return $this->success([
                'already_signed' => true,
                'signer_name'    => $signer->name,
            ], 'Already signed');
        }

        if (in_array($document->status, [DocumentStatus::Expired, DocumentStatus::Cancelled])) {
            return $this->error('El documento ha expirado o fue cancelado.', 403);
        }

        $previousUnsigned = $document->signers
            ->where('order', '<', $signer->order)
            ->whereNotIn('status', [SignerStatus::Signed])
            ->first();

        if ($previousUnsigned) {
            return $this->error("Debe firmar primero {$previousUnsigned->name}.", 403);
        }

        $viewedExists = $document->events()
            ->where('type', DocumentEventType::Viewed)
            ->where('signer_id', $signer->id)
            ->exists();

        if (!$viewedExists) {
            $document->events()->create([
                'tenant_id' => $document->tenant_id,
                'type'      => DocumentEventType::Viewed,
                'signer_id' => $signer->id,
            ]);
        }

        if ($signer->status === SignerStatus::Pending) {
            $signer->update(['status' => SignerStatus::Viewed]);
        }

        $previewUrl = Storage::disk('documents_public')
            ->temporaryUrl($document->file_path, now()->addMinutes(60));

        return $this->success([
            'already_signed' => false,
            'signer'         => [
                'id'     => $signer->id,
                'name'   => $signer->name,
                'order'  => $signer->order,
                'status' => $signer->fresh()->status->value,
            ],
            'document' => [
                'id'         => $document->id,
                'title'      => $document->title,
                'expires_at' => $document->expires_at?->toIso8601String(),
                'sent_by'    => $document->user->name,
            ],
            'signers' => $document->signers->map(fn ($s) => [
                'id'     => $s->id,
                'name'   => $s->name,
                'order'  => $s->order,
                'status' => $s->id === $signer->id ? $signer->fresh()->status->value : $s->status->value,
            ]),
            'preview_url' => $previewUrl,
        ]);
    }
}
