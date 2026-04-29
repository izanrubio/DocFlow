<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_owner')->default(false)->after('role');
        });

        // First user of each tenant is the owner
        DB::statement('
            UPDATE users SET is_owner = TRUE
            WHERE id IN (
                SELECT min_id FROM (
                    SELECT MIN(id) AS min_id FROM users GROUP BY tenant_id
                ) AS subquery
            )
        ');
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_owner');
        });
    }
};
