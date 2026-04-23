<?php

namespace App\Console\Commands;

use App\Enums\DocumentEventType;
use App\Enums\DocumentStatus;
use App\Enums\SignerStatus;
use App\Jobs\SendReminderJob;
use App\Models\Document;
use Illuminate\Console\Command;

class SendRemindersCommand extends Command
{
    protected $signature   = 'documents:send-reminders';
    protected $description = 'Send signature reminders to pending signers';

    public function handle(): int
    {
        $sent = 0;

        Document::whereIn('status', [DocumentStatus::Sent->value, DocumentStatus::InProgress->value])
            ->with(['signers', 'events'])
            ->each(function (Document $document) use (&$sent) {
                $currentSigner = $document->signers
                    ->whereNotIn('status', [SignerStatus::Signed->value, SignerStatus::Rejected->value])
                    ->sortBy('order')
                    ->first();

                if (!$currentSigner) {
                    return;
                }

                $lastReminder = $document->events
                    ->where('type', DocumentEventType::ReminderSent)
                    ->where('signer_id', $currentSigner->id)
                    ->sortByDesc('created_at')
                    ->first();

                if ($lastReminder) {
                    if ($lastReminder->created_at->diffInHours(now()) < 48) {
                        return;
                    }
                } else {
                    $sentEvent = $document->events
                        ->where('type', DocumentEventType::Sent)
                        ->where('signer_id', $currentSigner->id)
                        ->sortByDesc('created_at')
                        ->first();

                    $reference = $sentEvent?->created_at ?? $document->created_at;

                    if ($reference->diffInHours(now()) < 24) {
                        return;
                    }
                }

                SendReminderJob::dispatch($currentSigner);
                $sent++;
            });

        $this->info("Sent {$sent} reminder(s).");

        return self::SUCCESS;
    }
}
