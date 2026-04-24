<?php

return [
    'free' => [
        'name'            => 'Gratuito',
        'price_monthly'   => 0,
        'stripe_price_id' => null,
        'limits'          => [
            'documents_per_month'  => 5,
            'signers_per_document' => 2,
            'templates'            => 3,
            'storage_mb'           => 100,
        ],
    ],
    'pro' => [
        'name'            => 'Profesional',
        'price_monthly'   => 19,
        'stripe_price_id' => env('STRIPE_PRICE_PRO'),
        'limits'          => [
            'documents_per_month'  => 50,
            'signers_per_document' => 10,
            'templates'            => 20,
            'storage_mb'           => 1000,
        ],
    ],
    'business' => [
        'name'            => 'Business',
        'price_monthly'   => 49,
        'stripe_price_id' => env('STRIPE_PRICE_BUSINESS'),
        'limits'          => [
            'documents_per_month'  => -1,
            'signers_per_document' => -1,
            'templates'            => -1,
            'storage_mb'           => 10000,
        ],
    ],
];
