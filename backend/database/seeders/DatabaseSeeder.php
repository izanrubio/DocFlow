<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- Wipe ---
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('document_events')->truncate();
        DB::table('signatures')->truncate();
        DB::table('signers')->truncate();
        DB::table('documents')->truncate();
        DB::table('personal_access_tokens')->truncate();
        DB::table('templates')->truncate();
        DB::table('users')->truncate();
        DB::table('tenants')->truncate();
        DB::table('cache')->truncate();
        DB::table('cache_locks')->truncate();
        DB::table('jobs')->truncate();
        DB::table('failed_jobs')->truncate();
        DB::table('job_batches')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $this->command->info('Database wiped (system templates preserved).');

        // --- Seed ---
        $this->call([
            SystemTemplatesSeeder::class,
            TestDataSeeder::class,
        ]);
    }
}
