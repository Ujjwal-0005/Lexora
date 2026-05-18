@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Ticket #{{ $helpTicket->id }} - {{ $helpTicket->subject }}</h1>
    <p>User: {{ $helpTicket->user->name }} ({{ $helpTicket->user->email }})</p>
    <p>Status: {{ $helpTicket->status }}</p>

    <div class="mb-3">
        <h4>Conversation</h4>
        @foreach($helpTicket->replies as $r)
            <div class="card mb-2">
                <div class="card-body">
                    <strong>{{ $r->is_admin ? 'Admin' : ($r->user?->name ?? 'User') }}</strong>
                    <p>{{ $r->message }}</p>
                    <small>{{ $r->created_at->diffForHumans() }}</small>
                </div>
            </div>
        @endforeach
    </div>

    <form method="POST" action="{{ route('admin.help.reply', $helpTicket) }}">
        @csrf
        <div class="mb-3">
            <label>Reply</label>
            <textarea name="message" class="form-control" rows="4" required></textarea>
        </div>
        <div class="form-check mb-3">
            <input type="checkbox" name="send_mail" value="1" class="form-check-input" id="sendMail">
            <label class="form-check-label" for="sendMail">Send reply via email</label>
        </div>
        <button class="btn btn-primary">Post Reply</button>
        <a href="#" onclick="event.preventDefault();document.getElementById('resolve-form').submit();" class="btn btn-secondary ms-2">Resolve</a>
    </form>

    <form id="resolve-form" method="POST" action="{{ route('admin.help.resolve', $helpTicket) }}" style="display:none;">
        @csrf
        <input type="hidden" name="send_mail" value="1">
    </form>
</div>
@endsection
