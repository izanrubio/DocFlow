<?php

namespace App\Services;

use App\Enums\TenantPlan;
use App\Models\Tenant;
use Stripe\BillingPortal\Session as PortalSession;
use Stripe\Checkout\Session as CheckoutSession;
use Stripe\Customer;
use Stripe\Stripe;
use Stripe\Subscription;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function getOrCreateCustomer(Tenant $tenant): string
    {
        if ($tenant->stripe_customer_id) {
            return $tenant->stripe_customer_id;
        }

        $customer = Customer::create([
            'name'     => $tenant->name,
            'metadata' => ['tenant_id' => $tenant->id],
        ]);

        $tenant->update(['stripe_customer_id' => $customer->id]);

        return $customer->id;
    }

    public function createCheckoutSession(Tenant $tenant, string $plan): string
    {
        $priceId     = config("plans.{$plan}.stripe_price_id");
        $customerId  = $this->getOrCreateCustomer($tenant);
        $frontendUrl = env('APP_FRONTEND_URL', 'http://localhost:5173');

        $session = CheckoutSession::create([
            'customer'             => $customerId,
            'payment_method_types' => ['card'],
            'line_items'           => [['price' => $priceId, 'quantity' => 1]],
            'mode'                 => 'subscription',
            'success_url'          => "{$frontendUrl}/settings/billing?success=true",
            'cancel_url'           => "{$frontendUrl}/settings/billing?canceled=true",
            'metadata'             => ['tenant_id' => $tenant->id, 'plan' => $plan],
        ]);

        return $session->url;
    }

    public function createBillingPortalSession(Tenant $tenant): string
    {
        $customerId  = $this->getOrCreateCustomer($tenant);
        $frontendUrl = env('APP_FRONTEND_URL', 'http://localhost:5173');

        $session = PortalSession::create([
            'customer'   => $customerId,
            'return_url' => "{$frontendUrl}/settings/billing",
        ]);

        return $session->url;
    }

    public function cancelSubscription(Tenant $tenant): void
    {
        if (!$tenant->stripe_subscription_id) return;

        Subscription::cancel($tenant->stripe_subscription_id);

        $tenant->update([
            'plan'                   => TenantPlan::Free,
            'stripe_subscription_id' => null,
            'subscription_status'    => null,
            'current_period_end'     => null,
        ]);
    }
}
