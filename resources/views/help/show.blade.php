@extends('layouts.app')

@section('content')
<div class="container">
    <h1>{{ $helpTicket->subject }}</h1>
    <p>Type: {{ $helpTicket->type }} | Status: {{ $helpTicket->status }}</p>

    <div class="card mb-3">
        <div class="card-body">
            <p>{{ $helpTicket->message }}</p>
        </div>
    </div>

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

    <form method="POST" action="{{ route('help.reply', $helpTicket) }}">
        @csrf
        <div class="mb-3">
            <textarea name="message" class="form-control" rows="3" required></textarea>
        </div>
        <button class="btn btn-primary">Send Reply</button>
    </form>
</div>
@endsection
