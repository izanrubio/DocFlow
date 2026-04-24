<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('plan');
            $table->string('stripe_subscription_id')->nullable()->after('stripe_customer_id');
            $table->string('subscription_status')->nullable()->after('stripe_subscription_id');
            $table->timestamp('current_period_end')->nullable()->after('subscription_status');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['stripe_customer_id', 'stripe_subscription_id', 'subscription_status', 'current_period_end']);
        });
    }
};
