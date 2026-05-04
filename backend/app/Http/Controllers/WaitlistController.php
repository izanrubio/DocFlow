<?php

namespace App\Http\Controllers;

use App\Jobs\SendLaunchEmailJob;
use App\Jobs\SendWaitlistConfirmationJob;
use App\Models\Waitlist;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class WaitlistController extends Controller
{
    use ApiResponse;

    // ── Public ─────────────────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        if ($request->input('website')) {
            return $this->success(null, '¡Apuntado! Te avisaremos cuando lancemos DocFlow.');
        }

        $data = $request->validate([
            'email'  => ['required', 'email', 'max:255'],
            'name'   => ['nullable', 'string', 'max:100'],
            'source' => ['nullable', 'string', 'max:50'],
        ]);

        if (Waitlist::where('email', $data['email'])->exists()) {
            return $this->success(null, 'Ya estás en la lista, te avisaremos cuando lancemos.');
        }

        $entry = Waitlist::create([
            'email'      => $data['email'],
            'name'       => $data['name'] ?? null,
            'source'     => $data['source'] ?? null,
            'ip_address' => $request->ip(),
        ]);

        Cache::forget('waitlist_count');

        dispatch(new SendWaitlistConfirmationJob($entry));

        return $this->success(null, '¡Apuntado! Te avisaremos cuando lancemos DocFlow.');
    }

    public function count(): JsonResponse
    {
        $count = Cache::remember('waitlist_count', 300, fn () => Waitlist::count());

        return $this->success(['count' => $count]);
    }

    // ── Admin ──────────────────────────────────────────────────────────────

    public function index(): JsonResponse
    {
        $paginated = Waitlist::orderByDesc('created_at')->paginate(50);

        return response()->json(array_merge(
            $paginated->toArray(),
            ['message' => 'OK', 'status' => 200]
        ));
    }

    public function stats(): JsonResponse
    {
        $stats = Cache::remember('waitlist_stats', 60, fn () => [
            'total'     => Waitlist::count(),
            'today'     => Waitlist::whereDate('created_at', today())->count(),
            'this_week' => Waitlist::where('created_at', '>=', now()->startOfWeek())->count(),
            'by_source' => Waitlist::selectRaw('COALESCE(source, "unknown") as source, COUNT(*) as count')
                ->groupBy('source')
                ->pluck('count', 'source'),
        ]);

        return $this->success($stats);
    }

    public function launch(): JsonResponse
    {
        $launchedAt = Cache::get('waitlist_launched_at');

        if ($launchedAt) {
            abort(422, "Email de lanzamiento ya enviado el {$launchedAt}.");
        }

        $total = Waitlist::count();

        Waitlist::chunk(100, function ($entries): void {
            foreach ($entries as $entry) {
                dispatch(new SendLaunchEmailJob($entry));
            }
        });

        Cache::forever('waitlist_launched_at', now()->toDateTimeString());

        return $this->success(['total_emails' => $total], 'Enviando emails de lanzamiento...');
    }
}
