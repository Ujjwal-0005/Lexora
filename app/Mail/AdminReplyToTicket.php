<?php

namespace App\Mail;

use App\Models\HelpTicket;
use App\Models\HelpReply;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminReplyToTicket extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;
    public $reply;

    public function __construct(HelpTicket $ticket, HelpReply $reply)
    {
        $this->ticket = $ticket;
        $this->reply = $reply;
    }

    public function build()
    {
        return $this->subject('Response to your help request: '.$this->ticket->subject)
            ->view('emails.admin_reply')
            ->with(['ticket' => $this->ticket, 'reply' => $this->reply]);
    }
}
