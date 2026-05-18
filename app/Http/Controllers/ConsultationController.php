<?php

namespace App\Http\Controllers;

use App\Mail\ConsultationBookedMail;
use App\Mail\ConsultationConfirmedMail;
use App\Models\Consultation;
use App\Models\ConsultationPayment;
use App\Models\LawyerProfile;
use App\Support\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ConsultationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isClient()) {
            $consultations = Consultation::with(['lawyerProfile.user', 'specialization', 'payment'])
                ->where('client_id', $user->id)
                ->orderBy('scheduled_at', 'desc')
                ->paginate(10);
        } else if ($user->isLawyer()) {
            $lawyerProfile = $user->lawyerProfile;
            $consultations = Consultation::with(['client', 'specialization', 'payment'])
                ->where('lawyer_profile_id', $lawyerProfile->id)
                ->orderBy('scheduled_at', 'desc')
                ->paginate(10);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['consultations' => $consultations]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lawyer_profile_id' => 'required|exists:lawyer_profiles,id',
            'specialization_id' => 'nullable|exists:specializations,id',
            'scheduled_at' => 'required|date|after:now',
            'duration' => 'required|in:30,60,90',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->isClient()) {
            return response()->json(['message' => 'Only clients can book consultations'], 403);
        }

        $lawyerProfile = LawyerProfile::findOrFail($request->lawyer_profile_id);

        // Check if time slot is available by ensuring no overlapping consultations
        $slotStart = \Carbon\Carbon::parse($request->scheduled_at);
        $slotEnd = $slotStart->copy()->addMinutes($request->duration);

        $existingConsultation = Consultation::where('lawyer_profile_id', $request->lawyer_profile_id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($q) use ($slotStart, $slotEnd) {
                // overlap if existing.start < slotEnd AND existing.end > slotStart
                $q->whereRaw("scheduled_at < ?", [$slotEnd])
                  ->whereRaw("DATE_ADD(scheduled_at, INTERVAL duration MINUTE) > ?", [$slotStart]);
            })
            ->first();

        if ($existingConsultation) {
            return response()->json(['message' => 'This time slot is already booked or overlaps with another session'], 422);
        }

        $fee = $lawyerProfile->consultation_fee;
        if ($request->duration == 60) {
            $fee = $fee * 1.5; // 60 min costs 1.5x the base fee
        } elseif ($request->duration == 90) {
            $fee = $fee * 2; // 90 min costs 2x the base fee
        }

        $consultation = Consultation::create([
            'client_id' => $user->id,
            'lawyer_profile_id' => $request->lawyer_profile_id,
            'specialization_id' => $request->specialization_id,
            'scheduled_at' => $request->scheduled_at,
            'duration' => $request->duration,
            'status' => 'pending',
            'fee' => $fee,
            'notes' => $request->notes,
        ]);

        if (NotificationPreference::emailEnabled($user, 'consultation')) {
            Mail::to($user->email)->send(new ConsultationBookedMail($consultation->load(['lawyerProfile.user'])));
        }

        return response()->json([
            'consultation' => $consultation->load(['lawyerProfile.user', 'specialization']),
            'message' => 'Consultation booked successfully',
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $consultation = Consultation::with([
            'client',
            'lawyerProfile.user',
            'specialization',
            'payment',
            'review'
        ])->findOrFail($id);

        // Check if user is authorized to view this consultation
        if ($user->id !== $consultation->client_id &&
            $user->id !== $consultation->lawyerProfile->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['consultation' => $consultation]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'meeting_link' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $consultation = Consultation::findOrFail($id);

        // Check authorization
        if ($user->isClient() && $user->id !== $consultation->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->isLawyer() && $user->id !== $consultation->lawyerProfile->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $previousStatus = $consultation->status;
        $consultation->status = $request->status;

        if ($request->has('meeting_link') && $user->isLawyer()) {
            $consultation->meeting_link = $request->meeting_link;
        }

        $consultation->save();

        if ($previousStatus !== 'confirmed' && $request->status === 'confirmed' && NotificationPreference::emailEnabled($consultation->client, 'consultation')) {
            Mail::to($consultation->client->email)->send(new ConsultationConfirmedMail($consultation->load(['lawyerProfile.user', 'client'])));
        }

        // Update lawyer stats if completed
        if ($request->status === 'completed') {
            $lawyerProfile = $consultation->lawyerProfile;
            $lawyerProfile->total_consultations += 1;
            $lawyerProfile->save();
        }

        return response()->json([
            'consultation' => $consultation->load(['client', 'lawyerProfile.user']),
            'message' => 'Status updated successfully',
        ]);
    }
}
