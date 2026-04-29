<?php

namespace App\Jobs;

use App\Mail\TeamInvitationMail;
use App\Models\TeamInvitation;
use App\Models\Tenant;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Spatie\Multitenancy\Jobs\NotTenantAware;

class SendTeamInvitationJob implements ShouldQueue, NotTenantAware
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        public TeamInvitation $invitation,
        public Tenant $tenant,
    ) {}

    public function handle(): void
    {
        Mail::to($this->invitation->email)
            ->send(new TeamInvitationMail($this->invitation, $this->tenant));
    }
}
