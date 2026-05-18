<?php

namespace App\Mail;

use App\Models\HelpTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class HelpTicketResolved extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;

    public function __construct(HelpTicket $ticket)
    {
        $this->ticket = $ticket;
    }

    public function build()
    {
        return $this->subject('Your help request has been resolved: '.$this->ticket->subject)
            ->view('emails.help_ticket_resolved')
            ->with(['ticket' => $this->ticket]);
    }
}
