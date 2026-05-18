@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Help Center</h1>

    @if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif

    <div class="row">
        <div class="col-md-6">
            <h3>Create Ticket</h3>
            <form method="POST" action="{{ route('help.store') }}">
                @csrf
                <div class="mb-3">
                    <label>Subject</label>
                    <input name="subject" class="form-control" required />
                </div>
                <div class="mb-3">
                    <label>Type</label>
                    <select name="type" class="form-control">
                        <option value="query">Query</option>
                        <option value="complaint">Complaint</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label>Message</label>
                    <textarea name="message" class="form-control" rows="5" required></textarea>
                </div>
                <button class="btn btn-primary">Send</button>
            </form>
        </div>

        <div class="col-md-6">
            <h3>Your Tickets</h3>
            <ul class="list-group">
                @foreach($tickets as $t)
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <a href="{{ route('help.show', $t) }}">{{ $t->subject }}</a>
                        <span class="badge bg-{{ $t->status=='open'?'success':'secondary' }}">{{ $t->status }}</span>
                    </li>
                @endforeach
            </ul>

            <h4 class="mt-4">FAQs</h4>
            <div>
                @foreach($faqs as $f)
                    <div class="mb-2"><strong>{{ $f['q'] }}</strong><div>{{ $f['a'] }}</div></div>
                @endforeach
            </div>
        </div>
    </div>
</div>
@endsection
