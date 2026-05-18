<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specialization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
    ];

    public function lawyerProfiles()
    {
        return $this->belongsToMany(LawyerProfile::class, 'lawyer_specialization');
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }
}
