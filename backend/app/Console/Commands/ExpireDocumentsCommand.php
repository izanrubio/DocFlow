<?php

namespace App\Console\Commands;

use App\Enums\DocumentEventType;
use App\Enums\DocumentStatus;
use App\Jobs\SendExpirationNotificationJob;
use App\Models\Document;
use Illuminate\Console\Command;

class ExpireDocumentsCommand extends Command
{
    protected $signature   = 'documents:expire';
    protected $description = 'Expire documents that have passed their expiry date';

    public function handle(): int
    {
        $expired = 0;

        Document::whereIn('status', [DocumentStatus::Sent->value, DocumentStatus::InProgress->value])
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->each(function (Document $document) use (&$expired) {
                $document->update(['status' => DocumentStatus::Expired]);

                $document->events()->create([
                    'tenant_id' => $document->tenant_id,
                    'type'      => DocumentEventType::Expired,
                ]);

                SendExpirationNotificationJob::dispatch($document->fresh());
                $expired++;
            });

        $this->info("Expired {$expired} document(s).");

        return self::SUCCESS;
    }
}
