<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Services\DocumentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    use ApiResponse;
    public function __construct(private DocumentService $service) {}

    public function index(Request $request): JsonResponse
    {
        $paginated = $this->service->list(
            $request->user(),
            $request->only('status', 'search', 'signer_email', 'signer_name', 'date_from', 'date_to')
        );
        $resource  = DocumentResource::collection($paginated);

        return response()->json(
            array_merge($resource->response()->getData(true), ['message' => 'OK', 'status' => 200]),
            200
        );
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $document = $this->service->store(
            $request->user(),
            $request->validated(),
            $request->file('file')
        );

        return $this->success(new DocumentResource($document), 'Document uploaded successfully', 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $document = $this->service->show($request->user(), $id);

        return $this->success(new DocumentResource($document));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->service->delete($request->user(), $id);

        return $this->success(null, 'Document deleted successfully');
    }

    public function download(Request $request, int $id): JsonResponse
    {
        $document = $this->service->show($request->user(), $id);

        abort_if($document->status !== DocumentStatus::Completed, 422, 'Document is not completed yet.');
        abort_if(!$document->signed_file_path, 404, 'Signed file not found.');

        $url = Storage::disk('documents_public')
            ->temporaryUrl($document->signed_file_path, now()->addHours(24));

        return $this->success(['download_url' => $url]);
    }
}
