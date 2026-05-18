<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add new statuses: pending, accepted, in_progress
        // MySQL requires redefining the entire enum list
        DB::statement("ALTER TABLE document_requests MODIFY COLUMN status ENUM('draft','pending','accepted','in_progress','review','completed','delivered') NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        // Revert to original enum
        DB::statement("ALTER TABLE document_requests MODIFY COLUMN status ENUM('draft','review','completed','delivered') NOT NULL DEFAULT 'draft'");
    }
};
