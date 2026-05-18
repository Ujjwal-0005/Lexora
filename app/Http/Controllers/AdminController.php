<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Rating;
use App\Models\LawyerProfile;
use App\Models\Consultation;
use App\Models\DocumentRequest;
use App\Models\Review;
use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $stats = [
            'total_users' => User::count(),
            'total_clients' => User::where('role', 'client')->count(),
            'total_lawyers' => User::where('role', 'lawyer')->count(),
            'total_verified_lawyers' => User::where('role', 'lawyer')
                ->where('is_verified_by_admin', true)
                ->count(),
            'pending_verifications' => User::where('role', 'lawyer')
                ->where('is_verified_by_admin', false)
                ->count(),
            'total_consultations' => Consultation::count(),
            'completed_consultations' => Consultation::where('status', 'completed')->count(),
            'total_documents' => DocumentRequest::count(),
            'total_reviews' => Review::count(),
            'average_rating' => Review::avg('rating') ?? 0,
            'site_average_rating' => Rating::avg('rating') ?? 0,
            'site_ratings_count' => Rating::count(),
        ];

        $recentActivity = AdminLog::with(['admin', 'targetUser'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_activity' => $recentActivity,
        ]);
    }

    public function pendingVerifications(Request $request)
    {
        $query = User::with([
            'lawyerProfile.specializations',
            'lawyerProfile.regions',
            'lawyerProfile.documentTypes',
        ])
            ->where('role', 'lawyer')
            ->where('is_verified_by_admin', false);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhereHas('lawyerProfile', function ($profileQuery) use ($search) {
                        $profileQuery->where('license_number', 'like', "%{$search}%");
                    });
            });
        }

        $lawyers = $query
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json(['lawyers' => $lawyers]);
    }

    public function verifyLawyer(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'designation' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($userId);

        if ($user->role !== 'lawyer') {
            return response()->json(['message' => 'User is not a lawyer'], 400);
        }

        if ($user->is_verified_by_admin) {
            return response()->json(['message' => 'Lawyer is already verified'], 400);
        }

        if ($request->filled('designation')) {
            LawyerProfile::updateOrCreate(
                ['user_id' => $user->id],
                ['designation' => $request->designation]
            );
        }

        $user->is_verified_by_admin = true;
        $user->save();

        // Log the action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'verify_lawyer',
            'target_user_id' => $user->id,
            'notes' => 'Lawyer verified: ' . $user->name . ($request->filled('designation') ? ' | Designation: ' . $request->designation : ''),
        ]);

        return response()->json([
            'message' => 'Lawyer verified successfully',
            'user' => $user->load([
                'lawyerProfile.specializations',
                'lawyerProfile.regions',
                'lawyerProfile.documentTypes',
            ]),
        ]);
    }

    public function rejectLawyer(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($userId);

        if ($user->role !== 'lawyer') {
            return response()->json(['message' => 'User is not a lawyer'], 400);
        }

        // Log the action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'reject_lawyer',
            'target_user_id' => $user->id,
            'notes' => 'Lawyer rejected: ' . $request->reason,
        ]);

        // Optionally delete the lawyer profile or mark as rejected
        // For now, we just log it

        return response()->json([
            'message' => 'Lawyer application rejected',
        ]);
    }

    public function users(Request $request)
    {
        $query = User::with('lawyerProfile')->orderBy('created_at', 'desc');

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate(20);

        return response()->json(['users' => $users]);
    }

    public function getUser(Request $request, $id)
    {
        $user = User::with([
            'lawyerProfile.specializations',
            'lawyerProfile.regions',
            'lawyerProfile.reviews',
            'clientConsultations',
            'documentRequests',
        ])->findOrFail($id);

        return response()->json(['user' => $user]);
    }

    public function updateUser(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_verified_by_admin' => 'nullable|boolean',
            'role' => 'nullable|in:client,lawyer,admin',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }
        if ($request->has('is_verified_by_admin')) {
            $user->is_verified_by_admin = $request->is_verified_by_admin;
        }
        if ($request->has('role')) {
            $user->role = $request->role;
        }

        $user->save();

        // Log the action
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'update_user',
            'target_user_id' => $user->id,
            'notes' => 'User profile updated',
        ]);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load('lawyerProfile'),
        ]);
    }

    public function deleteUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting self
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 400);
        }

        // Log the action before deletion
        AdminLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'delete_user',
            'target_user_id' => $user->id,
            'notes' => 'User deleted: ' . $user->name . ' (' . $user->email . ')',
        ]);

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function logs(Request $request)
    {
        $logs = AdminLog::with(['admin', 'targetUser'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json(['logs' => $logs]);
    }

    public function consultations(Request $request)
    {
        $consultations = Consultation::with(['client', 'lawyerProfile.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['consultations' => $consultations]);
    }

    public function documents(Request $request)
    {
        $documents = DocumentRequest::with(['client', 'lawyerProfile.user', 'documentType'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['documents' => $documents]);
    }
}
