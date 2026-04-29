<?php

namespace App\Mail;

use App\Models\TeamInvitation;
use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TeamInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $acceptUrl;

    public function __construct(
        public TeamInvitation $invitation,
        public Tenant $tenant,
    ) {
        $this->acceptUrl = rtrim(env('APP_FRONTEND_URL', 'http://localhost:5173'), '/') . '/accept-invitation/' . $invitation->token;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Invitación para unirte a {$this->tenant->name} en DocFlow",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.team-invitation',
        );
    }
}
