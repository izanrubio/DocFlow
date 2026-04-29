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
            $table->enum('role', ['admin', 'editor', 'viewer'])->default('admin')->after('tenant_id');
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete()->after('role');
        });

        DB::statement("UPDATE users SET role = 'admin' WHERE role IS NULL OR role = ''");
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['invited_by']);
            $table->dropColumn(['role', 'invited_by']);
        });
    }
};
