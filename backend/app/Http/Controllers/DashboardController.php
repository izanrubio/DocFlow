<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Enums\SignerStatus;
use App\Models\Document;
use App\Models\DocumentEvent;
use App\Models\Signer;
use App\Services\PlanService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __construct(private PlanService $planService) {}

    public function stats(Request $request): JsonResponse
    {
        $tenant   = $request->user()->tenant;
        $tenantId = $tenant->id;
        $limits   = $this->planService->getLimits($tenant);

        $documentsThisMonth = Document::where('tenant_id', $tenantId)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        $documentsCompleted = Document::where('tenant_id', $tenantId)
            ->where('status', DocumentStatus::Completed)
            ->count();

        $documentsPending = Document::where('tenant_id', $tenantId)
            ->whereIn('status', [DocumentStatus::Sent, DocumentStatus::InProgress])
            ->count();

        $signersWaiting = Signer::whereHas('document', fn ($q) => $q->where('tenant_id', $tenantId))
            ->whereIn('status', [SignerStatus::Pending, SignerStatus::Viewed])
            ->count();

        $recentEvents = DocumentEvent::with('document:id,title')
            ->where('tenant_id', $tenantId)
            ->whereNotNull('document_id')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($e) => [
                'id'             => $e->id,
                'type'           => $e->type->value,
                'document_id'    => $e->document_id,
                'document_title' => $e->document?->title ?? 'Documento eliminado',
                'created_at'     => $e->created_at->toIso8601String(),
            ]);

        $pendingDocuments = Document::where('tenant_id', $tenantId)
            ->whereIn('status', [DocumentStatus::Sent, DocumentStatus::InProgress])
            ->withCount([
                'signers',
                'signers as signers_signed_count' => fn ($q) => $q->where('status', SignerStatus::Signed),
            ])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($d) => [
                'id'             => $d->id,
                'title'          => $d->title,
                'status'         => $d->status->value,
                'signers_signed' => $d->signers_signed_count,
                'signers_total'  => $d->signers_count,
            ]);

        return $this->success([
            'documents_this_month' => $documentsThisMonth,
            'documents_limit'      => $limits['documents_per_month'],
            'documents_completed'  => $documentsCompleted,
            'documents_pending'    => $documentsPending,
            'signers_waiting'      => $signersWaiting,
            'recent_events'        => $recentEvents,
            'pending_documents'    => $pendingDocuments,
        ]);
    }
}
