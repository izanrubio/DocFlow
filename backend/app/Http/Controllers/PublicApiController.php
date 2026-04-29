<?php

namespace App\Http\Controllers;

use App\Http\Resources\DocumentResource;
use App\Http\Resources\SignerResource;
use App\Models\Template;
use App\Models\User;
use App\Services\DocumentService;
use App\Services\PlanService;
use App\Services\SignerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PublicApiController extends Controller
{
    public function __construct(
        private DocumentService $documentService,
        private SignerService   $signerService,
        private PlanService     $planService,
    ) {}

    // ── Documents ──────────────────────────────────────────────────────────

    public function listDocuments(Request $request): JsonResponse
    {
        $paginated = $this->documentService->list(
            $this->apiUser($request),
            $request->only('status', 'search', 'signer_email', 'signer_name', 'date_from', 'date_to', 'per_page')
        );

        return response()->json([
            'object' => 'list',
            'data'   => DocumentResource::collection($paginated)->resolve(),
            'meta'   => [
                'total'    => $paginated->total(),
                'page'     => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
            ],
        ]);
    }

    public function storeDocument(Request $request): JsonResponse
    {
        $request->validate([
            'title'      => ['required', 'string', 'max:255'],
            'file'       => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ]);

        $document = $this->documentService->store(
            $this->apiUser($request),
            $request->only('title', 'expires_at'),
            $request->file('file')
        );

        return response()->json([
            'object' => 'document',
            'data'   => (new DocumentResource($document))->resolve(),
        ], 201);
    }

    public function showDocument(Request $request, int $id): JsonResponse
    {
        $document = $this->documentService->show($this->apiUser($request), $id);

        return response()->json([
            'object' => 'document',
            'data'   => (new DocumentResource($document))->resolve(),
        ]);
    }

    public function destroyDocument(Request $request, int $id): JsonResponse
    {
        $this->documentService->delete($this->apiUser($request), $id);

        return response()->json(['object' => 'deleted', 'data' => ['id' => $id, 'deleted' => true]]);
    }

    public function downloadDocument(Request $request, int $id): JsonResponse
    {
        $document = $this->documentService->show($this->apiUser($request), $id);

        abort_if($document->status->value !== 'completed', 422, 'El documento aún no está firmado.');
        abort_if(!$document->signed_file_path, 404, 'Archivo firmado no encontrado.');

        $url = Storage::disk('documents_public')
            ->temporaryUrl($document->signed_file_path, now()->addHours(24));

        return response()->json(['object' => 'download', 'data' => ['download_url' => $url]]);
    }

    public function downloadOriginal(Request $request, int $id): JsonResponse
    {
        $document = $this->documentService->show($this->apiUser($request), $id);

        $url = Storage::disk('documents_public')
            ->temporaryUrl($document->file_path, now()->addMinutes(60));

        return response()->json(['object' => 'download', 'data' => ['download_url' => $url]]);
    }

    // ── Signers ────────────────────────────────────────────────────────────

    public function storeSigner(Request $request, int $documentId): JsonResponse
    {
        $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'order' => ['required', 'integer', 'min:1'],
        ]);

        $signer = $this->signerService->add(
            $this->apiUser($request),
            $documentId,
            $request->only('name', 'email', 'order')
        );

        return response()->json([
            'object' => 'signer',
            'data'   => (new SignerResource($signer))->resolve(),
        ], 201);
    }

    public function destroySigner(Request $request, int $documentId, int $signerId): JsonResponse
    {
        $this->signerService->remove($this->apiUser($request), $documentId, $signerId);

        return response()->json(['object' => 'deleted', 'data' => ['id' => $signerId, 'deleted' => true]]);
    }

    public function sendDocument(Request $request, int $documentId): JsonResponse
    {
        $doc = $this->signerService->send($this->apiUser($request), $documentId);

        return response()->json([
            'object' => 'document',
            'data'   => (new DocumentResource($doc))->resolve(),
        ]);
    }

    // ── Templates ──────────────────────────────────────────────────────────

    public function listTemplates(Request $request): JsonResponse
    {
        $user      = $this->apiUser($request);
        $templates = Template::where(fn ($q) =>
            $q->where('tenant_id', $user->tenant_id)->orWhere('is_system', true)
        )
        ->orderByDesc('created_at')
        ->get(['id', 'name', 'description', 'is_system', 'variables', 'created_at']);

        return response()->json([
            'object' => 'list',
            'data'   => $templates,
            'meta'   => ['total' => $templates->count()],
        ]);
    }

    // ── Me ─────────────────────────────────────────────────────────────────

    public function me(Request $request): JsonResponse
    {
        $user   = $this->apiUser($request);
        $tenant = $user->tenant;
        $usage  = $this->planService->getCurrentUsage($tenant);
        $limits = $this->planService->getLimits($tenant);

        return response()->json([
            'object' => 'tenant',
            'data'   => [
                'tenant' => [
                    'id'   => $tenant->id,
                    'name' => $tenant->name,
                    'plan' => $tenant->plan->value,
                ],
                'usage'  => $usage,
                'limits' => $limits,
            ],
        ]);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private function apiUser(Request $request): User
    {
        return $request->attributes->get('api_user');
    }
}
