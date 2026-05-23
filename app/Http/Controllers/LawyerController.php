<?php

namespace App\Http\Controllers;

use App\Models\LawyerProfile;
use App\Models\Specialization;
use App\Models\Region;
use Illuminate\Http\Request;

class LawyerController extends Controller
{
    public function index(Request $request)
    {
        $query = LawyerProfile::with(['user', 'specializations', 'regions'])
            ->withCount('reviews')
            ->whereHas('user', function ($q) {
                $q->where('is_verified_by_admin', true);
            });

        // Filter by specialization(s)
        $specializations = $request->input('specialization', []);
        if (is_string($specializations) && $specializations !== '') {
            $specializations = [$specializations];
        }
        if (is_array($specializations) && count(array_filter($specializations)) > 0) {
            $specializations = array_values(array_filter($specializations));
            $query->whereHas('specializations', function ($q) use ($specializations) {
                $q->whereIn('slug', $specializations);
            });
        }

        // Filter by region
        if ($request->has('region_id')) {
            $query->whereHas('regions', function ($q) use ($request) {
                $q->where('regions.id', $request->region_id);
            });
        }

        // Filter by min rating
        if ($request->has('min_rating')) {
            $query->where('average_rating', '>=', $request->min_rating);
        }

        // Filter by max fee
        if ($request->has('max_fee')) {
            $query->where('consultation_fee', '<=', $request->max_fee);
        }

        // Filter by availability
        if ($request->filled('availability')) {
            if ($request->availability === 'available') {
                $query->where('is_available', true);
            } elseif ($request->availability === 'unavailable') {
                $query->where('is_available', false);
            }
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Sort options
        $sortBy = $request->get('sort_by', 'average_rating');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = (int) $request->get('per_page', 30);
        $perPage = max(12, min($perPage, 100));

        $lawyers = $query->paginate($perPage);

        return response()->json([
            'lawyers' => $lawyers,
            'specializations' => Specialization::all(),
            'regions' => Region::all(),
        ]);
    }

    public function show($id)
    {
        $lawyer = LawyerProfile::with([
            'user',
            'specializations',
            'regions',
            'documentTypes',
            'reviews.client'
        ])->findOrFail($id);

        return response()->json(['lawyer' => $lawyer]);
    }

    public function availability($id, Request $request)
    {
        $lawyer = LawyerProfile::findOrFail($id);
        // Requested duration in minutes (used to block overlapping slots)
        $requestedDuration = (int) $request->get('duration', 30);

        // Get next 7 days
        $availability = [];
        $startDate = now();

        // Preload consultations for the 7-day window to check overlaps
        $windowStart = $startDate->copy()->startOfDay();
        $windowEnd = $startDate->copy()->addDays(6)->endOfDay();

        $consultations = $lawyer->consultations()
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereBetween('scheduled_at', [$windowStart, $windowEnd])
            ->get();

        for ($i = 0; $i < 7; $i++) {
            $date = $startDate->copy()->addDays($i);
            $dateString = $date->format('Y-m-d');
            $dayName = $date->format('l');

            // Generate time slots (9 AM to 6 PM, hourly)
            $slots = [];
            for ($hour = 9; $hour < 18; $hour++) {
                $timeSlot = sprintf('%02d:00', $hour);
                $dateTime = $dateString . ' ' . $timeSlot . ':00';
                $slotStart = \Carbon\Carbon::parse($dateTime);
                $slotEnd = $slotStart->copy()->addMinutes($requestedDuration);

                // Determine if any existing consultation overlaps this potential slot
                $isOverlapping = $consultations->contains(function ($c) use ($slotStart, $slotEnd) {
                    $cStart = $c->scheduled_at;
                    $cEnd = $cStart->copy()->addMinutes($c->duration ?? 30);

                    // overlap if consultation starts before slot end and ends after slot start
                    return $cStart->lt($slotEnd) && $cEnd->gt($slotStart);
                });

                $slots[] = [
                    'time' => $timeSlot,
                    'available' => !$isOverlapping,
                    'datetime' => $dateTime,
                ];
            }

            $availability[] = [
                'date' => $dateString,
                'day' => $dayName,
                'slots' => $slots,
            ];
        }

        return response()->json(['availability' => $availability]);
    }
}
