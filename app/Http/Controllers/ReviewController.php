<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Consultation;
use App\Models\LawyerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lawyer_profile_id' => 'required|exists:lawyer_profiles,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->isClient()) {
            return response()->json(['message' => 'Only clients can submit reviews'], 403);
        }

        // If consultation_id is provided, verify it was completed
        if ($request->has('consultation_id')) {
            $consultation = Consultation::findOrFail($request->consultation_id);
            if ($consultation->client_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            if ($consultation->status !== 'completed') {
                return response()->json(['message' => 'Can only review completed consultations'], 400);
            }
        }

        // Check if already reviewed this lawyer for this consultation
        $existingReview = Review::where('client_id', $user->id)
            ->where('lawyer_profile_id', $request->lawyer_profile_id)
            ->where('consultation_id', $request->consultation_id)
            ->first();

        if ($existingReview) {
            return response()->json(['message' => 'Review already submitted'], 400);
        }

        $review = Review::create([
            'client_id' => $user->id,
            'lawyer_profile_id' => $request->lawyer_profile_id,
            'consultation_id' => $request->consultation_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        // Update lawyer's average rating
        $lawyerProfile = LawyerProfile::findOrFail($request->lawyer_profile_id);
        $averageRating = Review::where('lawyer_profile_id', $lawyerProfile->id)->avg('rating');
        $lawyerProfile->average_rating = round($averageRating, 1);
        $lawyerProfile->save();

        return response()->json([
            'review' => $review->load('client'),
            'message' => 'Review submitted successfully',
        ], 201);
    }

    public function getLawyerReviews($lawyerId)
    {
        $lawyerProfile = LawyerProfile::findOrFail($lawyerId);

        $reviews = Review::with('client')
            ->where('lawyer_profile_id', $lawyerId)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => $lawyerProfile->average_rating,
            'total_reviews' => Review::where('lawyer_profile_id', $lawyerId)->count(),
        ]);
    }

    public function myReviews(Request $request)
    {
        $user = $request->user();

        $reviews = Review::with(['lawyerProfile.user', 'consultation'])
            ->where('client_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json(['reviews' => $reviews]);
    }
}
