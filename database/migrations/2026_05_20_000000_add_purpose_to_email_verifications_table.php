<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('email_verifications') && !Schema::hasColumn('email_verifications', 'purpose')) {
            Schema::table('email_verifications', function (Blueprint $table) {
                $table->string('purpose')->default('register')->after('payload');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('email_verifications') && Schema::hasColumn('email_verifications', 'purpose')) {
            Schema::table('email_verifications', function (Blueprint $table) {
                $table->dropColumn('purpose');
            });
        }
    }
};
