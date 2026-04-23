<?php

namespace App\Mail;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Document $document,
        public string $downloadUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Documento firmado: {$this->document->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.document-completed',
        );
    }
}
