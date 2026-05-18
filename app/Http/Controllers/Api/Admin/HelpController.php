<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HelpTicket;
use App\Models\HelpReply;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminReplyToTicket;

class HelpController extends Controller
{
    public function index()
    {
        $tickets = HelpTicket::with('user')->latest()->paginate(20);
        return response()->json($tickets);
    }

    public function show(HelpTicket $helpTicket)
    {
        $helpTicket->load('user','replies.user');
        return response()->json($helpTicket);
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

        if ($request->send_mail) {
            try {
                Mail::to($helpTicket->user->email)->send(new AdminReplyToTicket($helpTicket, $reply));
            } catch (\Exception $e) {}
        }

        return response()->json(['reply' => $reply]);
    }

    public function resolve(Request $request, HelpTicket $helpTicket)
    {
        $helpTicket->update(['status' => 'closed']);
        if ($request->send_mail) {
            try {
                Mail::to($helpTicket->user->email)->send(new \App\Mail\HelpTicketResolved($helpTicket));
            } catch (\Exception $e) {}
        }
        return response()->json(['status' => 'closed']);
    }
}
