<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentEvent;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Waitlist;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SuperAdminController extends Controller
{
    use ApiResponse;

    public function stats(): JsonResponse
    {
        $tenantsTotal    = Tenant::count();
        $tenantsFree     = Tenant::where('plan', 'free')->count();
        $tenantsPro      = Tenant::where('plan', 'pro')->count();
        $tenantsBusiness = Tenant::where('plan', 'business')->count();

        $usersTotal          = User::count();
        $documentsTotal      = Document::count();
        $documentsCompleted  = Document::where('status', 'completed')->count();
        $documentsThisMonth  = Document::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)->count();

        $waitlistTotal = Waitlist::count();
        $mrr           = ($tenantsPro * 19) + ($tenantsBusiness * 49);

        $newTenantsToday     = Tenant::whereDate('created_at', today())->count();
        $newTenantsThisWeek  = Tenant::where('created_at', '>=', now()->startOfWeek())->count();
        $newTenantsThisMonth = Tenant::where('created_at', '>=', now()->startOfMonth())->count();

        $rawCounts = Tenant::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date');

        $last30Days = collect(range(29, 0))->map(fn($i) => [
            'date'  => now()->subDays($i)->toDateString(),
            'count' => $rawCounts[now()->subDays($i)->toDateString()] ?? 0,
        ])->values();

        return $this->success([
            'tenants_total'              => $tenantsTotal,
            'tenants_free'               => $tenantsFree,
            'tenants_pro'                => $tenantsPro,
            'tenants_business'           => $tenantsBusiness,
            'users_total'                => $usersTotal,
            'documents_total'            => $documentsTotal,
            'documents_completed'        => $documentsCompleted,
            'documents_this_month'       => $documentsThisMonth,
            'waitlist_total'             => $waitlistTotal,
            'mrr_estimated'              => $mrr,
            'new_tenants_today'          => $newTenantsToday,
            'new_tenants_this_week'      => $newTenantsThisWeek,
            'new_tenants_this_month'     => $newTenantsThisMonth,
            'registrations_last_30_days' => $last30Days,
        ]);
    }

    public function tenants(Request $request): JsonResponse
    {
        $query = Tenant::withCount(['users', 'documents'])
            ->with(['users' => fn($q) => $q->where('is_owner', true)->select('id', 'tenant_id', 'name', 'email')]);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhereHas('users', fn($uq) => $uq->where('email', 'like', "%{$search}%")
                      ->orWhere('name', 'like', "%{$search}%"));
            });
        }

        if ($plan = $request->get('plan')) {
            $query->where('plan', $plan);
        }

        $paginated = $query->latest()->paginate(20);

        $paginated->getCollection()->transform(function ($tenant) {
            $owner     = $tenant->users->first();
            $lastLogin = $owner ? DB::table('personal_access_tokens')
                ->where('tokenable_id', $owner->id)
                ->orderByDesc('last_used_at')
                ->value('last_used_at') : null;

            $completedCount = Document::where('tenant_id', $tenant->id)
                ->where('status', 'completed')->count();

            return [
                'id'                        => $tenant->id,
                'name'                      => $tenant->name,
                'slug'                      => $tenant->slug,
                'plan'                      => $tenant->plan->value,
                'created_at'                => $tenant->created_at,
                'owner'                     => $owner ? ['name' => $owner->name, 'email' => $owner->email, 'last_login_at' => $lastLogin] : null,
                'users_count'               => $tenant->users_count,
                'documents_count'           => $tenant->documents_count,
                'documents_completed_count' => $completedCount,
                'stripe_subscription_id'    => $tenant->stripe_subscription_id,
                'subscription_status'       => $tenant->subscription_status,
            ];
        });

        return $this->success($paginated);
    }

    public function tenantDetail(int $id): JsonResponse
    {
        $tenant = Tenant::with([
            'users',
            'documents' => fn($q) => $q->latest()->limit(10)->withCount([
                'signers',
                'signers as signers_signed_count' => fn($q) => $q->where('status', 'signed'),
            ]),
        ])->findOrFail($id);

        $owner     = $tenant->users->firstWhere('is_owner', true);
        $lastLogin = $owner ? DB::table('personal_access_tokens')
            ->where('tokenable_id', $owner->id)
            ->orderByDesc('last_used_at')
            ->value('last_used_at') : null;

        $recentEvents = DocumentEvent::where('tenant_id', $id)
            ->with('document:id,title')
            ->latest()
            ->limit(5)
            ->get();

        $completedCount = Document::where('tenant_id', $id)->where('status', 'completed')->count();
        $totalCount     = Document::where('tenant_id', $id)->count();

        return $this->success([
            'id'                        => $tenant->id,
            'name'                      => $tenant->name,
            'slug'                      => $tenant->slug,
            'plan'                      => $tenant->plan->value,
            'created_at'                => $tenant->created_at,
            'stripe_subscription_id'    => $tenant->stripe_subscription_id,
            'subscription_status'       => $tenant->subscription_status,
            'owner'                     => $owner ? ['name' => $owner->name, 'email' => $owner->email, 'last_login_at' => $lastLogin] : null,
            'users_count'               => $tenant->users->count(),
            'documents_count'           => $totalCount,
            'documents_completed_count' => $completedCount,
            'users'                     => $tenant->users->map(fn($u) => [
                'id'                => $u->id,
                'name'              => $u->name,
                'email'             => $u->email,
                'role'              => $u->role->value,
                'is_owner'          => $u->is_owner,
                'email_verified_at' => $u->email_verified_at,
                'created_at'        => $u->created_at,
            ]),
            'recent_documents'          => $tenant->documents->map(fn($d) => [
                'id'             => $d->id,
                'title'          => $d->title,
                'status'         => $d->status->value,
                'signers_total'  => $d->signers_count,
                'signers_signed' => $d->signers_signed_count,
                'created_at'     => $d->created_at,
            ]),
            'recent_events'             => $recentEvents->map(fn($e) => [
                'id'             => $e->id,
                'type'           => $e->type->value,
                'document_title' => $e->document?->title,
                'created_at'     => $e->created_at,
            ]),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::with('tenant:id,name,plan');

        if ($search = $request->get('search')) {
            $query->where(fn($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        if ($role = $request->get('role')) {
            $query->where('role', $role);
        }

        if ($request->boolean('unverified')) {
            $query->whereNull('email_verified_at');
        }

        $paginated = $query->latest()->paginate(20);

        $paginated->getCollection()->transform(function ($user) {
            $lastActivity = DB::table('personal_access_tokens')
                ->where('tokenable_id', $user->id)
                ->orderByDesc('last_used_at')
                ->value('last_used_at');

            return [
                'id'                => $user->id,
                'name'              => $user->name,
                'email'             => $user->email,
                'role'              => $user->role->value,
                'is_owner'          => $user->is_owner,
                'email_verified_at' => $user->email_verified_at,
                'created_at'        => $user->created_at,
                'last_activity'     => $lastActivity,
                'tenant'            => $user->tenant ? ['name' => $user->tenant->name, 'plan' => $user->tenant->plan->value] : null,
            ];
        });

        return $this->success($paginated);
    }

    public function changePlan(Request $request, int $id): JsonResponse
    {
        $request->validate(['plan' => 'required|in:free,pro,business']);

        $tenant  = Tenant::findOrFail($id);
        $oldPlan = $tenant->plan->value;
        $tenant->update(['plan' => $request->plan]);

        return $this->success(
            ['id' => $tenant->id, 'plan' => $request->plan],
            "Plan cambiado de {$oldPlan} a {$request->plan}."
        );
    }

    public function activity(): JsonResponse
    {
        $events = DocumentEvent::with(['document:id,title,tenant_id', 'document.tenant:id,name'])
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn($e) => [
                'id'             => $e->id,
                'type'           => $e->type->value,
                'document_id'    => $e->document_id,
                'document_title' => $e->document?->title,
                'tenant_name'    => $e->document?->tenant?->name,
                'created_at'     => $e->created_at,
            ]);

        return $this->success($events);
    }

    public function waitlist(Request $request): JsonResponse
    {
        $entries = Waitlist::latest()->paginate(20);
        return $this->success($entries);
    }

    public function waitlistStats(): JsonResponse
    {
        return $this->success([
            'total'      => Waitlist::count(),
            'today'      => Waitlist::whereDate('created_at', today())->count(),
            'this_week'  => Waitlist::where('created_at', '>=', now()->startOfWeek())->count(),
            'by_source'  => Waitlist::selectRaw('source, COUNT(*) as count')
                ->whereNotNull('source')
                ->groupBy('source')
                ->pluck('count', 'source'),
        ]);
    }
}
