<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lawyer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('license_number')->unique();
            $table->string('bar_council_id');
            $table->integer('years_of_experience')->default(0);
            $table->text('bio')->nullable();
            $table->decimal('consultation_fee', 10, 2)->default(0);
            $table->decimal('consultation_fee_60', 10, 2)->default(0);
            $table->decimal('consultation_fee_90', 10, 2)->default(0);
            $table->boolean('is_available')->default(true);
            $table->float('average_rating')->default(0);
            $table->integer('total_consultations')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lawyer_profiles');
    }
};
