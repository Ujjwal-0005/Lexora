<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lawyer_profiles', function (Blueprint $table) {
            $table->json('educational_qualifications')->nullable()->after('bio');
            $table->json('admissions_awards')->nullable()->after('educational_qualifications');
            $table->json('cities')->nullable()->after('admissions_awards');
            $table->json('core_competencies')->nullable()->after('cities');
            $table->json('document_expertise')->nullable()->after('core_competencies');
        });
    }

    public function down(): void
    {
        Schema::table('lawyer_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'educational_qualifications',
                'admissions_awards',
                'cities',
                'core_competencies',
                'document_expertise',
            ]);
        });
    }
};
