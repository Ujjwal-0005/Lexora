<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'google_avatar',
        'auth_provider',
        'email_verified_at',
        'phone',
        'role',
        'profile_photo',
        'is_verified_by_admin',
        'notification_preferences',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_verified_by_admin' => 'boolean',
        'notification_preferences' => 'array',
    ];

    protected $appends = [
        'photo_url',
    ];

    public function lawyerProfile()
    {
        return $this->hasOne(LawyerProfile::class);
    }

    public function clientConsultations()
    {
        return $this->hasMany(Consultation::class, 'client_id');
    }

    public function documentRequests()
    {
        return $this->hasMany(DocumentRequest::class, 'client_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'client_id');
    }

    public function adminLogs()
    {
        return $this->hasMany(AdminLog::class, 'admin_id');
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isLawyer()
    {
        return $this->role === 'lawyer';
    }

    public function isClient()
    {
        return $this->role === 'client';
    }

    public function notificationPreferences(): array
    {
        $defaults = [
            'email' => true,
            'sms' => false,
            'consultation_reminders' => true,
            'document_updates' => true,
        ];

        return array_merge($defaults, $this->notification_preferences ?? []);
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->profile_photo) {
            return null;
        }

        if (str_starts_with($this->profile_photo, 'http://') || str_starts_with($this->profile_photo, 'https://')) {
            return $this->profile_photo;
        }

        return url(Storage::url($this->profile_photo));
    }
}
