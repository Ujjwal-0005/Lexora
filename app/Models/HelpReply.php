<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HelpReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'help_ticket_id',
        'user_id',
        'is_admin',
        'message',
    ];

    public function ticket()
    {
        return $this->belongsTo(HelpTicket::class, 'help_ticket_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
