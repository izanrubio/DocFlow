<?php

namespace App\Jobs;

use App\Mail\WaitlistConfirmationMail;
use App\Models\Waitlist;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Spatie\Multitenancy\Jobs\NotTenantAware;

class SendWaitlistConfirmationJob implements ShouldQueue, NotTenantAware
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public Waitlist $entry) {}

    public function handle(): void
    {
        Mail::to($this->entry->email)->send(new WaitlistConfirmationMail($this->entry));
    }
}
