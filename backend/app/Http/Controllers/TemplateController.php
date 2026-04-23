<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTemplateRequest;
use App\Http\Requests\UpdateTemplateRequest;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\TemplateResource;
use App\Services\TemplateService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    use ApiResponse;

    public function __construct(private TemplateService $service) {}

    public function index(Request $request): JsonResponse
    {
        $templates = $this->service->list($request->user());

        return $this->success(TemplateResource::collection($templates));
    }

    public function store(StoreTemplateRequest $request): JsonResponse
    {
        $template = $this->service->store(
            $request->user(),
            $request->validated(),
            $request->file('file')
        );

        return $this->success(new TemplateResource($template), 'Template created', 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $template = $this->service->show($request->user(), $id);

        return $this->success(new TemplateResource($template));
    }

    public function update(UpdateTemplateRequest $request, int $id): JsonResponse
    {
        $template = $this->service->update($request->user(), $id, $request->validated());

        return $this->success(new TemplateResource($template));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->service->delete($request->user(), $id);

        return $this->success(null, 'Template deleted');
    }

    public function use(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'title'      => ['required', 'string', 'max:255'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ]);

        $document = $this->service->use($request->user(), $id, $request->only('title', 'expires_at'));

        return $this->success(new DocumentResource($document), 'Document created', 201);
    }
}
