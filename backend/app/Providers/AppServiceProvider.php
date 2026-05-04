<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by('login:' . $request->ip());
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perHour(3)->by('register:' . $request->ip());
        });

        RateLimiter::for('resend', function (Request $request) {
            return Limit::perHour(3)->by('resend:' . ($request->input('email') ?? $request->ip()));
        });

        RateLimiter::for('sign', function (Request $request) {
            return Limit::perMinute(30)->by('sign:' . $request->ip());
        });

        RateLimiter::for('sign_submit', function (Request $request) {
            return Limit::perMinute(5)->by('sign_submit:' . $request->ip() . ':' . $request->route('token'));
        });

        RateLimiter::for('waitlist', function (Request $request) {
            $max = app()->environment('local') ? 20 : 3;
            return Limit::perHour($max)->by('waitlist:' . $request->ip());
        });

        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(60)->by('api:' . $request->user()->id)
                : Limit::perMinute(30)->by('api:' . $request->ip());
        });
    }
}
