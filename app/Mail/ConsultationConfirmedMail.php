<?php

namespace App\Mail;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ConsultationConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Consultation $consultation)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your consultation has been confirmed',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.consultation_confirmed',
            with: [
                'consultation' => $this->consultation,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
