<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HelpTicket;
use App\Models\HelpReply;
use Illuminate\Support\Facades\Auth;

class HelpController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $tickets = HelpTicket::where('user_id', $user->id)->latest()->get();
        $faqs = [
            ['q' => 'How do I request a consultation?', 'a' => 'Go to consultations and fill request.'],
            ['q' => 'How long to get response?', 'a' => 'Admins usually reply within 24-48 hours.']
        ];
        return response()->json(['tickets' => $tickets, 'faqs' => $faqs]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admins cannot create help tickets'], 403);
        }
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'nullable|in:complaint,query',
        ]);

        $ticket = HelpTicket::create([
            'user_id' => $user->id,
            'subject' => $request->subject,
            'message' => $request->message,
            'type' => $request->type ?? 'query',
        ]);

        HelpReply::create([
            'help_ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'is_admin' => false,
            'message' => $request->message,
        ]);

        return response()->json(['ticket' => $ticket], 201);
    }

    public function show(HelpTicket $helpTicket)
    {
        $user = Auth::user();
        if ($helpTicket->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $helpTicket->load('replies.user');
        return response()->json(['ticket' => $helpTicket]);
    }

    public function reply(Request $request, HelpTicket $helpTicket)
    {
        $user = Auth::user();
        if ($helpTicket->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if ($helpTicket->status === 'closed' && $user->role !== 'admin') {
            return response()->json(['message' => 'This complaint has been closed and you can no longer reply.'], 422);
        }
        $request->validate(['message' => 'required|string']);
        $reply = HelpReply::create([
            'help_ticket_id' => $helpTicket->id,
            'user_id' => $user->id,
            'is_admin' => $user->role === 'admin',
            'message' => $request->message,
        ]);
        return response()->json(['reply' => $reply]);
    }
}
