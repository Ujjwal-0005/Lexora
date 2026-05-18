<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultation_id' => 'required|exists:consultations,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $consultation = Consultation::findOrFail($request->consultation_id);

        // Verify user is part of this consultation
        if ($user->id !== $consultation->client_id &&
            $user->id !== $consultation->lawyerProfile->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = Message::with(['sender', 'receiver'])
            ->where('consultation_id', $request->consultation_id)
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark messages as read
        Message::where('consultation_id', $request->consultation_id)
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['messages' => $messages]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultation_id' => 'required|exists:consultations,id',
            'message' => 'required|string',
            'type' => 'in:text,link,file',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $consultation = Consultation::findOrFail($request->consultation_id);

        // Verify user is part of this consultation
        if ($user->id !== $consultation->client_id &&
            $user->id !== $consultation->lawyerProfile->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Determine receiver
        $receiverId = ($user->id === $consultation->client_id)
            ? $consultation->lawyerProfile->user_id
            : $consultation->client_id;

        $message = Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'consultation_id' => $request->consultation_id,
            'message' => $request->message,
            'type' => $request->type ?? 'text',
        ]);

        return response()->json([
            'message' => $message->load(['sender', 'receiver']),
            'message_text' => 'Message sent successfully',
        ], 201);
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $message = Message::findOrFail($id);

        // Verify user is the receiver
        if ($message->receiver_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->read_at = now();
        $message->save();

        return response()->json([
            'message' => $message,
            'message_text' => 'Message marked as read',
        ]);
    }

    public function getUnreadCount(Request $request)
    {
        $user = $request->user();

        $count = Message::where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    public function getUnreadMessages(Request $request)
    {
        $user = $request->user();

        $messages = Message::with([
            'sender',
            'consultation.lawyerProfile.user',
            'consultation.client',
        ])
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->latest('created_at')
            ->limit(20)
            ->get();

        return response()->json(['messages' => $messages]);
    }

    public function getConversations(Request $request)
    {
        $user = $request->user();

        // Get all consultations where user is involved
        if ($user->isClient()) {
            $consultations = Consultation::where('client_id', $user->id)
                ->with(['lawyerProfile.user'])
                ->get();
        } else if ($user->isLawyer()) {
            $lawyerProfile = $user->lawyerProfile;
            $consultations = Consultation::where('lawyer_profile_id', $lawyerProfile->id)
                ->with(['client'])
                ->get();
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversations = [];
        foreach ($consultations as $consultation) {
            $unreadCount = Message::where('consultation_id', $consultation->id)
                ->where('receiver_id', $user->id)
                ->whereNull('read_at')
                ->count();

            $lastMessage = Message::where('consultation_id', $consultation->id)
                ->latest('created_at')
                ->first();

            $conversations[] = [
                'consultation_id' => $consultation->id,
                'other_party' => $user->isClient() ? $consultation->lawyerProfile->user : $consultation->client,
                'unread_count' => $unreadCount,
                'last_message' => $lastMessage,
                'status' => $consultation->status,
            ];
        }

        // Sort by last message time
        usort($conversations, function ($a, $b) {
            $timeA = $a['last_message'] ? $a['last_message']->created_at : 0;
            $timeB = $b['last_message'] ? $b['last_message']->created_at : 0;
            return $timeB <=> $timeA;
        });

        return response()->json(['conversations' => $conversations]);
    }
}
