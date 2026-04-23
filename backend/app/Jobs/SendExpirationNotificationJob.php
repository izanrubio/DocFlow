<?php

namespace App\Jobs;

use App\Enums\SignerStatus;
use App\Mail\ExpirationNotificationMail;
use App\Models\Document;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Spatie\Multitenancy\Jobs\NotTenantAware;

class SendExpirationNotificationJob implements ShouldQueue, NotTenantAware
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public Document $document) {}

    public function handle(): void
    {
        $this->document->loadMissing(['user', 'signers']);

        $unsignedSigners = $this->document->signers
            ->whereNotIn('status', [SignerStatus::Signed->value]);

        Mail::to($this->document->user->email)
            ->send(new ExpirationNotificationMail($this->document, $unsignedSigners));
    }
}
