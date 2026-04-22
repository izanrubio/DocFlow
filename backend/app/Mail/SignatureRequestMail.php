<?php

namespace App\Mail;

use App\Models\Document;
use App\Models\Signer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SignatureRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $signUrl;

    public function __construct(
        public Signer $signer,
        public Document $document,
    ) {
        $this->signUrl = rtrim(env('APP_FRONTEND_URL', 'http://localhost:5173'), '/') . '/sign/' . $signer->token;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Solicitud de firma: {$this->document->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.signature-request',
        );
    }
}
