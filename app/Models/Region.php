<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'state',
        'city',
        'type',
    ];

    public function lawyerProfiles()
    {
        return $this->belongsToMany(LawyerProfile::class, 'lawyer_region');
    }
}
