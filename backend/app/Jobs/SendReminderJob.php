<?php

namespace App\Jobs;

use App\Enums\DocumentEventType;
use App\Mail\ReminderMail;
use App\Models\Signer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Spatie\Multitenancy\Jobs\NotTenantAware;

class SendReminderJob implements ShouldQueue, NotTenantAware
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public Signer $signer) {}

    public function handle(): void
    {
        $this->signer->loadMissing(['document.user']);

        Mail::to($this->signer->email)
            ->send(new ReminderMail($this->signer, $this->signer->document));

        $this->signer->document->events()->create([
            'tenant_id' => $this->signer->document->tenant_id,
            'type'      => DocumentEventType::ReminderSent,
            'signer_id' => $this->signer->id,
        ]);
    }
}
