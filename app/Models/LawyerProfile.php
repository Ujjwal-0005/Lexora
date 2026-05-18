<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LawyerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'license_number',
        'bar_council_id',
        'years_of_experience',
        'designation',
        'bio',
        'educational_qualifications',
        'admissions_awards',
        'cities',
        'core_competencies',
        'document_expertise',
        'consultation_fee',
        'consultation_fee_60',
        'consultation_fee_90',
        'is_available',
        'average_rating',
        'total_consultations',
    ];

    protected $casts = [
        'consultation_fee' => 'decimal:2',
        'consultation_fee_60' => 'decimal:2',
        'consultation_fee_90' => 'decimal:2',
        'average_rating' => 'float',
        'is_available' => 'boolean',
        'educational_qualifications' => 'array',
        'admissions_awards' => 'array',
        'cities' => 'array',
        'core_competencies' => 'array',
        'document_expertise' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function specializations()
    {
        return $this->belongsToMany(Specialization::class, 'lawyer_specialization');
    }

    public function regions()
    {
        return $this->belongsToMany(Region::class, 'lawyer_region');
    }

    public function documentTypes()
    {
        return $this->belongsToMany(DocumentType::class, 'lawyer_document_type')
            ->withPivot('custom_price');
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }

    public function documentRequests()
    {
        return $this->hasMany(DocumentRequest::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
