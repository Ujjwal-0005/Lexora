<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'lawyer_profile_id',
        'specialization_id',
        'scheduled_at',
        'duration',
        'status',
        'fee',
        'meeting_link',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'duration' => 'integer',
        'fee' => 'decimal:2',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function lawyerProfile()
    {
        return $this->belongsTo(LawyerProfile::class);
    }

    public function specialization()
    {
        return $this->belongsTo(Specialization::class);
    }

    public function payment()
    {
        return $this->hasOne(ConsultationPayment::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
