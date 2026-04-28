<?php

namespace App\Console\Commands;

use App\Enums\DocumentEventType;
use App\Enums\DocumentStatus;
use App\Jobs\SendExpirationNotificationJob;
use App\Models\Document;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class ExpireDocumentsCommand extends Command
{
    protected $signature   = 'documents:expire';
    protected $description = 'Expire documents that have passed their expiry date';

    public function handle(): int
    {
        $expired = 0;

        $notificationService = app(NotificationService::class);

        Document::with('user')
            ->whereIn('status', [DocumentStatus::Sent->value, DocumentStatus::InProgress->value])
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->each(function (Document $document) use (&$expired, $notificationService) {
                $document->update(['status' => DocumentStatus::Expired]);

                $document->events()->create([
                    'tenant_id' => $document->tenant_id,
                    'type'      => DocumentEventType::Expired,
                ]);

                if ($document->user) {
                    $notificationService->create(
                        $document->user,
                        'document_expired',
                        'Documento caducado',
                        "«{$document->title}» ha caducado sin completarse",
                        ['document_id' => $document->id]
                    );
                }

                SendExpirationNotificationJob::dispatch($document->fresh());
                $expired++;
            });

        $this->info("Expired {$expired} document(s).");

        return self::SUCCESS;
    }
}
