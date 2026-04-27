<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE document_events MODIFY COLUMN type ENUM('created','sent','viewed','signed','rejected','completed','expired','reminder_sent','cancelled') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE document_events MODIFY COLUMN type ENUM('created','sent','viewed','signed','rejected','completed','expired','reminder_sent') NOT NULL");
    }
};
