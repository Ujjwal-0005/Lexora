<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'base_template',
        'base_price',
        'icon',
        'field_definitions',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'field_definitions' => 'array',
    ];

    public function toArray()
    {
        $array = parent::toArray();
        // Ensure field_definitions is always included
        if ($this->field_definitions) {
            $array['field_definitions'] = $this->field_definitions;
        }
        return $array;
    }

    public function lawyerProfiles()
    {
        return $this->belongsToMany(LawyerProfile::class, 'lawyer_document_type')
            ->withPivot('custom_price');
    }

    public function documentRequests()
    {
        return $this->hasMany(DocumentRequest::class);
    }
}
