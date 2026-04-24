<?php

namespace App\Models;

use App\Enums\TenantPlan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    protected $fillable = [
        'name', 'slug', 'plan', 'trial_ends_at',
        'stripe_customer_id', 'stripe_subscription_id',
        'subscription_status', 'current_period_end',
    ];

    protected $casts = [
        'plan'               => TenantPlan::class,
        'trial_ends_at'      => 'datetime',
        'current_period_end' => 'datetime',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function templates(): HasMany
    {
        return $this->hasMany(Template::class);
    }
}
