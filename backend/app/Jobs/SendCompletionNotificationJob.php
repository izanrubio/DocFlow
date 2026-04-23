<?php

namespace App\Jobs;

use App\Mail\DocumentCompletedMail;
use App\Models\Document;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Spatie\Multitenancy\Jobs\NotTenantAware;

class SendCompletionNotificationJob implements ShouldQueue, NotTenantAware
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public Document $document) {}

    public function handle(): void
    {
        $document = $this->document->load(['user', 'signers']);

        $downloadUrl = Storage::disk('documents_public')
            ->temporaryUrl($document->signed_file_path, now()->addDays(7));

        $recipients = collect([$document->user->email])
            ->merge($document->signers->pluck('email'))
            ->unique()
            ->values();

        foreach ($recipients as $email) {
            Mail::to($email)->send(new DocumentCompletedMail($document, $downloadUrl));
        }
    }
}
