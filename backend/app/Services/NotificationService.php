<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService
{
    private const MAX_PER_USER = 100;

    public function create(User $user, string $type, string $title, string $message, array $data = []): Notification
    {
        $count = Notification::where('user_id', $user->id)->count();

        if ($count >= self::MAX_PER_USER) {
            Notification::where('user_id', $user->id)
                ->orderBy('created_at')
                ->limit($count - self::MAX_PER_USER + 1)
                ->delete();
        }

        return Notification::create([
            'tenant_id' => $user->tenant_id,
            'user_id'   => $user->id,
            'type'      => $type,
            'title'     => $title,
            'message'   => $message,
            'data'      => $data ?: null,
        ]);
    }

    public function markAsRead(Notification $notification): void
    {
        if (!$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }
    }

    public function markAllAsRead(User $user): void
    {
        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)->unread()->count();
    }

    public function getForUser(User $user, int $limit = 20): Collection
    {
        return Notification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function warnIfApproachingLimit(User $user, PlanService $planService): void
    {
        $percentages = $planService->getUsagePercentages($user->tenant);

        if ($percentages['documents'] < 80) {
            return;
        }

        $alreadyWarned = Notification::where('user_id', $user->id)
            ->where('type', 'plan_limit_warning')
            ->whereDate('created_at', today())
            ->exists();

        if ($alreadyWarned) {
            return;
        }

        $this->create(
            $user,
            'plan_limit_warning',
            'Límite de plan cercano',
            "Has usado el {$percentages['documents']}% de tus documentos este mes",
            ['type' => 'plan_limit_warning']
        );
    }
}
