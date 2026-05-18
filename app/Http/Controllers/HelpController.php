<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\HelpTicket;
use App\Models\HelpReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\HelpTicketCreated;

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

        return view('help.index', compact('tickets', 'faqs'));
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role === 'admin') {
            abort(403, 'Admins cannot create help tickets');
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

        // initial reply record referencing user message
        HelpReply::create([
            'help_ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'is_admin' => false,
            'message' => $request->message,
        ]);

        // notify admin via email (simple): send to app admin email
        try {
            Mail::to(config('mail.from.address'))->send(new HelpTicketCreated($ticket));
        } catch (\Exception $e) {
            // ignore mail errors for now
        }

        return redirect()->route('help.index')->with('success', 'Ticket created');
    }

    public function show(HelpTicket $helpTicket)
    {
        $user = Auth::user();
        if ($helpTicket->user_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        $helpTicket->load('replies.user');
        return view('help.show', compact('helpTicket'));
    }

    public function reply(Request $request, HelpTicket $helpTicket)
    {
        $user = Auth::user();
        if ($helpTicket->user_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($helpTicket->status === 'closed' && $user->role !== 'admin') {
            abort(422, 'This complaint has been closed and you can no longer reply.');
        }
        $request->validate(['message' => 'required|string']);

        $user = Auth::user();
        $reply = HelpReply::create([
            'help_ticket_id' => $helpTicket->id,
            'user_id' => $user->id,
            'is_admin' => false,
            'message' => $request->message,
        ]);

        return back()->with('success', 'Reply sent');
    }
}
