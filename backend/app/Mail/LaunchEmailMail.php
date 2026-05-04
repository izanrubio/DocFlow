<?php

namespace App\Mail;

use App\Models\Waitlist;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LaunchEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $registerUrl;

    public function __construct(public Waitlist $entry)
    {
        $this->registerUrl = rtrim(env('APP_FRONTEND_URL', 'http://localhost:5173'), '/') . '/register';
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: '¡DocFlow ya está disponible!');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.launch');
    }
}
