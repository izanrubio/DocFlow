<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSignerRequest;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\SignerResource;
use App\Services\SignerService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SignerController extends Controller
{
    use ApiResponse;

    public function __construct(private SignerService $service) {}

    public function store(StoreSignerRequest $request, int $document): JsonResponse
    {
        $signer = $this->service->add($request->user(), $document, $request->validated());

        return $this->success(new SignerResource($signer), 'Signer added successfully', 201);
    }

    public function destroy(Request $request, int $document, int $signer): JsonResponse
    {
        $this->service->remove($request->user(), $document, $signer);

        return $this->success(null, 'Signer removed successfully');
    }

    public function send(Request $request, int $document): JsonResponse
    {
        $doc = $this->service->send($request->user(), $document);

        return $this->success(new DocumentResource($doc), 'Document sent to signers');
    }
}
