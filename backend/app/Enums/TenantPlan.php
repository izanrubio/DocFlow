<?php

namespace App\Enums;

enum TenantPlan: string
{
    case Free = 'free';
    case Pro = 'pro';
    case Business = 'business';
}
