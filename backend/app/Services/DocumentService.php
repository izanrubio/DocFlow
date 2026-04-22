<?php

namespace App\Services;

use App\Enums\DocumentEventType;
use App\Enums\DocumentStatus;
use App\Enums\SignerStatus;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentService
{
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

        return $query->paginate(15);
    }

    public function store(User $user, array $data, UploadedFile $file): Document
    {
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
