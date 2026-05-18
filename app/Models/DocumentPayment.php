<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_request_id',
        'amount',
        'payment_method',
        'transaction_id',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function documentRequest()
    {
        return $this->belongsTo(DocumentRequest::class);
    }
}
