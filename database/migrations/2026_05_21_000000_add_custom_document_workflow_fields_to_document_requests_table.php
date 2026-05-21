<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            $table->string('document_name')->nullable()->after('document_type_id');
            $table->text('request_notes')->nullable()->after('document_name');
            $table->json('requested_fields')->nullable()->after('request_notes');
            $table->timestamp('accepted_at')->nullable()->after('requested_fields');
            $table->timestamp('requirements_sent_at')->nullable()->after('accepted_at');
            $table->timestamp('client_submitted_at')->nullable()->after('requirements_sent_at');
            $table->timestamp('payment_completed_at')->nullable()->after('client_submitted_at');
        });

        DB::statement("ALTER TABLE document_requests MODIFY COLUMN document_type_id BIGINT UNSIGNED NULL");
        DB::statement("ALTER TABLE document_requests MODIFY COLUMN custom_fields JSON NULL");
        DB::statement("ALTER TABLE document_requests MODIFY COLUMN status ENUM('draft','pending','requested','accepted','rejected','awaiting_client_info','client_info_submitted','awaiting_payment','paid','in_progress','review','completed','delivered') NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE document_requests MODIFY COLUMN status ENUM('draft','pending','accepted','in_progress','review','completed','delivered') NOT NULL DEFAULT 'draft'");
        DB::statement("ALTER TABLE document_requests MODIFY COLUMN custom_fields JSON NOT NULL");
        DB::statement("ALTER TABLE document_requests MODIFY COLUMN document_type_id BIGINT UNSIGNED NOT NULL");

        Schema::table('document_requests', function (Blueprint $table) {
            $table->dropColumn([
                'document_name',
                'request_notes',
                'requested_fields',
                'accepted_at',
                'requirements_sent_at',
                'client_submitted_at',
                'payment_completed_at',
            ]);
        });
    }
};