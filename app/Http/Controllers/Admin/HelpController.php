<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HelpTicket;
use App\Models\HelpReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminReplyToTicket;

class HelpController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:admin']);
    }

    public function index()
    {
        $tickets = HelpTicket::with('user')->latest()->paginate(20);
        return view('admin.help.index', compact('tickets'));
    }

    public function show(HelpTicket $helpTicket)
    {
        $helpTicket->load('user','replies.user');
        return view('admin.help.show', compact('helpTicket'));
    }

    public function reply(Request $request, HelpTicket $helpTicket)
    {
        $request->validate(['message' => 'required|string']);

        $reply = HelpReply::create([
            'help_ticket_id' => $helpTicket->id,
            'user_id' => auth()->id(),
            'is_admin' => true,
            'message' => $request->message,
        ]);

        // optionally send email to user
        if ($request->send_mail) {
            try {
                Mail::to($helpTicket->user->email)->send(new AdminReplyToTicket($helpTicket, $reply));
            } catch (\Exception $e) {
                // ignore
            }
        }

        return back()->with('success', 'Reply posted');
    }

    public function resolve(Request $request, HelpTicket $helpTicket)
    {
        $helpTicket->update(['status' => 'closed']);
        if ($request->send_mail) {
            try {
                Mail::to($helpTicket->user->email)->send(new \App\Mail\HelpTicketResolved($helpTicket));
            } catch (\Exception $e) {}
        }
        return back()->with('success', 'Ticket closed');
    }
}
