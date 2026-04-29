<?php

namespace App\Services;

use App\Enums\TeamRole;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Str;

class AuthService
{
    public function register(string $name, string $email, string $password): User
    {
        $tenant = Tenant::create([
            'name' => $name,
            'slug' => $this->generateSlug($name),
        ]);

        return User::create([
            'tenant_id' => $tenant->id,
            'name'      => $name,
            'email'     => $email,
            'password'  => $password,
            'role'      => TeamRole::Admin,
        ]);
    }

    private function generateSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $count = 1;

        while (Tenant::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$count}";
            $count++;
        }

        return $slug;
    }
}
