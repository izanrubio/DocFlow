<?php

namespace App\Services;

use App\Enums\DocumentEventType;
use App\Enums\DocumentStatus;
use App\Enums\SignerStatus;
use App\Models\Document;
use App\Models\User;
use App\Services\PlanService;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentService
{
    public function __construct(private PlanService $planService) {}

    public function list(User $user, array $filters): LengthAwarePaginator
    {
        $query = Document::forTenant($user->tenant_id)
            ->withCount([
                'signers',
                'signers as signers_signed_count' => fn ($q) => $q->where('status', SignerStatus::Signed->value),
            ])
            ->with(['user:id,name', 'signers:id,document_id,name,email,order,status'])
            ->orderByDesc('created_at');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('original_filename', 'like', "%{$s}%");
            });
        }

        if (!empty($filters['signer_email'])) {
            $e = $filters['signer_email'];
            $query->whereHas('signers', fn ($q) => $q->where('email', 'like', "%{$e}%"));
        }

        if (!empty($filters['signer_name'])) {
            $n = $filters['signer_name'];
            $query->whereHas('signers', fn ($q) => $q->where('name', 'like', "%{$n}%"));
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->paginate(15);
    }

    public function store(User $user, array $data, UploadedFile $file): Document
    {
        $this->planService->assertCanCreateDocument($user->tenant);

        $path = sprintf(
            '%d/%s/%s/%s.pdf',
            $user->tenant_id,
            now()->format('Y'),
            now()->format('m'),
            Str::uuid()
        );

        Storage::disk('documents')->put($path, $file->getContent());

        $document = Document::create([
            'tenant_id'         => $user->tenant_id,
            'user_id'           => $user->id,
            'title'             => $data['title'],
            'file_path'         => $path,
            'original_filename' => $file->getClientOriginalName(),
            'status'            => DocumentStatus::Draft,
            'expires_at'        => $data['expires_at'] ?? null,
        ]);

        $document->events()->create([
            'tenant_id' => $user->tenant_id,
            'type'      => DocumentEventType::Created,
        ]);

        return $document->load('user:id,name');
    }

    public function show(User $user, int $id): Document
    {
        $document = Document::forTenant($user->tenant_id)
            ->with([
                'user:id,name',
                'signers',
                'events' => fn ($q) => $q->latest()->limit(20),
            ])
            ->findOrFail($id);

        $document->preview_url = Storage::disk('documents_public')
            ->temporaryUrl($document->file_path, now()->addMinutes(60));

        return $document;
    }

    public function delete(User $user, int $id): void
    {
        $document = Document::forTenant($user->tenant_id)->findOrFail($id);

        abort_if(
            $document->status !== DocumentStatus::Draft,
            422,
            'Only draft documents can be deleted.'
        );

        Storage::disk('documents')->delete($document->file_path);
        $document->delete();
    }
}
