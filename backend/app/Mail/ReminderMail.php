<?php

namespace App\Mail;

use App\Models\Document;
use App\Models\Signer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $signUrl;
    public int    $daysPending;

    public function __construct(
        public Signer   $signer,
        public Document $document,
    ) {
        $this->signUrl     = rtrim(env('APP_FRONTEND_URL', 'http://localhost:5173'), '/') . '/sign/' . $signer->token;
        $this->daysPending = (int) $document->created_at->diffInDays(now());
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Recordatorio: tienes pendiente firmar «{$this->document->title}»",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.reminder');
    }
}
