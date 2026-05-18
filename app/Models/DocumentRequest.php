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
        'custom_fields',
        'status',
        'price',
        'generated_file_path',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'price' => 'decimal:2',
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
