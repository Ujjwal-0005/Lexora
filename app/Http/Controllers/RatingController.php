<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RatingController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        $rating = Rating::updateOrCreate(
            ['user_id' => $user->id],
            [
                'rating' => $request->rating,
                'comment' => $request->comment ?? null,
            ]
        );

        return response()->json(['message' => 'Rating saved', 'rating' => $rating]);
    }

    public function me(Request $request)
    {
        $rating = Rating::where('user_id', $request->user()->id)->first();

        return response()->json(['rating' => $rating]);
    }

    public function distribution()
    {
        $rows = Rating::selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = isset($rows[$i]) ? (int) $rows[$i] : 0;
        }

        return response()->json(['distribution' => $distribution]);
    }

    public function destroyMe(Request $request)
    {
        Rating::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Rating removed']);
    }

    public function summary()
    {
        $avg = Rating::avg('rating') ?: 0;
        $count = Rating::count();

        return response()->json([
            'average' => round($avg, 2),
            'count' => $count,
        ]);
    }
}
