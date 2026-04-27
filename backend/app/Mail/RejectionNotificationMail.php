<?php

namespace App\Mail;

use App\Models\Document;
use App\Models\Signer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RejectionNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Document $document,
        public Signer   $signer,
        public string   $reason,
        public string   $documentUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Documento rechazado: {$this->document->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.rejection-notification',
        );
    }
}
