<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lawyer_profiles', function (Blueprint $table) {
            $table->decimal('consultation_fee_60', 10, 2)->default(0)->after('consultation_fee');
            $table->decimal('consultation_fee_90', 10, 2)->default(0)->after('consultation_fee_60');
        });
    }

    public function down(): void
    {
        Schema::table('lawyer_profiles', function (Blueprint $table) {
            $table->dropColumn(['consultation_fee_60', 'consultation_fee_90']);
        });
    }
};
