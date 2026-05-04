<?php

namespace App\Mail;

use App\Models\Waitlist;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WaitlistConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public int $position;

    public function __construct(public Waitlist $entry)
    {
        $this->position = Waitlist::where('created_at', '<=', $entry->created_at)->count();
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Estás en la lista — DocFlow');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.waitlist-confirmation');
    }
}
