<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'lawyer_profile_id',
        'document_type_id',
        'document_name',
        'request_notes',
        'requested_fields',
        'custom_fields',
        'status',
        'price',
        'generated_file_path',
        'accepted_at',
        'requirements_sent_at',
        'client_submitted_at',
        'payment_completed_at',
    ];

    protected $casts = [
        'requested_fields' => 'array',
        'custom_fields' => 'array',
        'price' => 'decimal:2',
        'accepted_at' => 'datetime',
        'requirements_sent_at' => 'datetime',
        'client_submitted_at' => 'datetime',
        'payment_completed_at' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function payment()
    {
        return $this->hasOne(DocumentPayment::class);
    }
}
