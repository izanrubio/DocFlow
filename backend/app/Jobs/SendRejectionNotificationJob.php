<?php

namespace App\Jobs;

use App\Mail\RejectionNotificationMail;
use App\Models\Signer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Spatie\Multitenancy\Jobs\NotTenantAware;

class SendRejectionNotificationJob implements ShouldQueue, NotTenantAware
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        public Signer $signer,
        public string $reason,
    ) {}

    public function handle(): void
    {
        $this->signer->loadMissing(['document.user']);

        $document    = $this->signer->document;
        $documentUrl = rtrim(config('app.frontend_url'), '/') . '/documents/' . $document->id;

        Mail::to($document->user->email)
            ->send(new RejectionNotificationMail($document, $this->signer, $this->reason, $documentUrl));
    }
}
