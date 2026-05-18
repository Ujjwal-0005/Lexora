<?php

namespace App\Mail;

use App\Models\DocumentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentRequestedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public DocumentRequest $documentRequest)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your document request has been received',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.document_requested',
            with: [
                'documentRequest' => $this->documentRequest,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
