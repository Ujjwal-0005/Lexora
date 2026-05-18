<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('lawyer_profile_id')->nullable()->constrained('lawyer_profiles')->onDelete('set null');
            $table->foreignId('document_type_id')->constrained('document_types')->onDelete('cascade');
            $table->json('custom_fields');
            $table->enum('status', ['draft', 'review', 'completed', 'delivered'])->default('draft');
            $table->decimal('price', 10, 2);
            $table->string('generated_file_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_requests');
    }
};
