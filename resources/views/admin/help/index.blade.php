@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Help Tickets</h1>
    @if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif

    <table class="table">
        <thead><tr><th>ID</th><th>Subject</th><th>User</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
        @foreach($tickets as $t)
            <tr>
                <td>{{ $t->id }}</td>
                <td>{{ $t->subject }}</td>
                <td>{{ $t->user->name ?? '-' }}</td>
                <td>{{ $t->user->email ?? '-' }}</td>
                <td>{{ $t->status }}</td>
                <td><a href="{{ route('admin.help.show', $t) }}" class="btn btn-sm btn-primary">Open</a></td>
            </tr>
        @endforeach
        </tbody>
    </table>

    {{ $tickets->links() }}
</div>
@endsection
