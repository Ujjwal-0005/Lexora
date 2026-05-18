<h3>New help ticket</h3>
<p>A new help ticket was created by {{ $ticket->user->name ?? $ticket->user->email }}.</p>
<p><strong>Subject:</strong> {{ $ticket->subject }}</p>
<p><strong>Message:</strong></p>
<p>{{ $ticket->message }}</p>
