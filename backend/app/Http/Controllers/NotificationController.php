<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    public function __construct(private NotificationService $service) {}

    public function index(Request $request): JsonResponse
    {
        $notifications = $this->service->getForUser($request->user());

        return $this->success($notifications->map(fn ($n) => [
            'id'         => $n->id,
            'type'       => $n->type,
            'title'      => $n->title,
            'message'    => $n->message,
            'data'       => $n->data,
            'read_at'    => $n->read_at?->toIso8601String(),
            'created_at' => $n->created_at->toIso8601String(),
        ]));
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return $this->success(['count' => $this->service->getUnreadCount($request->user())]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $this->service->markAsRead($notification);

        return $this->success(null, 'Notificación marcada como leída.');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->service->markAllAsRead($request->user());

        return $this->success(null, 'Todas las notificaciones marcadas como leídas.');
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        Notification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail()
            ->delete();

        return $this->success(null, 'Notificación eliminada.');
    }
}
