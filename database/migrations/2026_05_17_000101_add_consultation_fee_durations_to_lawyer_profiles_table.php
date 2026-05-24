<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('lawyer_profiles')) {
            return;
        }

        Schema::table('lawyer_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('lawyer_profiles', 'consultation_fee_60')) {
                $table->decimal('consultation_fee_60', 10, 2)->default(0)->after('consultation_fee');
            }

            if (!Schema::hasColumn('lawyer_profiles', 'consultation_fee_90')) {
                $table->decimal('consultation_fee_90', 10, 2)->default(0)->after('consultation_fee_60');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('lawyer_profiles')) {
            return;
        }

        Schema::table('lawyer_profiles', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('lawyer_profiles', 'consultation_fee_60')) {
                $columns[] = 'consultation_fee_60';
            }

            if (Schema::hasColumn('lawyer_profiles', 'consultation_fee_90')) {
                $columns[] = 'consultation_fee_90';
            }

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
