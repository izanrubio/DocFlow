<?php

namespace App\Http\Controllers;

use App\Enums\TenantPlan;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Event;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Stripe;
use Stripe\Webhook;
use UnexpectedValueException;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret    = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (UnexpectedValueException) {
            return response('Invalid payload', 400);
        } catch (SignatureVerificationException) {
            return response('Invalid signature', 400);
        }

        match ($event->type) {
            'checkout.session.completed'    => $this->handleCheckoutCompleted($event),
            'customer.subscription.updated' => $this->handleSubscriptionUpdated($event),
            'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event),
            'invoice.payment_failed'        => $this->handlePaymentFailed($event),
            default                         => null,
        };

        return response('OK', 200);
    }

    private function handleCheckoutCompleted(Event $event): void
    {
        $session = $event->data->object;
        $plan    = $session->metadata->plan ?? null;
        $tenantId = $session->metadata->tenant_id ?? null;

        if (!$tenantId || !$plan) return;

        $tenant = Tenant::find($tenantId);
        if (!$tenant) return;

        $planEnum = match ($plan) {
            'pro'      => TenantPlan::Pro,
            'business' => TenantPlan::Business,
            default    => null,
        };

        if (!$planEnum) return;

        $tenant->update([
            'plan'                   => $planEnum,
            'stripe_subscription_id' => $session->subscription,
            'subscription_status'    => 'active',
        ]);
    }

    private function handleSubscriptionUpdated(Event $event): void
    {
        $sub    = $event->data->object;
        $tenant = Tenant::where('stripe_subscription_id', $sub->id)->first();
        if (!$tenant) return;

        $tenant->update([
            'subscription_status' => $sub->status,
            'current_period_end'  => $sub->current_period_end
                ? \Carbon\Carbon::createFromTimestamp($sub->current_period_end)
                : null,
        ]);
    }

    private function handleSubscriptionDeleted(Event $event): void
    {
        $sub    = $event->data->object;
        $tenant = Tenant::where('stripe_subscription_id', $sub->id)->first();
        if (!$tenant) return;

        $tenant->update([
            'plan'                   => TenantPlan::Free,
            'stripe_subscription_id' => null,
            'subscription_status'    => 'canceled',
            'current_period_end'     => null,
        ]);
    }

    private function handlePaymentFailed(Event $event): void
    {
        $invoice = $event->data->object;
        if (!$invoice->subscription) return;

        $tenant = Tenant::where('stripe_subscription_id', $invoice->subscription)->first();
        if (!$tenant) return;

        $tenant->update(['subscription_status' => 'past_due']);
    }
}
