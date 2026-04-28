<?php

namespace App\Http\Controllers;

use App\Services\PlanService;
use App\Services\StripeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    use ApiResponse;

    public function __construct(
        private PlanService   $planService,
        private StripeService $stripeService,
    ) {}

    public function plans(Request $request): JsonResponse
    {
        $currentPlan = $request->user()->tenant->plan->value;

        $plans = collect(config('plans'))->map(function ($plan, $key) use ($currentPlan) {
            return [
                'key'           => $key,
                'name'          => $plan['name'],
                'price_monthly' => $plan['price_monthly'],
                'limits'        => $plan['limits'],
                'is_current'    => $key === $currentPlan,
            ];
        })->values();

        return $this->success($plans);
    }

    public function usage(Request $request): JsonResponse
    {
        $tenant  = $request->user()->tenant;
        $limits  = $this->planService->getLimits($tenant);
        $usage   = $this->planService->getCurrentUsage($tenant);
        $pcts    = $this->planService->getUsagePercentages($tenant);

        return $this->success([
            'plan'      => $tenant->plan->value,
            'plan_name' => config('plans.' . $tenant->plan->value . '.name'),
            'limits'    => $limits,
            'usage'     => [
                'documents_this_month' => $usage['documents_this_month'],
                'documents_limit'      => $limits['documents_per_month'],
                'templates_count'      => $usage['templates_count'],
                'templates_limit'      => $limits['templates'],
            ],
            'percentages' => $pcts,
        ]);
    }

    public function checkout(Request $request, string $plan): JsonResponse
    {
        abort_if(!array_key_exists($plan, config('plans')), 404, 'Plan no encontrado.');
        abort_if($plan === 'free', 422, 'No se puede hacer checkout del plan gratuito.');

        $tenant = $request->user()->tenant;
        $url    = $this->stripeService->createCheckoutSession($tenant, $plan);

        return $this->success(['checkout_url' => $url]);
    }

    public function portal(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;
        $url    = $this->stripeService->createBillingPortalSession($tenant);

        return $this->success(['portal_url' => $url]);
    }

    public function subscription(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;

        return $this->success([
            'plan'                   => $tenant->plan->value,
            'plan_name'              => config('plans.' . $tenant->plan->value . '.name'),
            'subscription_status'    => $tenant->subscription_status,
            'current_period_end'     => $tenant->current_period_end?->toIso8601String(),
            'stripe_subscription_id' => $tenant->stripe_subscription_id,
        ]);
    }

    public function invoices(Request $request): JsonResponse
    {
        $tenant = $request->user()->tenant;

        if (!$tenant->stripe_customer_id) {
            return $this->success([]);
        }

        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $invoices = \Stripe\Invoice::all([
            'customer' => $tenant->stripe_customer_id,
            'limit'    => 24,
        ]);

        $formatted = collect($invoices->data)->map(fn ($inv) => [
            'id'          => $inv->id,
            'number'      => $inv->number,
            'date'        => date('Y-m-d', $inv->created),
            'amount'      => $inv->amount_paid / 100,
            'currency'    => $inv->currency,
            'status'      => $inv->status,
            'pdf_url'     => $inv->invoice_pdf,
            'hosted_url'  => $inv->hosted_invoice_url,
        ]);

        return $this->success($formatted);
    }
}
