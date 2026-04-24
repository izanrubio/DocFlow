<?php

namespace App\Services;

use App\Enums\DocumentEventType;
use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\Template;
use App\Models\User;
use App\Services\PlanService;
use App\Services\Templates\TemplateGeneratorFactory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TemplateService
{
    public function __construct(private PlanService $planService) {}

    public function list(User $user): Collection
    {
        return Template::where(function ($q) use ($user) {
            $q->where('tenant_id', $user->tenant_id)
              ->orWhereNull('tenant_id');
        })
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Template $t) {
                $t->preview_url = Storage::disk('documents_public')
                    ->temporaryUrl($t->file_path, now()->addMinutes(60));
                return $t;
            });
    }

    public function store(User $user, array $data, UploadedFile $file): Template
    {
        $this->planService->assertCanCreateTemplate($user->tenant);

        $path = sprintf('%d/templates/%s.pdf', $user->tenant_id, Str::uuid());

        Storage::disk('documents')->put($path, $file->getContent());

        return Template::create([
            'tenant_id'   => $user->tenant_id,
            'user_id'     => $user->id,
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'file_path'   => $path,
        ]);
    }

    public function show(User $user, int $id): Template
    {
        $template = $this->findForTenant($user, $id);

        $template->preview_url = Storage::disk('documents_public')
            ->temporaryUrl($template->file_path, now()->addMinutes(60));

        return $template;
    }

    public function update(User $user, int $id, array $data): Template
    {
        $template = $this->findForTenant($user, $id);

        abort_if($template->tenant_id === null, 403, 'System templates cannot be modified.');

        $template->update([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        return $template;
    }

    public function delete(User $user, int $id): void
    {
        $template = $this->findForTenant($user, $id);

        abort_if($template->tenant_id === null, 403, 'System templates cannot be deleted.');

        Storage::disk('documents')->delete($template->file_path);
        $template->delete();
    }

    public function use(User $user, int $id, array $data): Document
    {
        $this->planService->assertCanCreateDocument($user->tenant);

        $template = $this->findForTenant($user, $id);

        $newPath = sprintf(
            '%d/%s/%s/%s.pdf',
            $user->tenant_id,
            now()->format('Y'),
            now()->format('m'),
            Str::uuid()
        );

        $signaturePositions = null;

        if (!empty($template->variables)) {
            $values = $data['values'] ?? [];

            $missing = collect($template->variables)
                ->filter(fn ($v) => $v['required'] ?? false)
                ->pluck('key')
                ->reject(fn ($k) => isset($values[$k]) && $values[$k] !== '');

            if ($missing->isNotEmpty()) {
                throw ValidationException::withMessages(
                    $missing->mapWithKeys(fn ($k) => ["values.{$k}" => ["El campo {$k} es obligatorio."]])->all()
                );
            }

            $generator = TemplateGeneratorFactory::make($template);
            if ($generator) {
                Storage::disk('documents')->put($newPath, $generator->generate($values));
                $positions = $generator->getSignaturePositions();
                $signaturePositions = !empty($positions) ? $positions : null;
            } else {
                Storage::disk('documents')->copy($template->file_path, $newPath);
            }
        } else {
            Storage::disk('documents')->copy($template->file_path, $newPath);
        }

        $document = Document::create([
            'tenant_id'           => $user->tenant_id,
            'user_id'             => $user->id,
            'title'               => $data['title'],
            'file_path'           => $newPath,
            'original_filename'   => $template->name . '.pdf',
            'status'              => DocumentStatus::Draft,
            'expires_at'          => $data['expires_at'] ?? null,
            'signature_positions' => $signaturePositions,
        ]);

        $document->events()->create([
            'tenant_id' => $user->tenant_id,
            'type'      => DocumentEventType::Created,
        ]);

        return $document->load('user:id,name');
    }

    private function findForTenant(User $user, int $id): Template
    {
        $template = Template::findOrFail($id);

        abort_if(
            $template->tenant_id !== null && $template->tenant_id !== $user->tenant_id,
            403,
            'Access denied.'
        );

        return $template;
    }
}
