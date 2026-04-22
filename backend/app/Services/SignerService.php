<?php

namespace App\Services;

use App\Enums\DocumentEventType;
use App\Enums\DocumentStatus;
use App\Enums\SignerStatus;
use App\Jobs\SendSignatureRequestJob;
use App\Models\Document;
use App\Models\Signer;
use App\Models\User;

class SignerService
{
    public function add(User $user, int $documentId, array $data): Signer
    {
        $document = Document::forTenant($user->tenant_id)->findOrFail($documentId);

        abort_if($document->status !== DocumentStatus::Draft, 422, 'Signers can only be added to draft documents.');

        abort_if(
            $document->signers()->where('email', $data['email'])->exists(),
            422,
            'A signer with this email already exists on this document.'
        );

        return $document->signers()->create([
            'tenant_id' => $user->tenant_id,
            'name'      => $data['name'],
            'email'     => $data['email'],
            'order'     => $data['order'],
            'status'    => SignerStatus::Pending,
        ]);
    }

    public function remove(User $user, int $documentId, int $signerId): void
    {
        $document = Document::forTenant($user->tenant_id)->findOrFail($documentId);

        abort_if($document->status !== DocumentStatus::Draft, 422, 'Signers can only be removed from draft documents.');

        $signer = $document->signers()->findOrFail($signerId);
        $signer->delete();
    }

    public function send(User $user, int $documentId): Document
    {
        $document = Document::forTenant($user->tenant_id)
            ->with(['user:id,name', 'signers'])
            ->findOrFail($documentId);

        abort_if($document->status !== DocumentStatus::Draft, 422, 'Only draft documents can be sent.');
        abort_if($document->signers->isEmpty(), 422, 'Document must have at least one signer before sending.');

        $document->update(['status' => DocumentStatus::Sent]);

        $document->events()->create([
            'tenant_id' => $user->tenant_id,
            'type'      => DocumentEventType::Sent,
        ]);

        $document->signers->each(fn (Signer $signer) => SendSignatureRequestJob::dispatch($signer));

        return $document->refresh()->load(['user:id,name', 'signers', 'events' => fn ($q) => $q->latest()->limit(20)]);
    }
}
