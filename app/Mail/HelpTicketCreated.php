<?php

namespace App\Mail;

use App\Models\HelpTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class HelpTicketCreated extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;

    public function __construct(HelpTicket $ticket)
    {
        $this->ticket = $ticket;
    }

    public function build()
    {
        return $this->subject('New help ticket: '.$this->ticket->subject)
            ->view('emails.help_ticket_created')
            ->with(['ticket' => $this->ticket]);
    }
}
