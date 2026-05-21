<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LawyerController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Public routes
// Dev-only: create a test user and return an auth token (local debugging)
if (app()->environment('local')) {
    Route::get('/dev/create-test-user', function () {
        $email = 'dev@local.test';
        $user = \App\Models\User::where('email', $email)->first();
        if (! $user) {
            $user = \App\Models\User::create([
                'name' => 'Dev User',
                'email' => $email,
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'client',
            ]);
        }

        $token = $user->createToken('dev-token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    });

    Route::get('/dev/create-test-lawyer', function () {
        $email = 'dev-lawyer@local.test';
        $user = \App\Models\User::where('email', $email)->first();
        if (! $user) {
            $user = \App\Models\User::create([
                'name' => 'Dev Lawyer',
                'email' => $email,
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'lawyer',
                'is_verified_by_admin' => true,
            ]);
        }

        // ensure lawyer profile exists
        $profile = \App\Models\LawyerProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'license_number' => 'DEV-LAW-001',
                'bar_council_id' => 'DEVBC',
                'years_of_experience' => 3,
                'bio' => 'Dev lawyer for testing',
                'consultation_fee' => 1000,
                'is_available' => true,
            ]
        );

        $token = $user->createToken('dev-lawyer-token')->plainTextToken;

        return response()->json(['user' => $user->load('lawyerProfile'), 'token' => $token, 'lawyer_profile' => $profile]);
    });
}
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback'])->name('auth.google.callback');
Route::get('/auth/google/lawyer-profile', [AuthController::class, 'googleLawyerProfile']);
Route::post('/auth/google/lawyer/register', [AuthController::class, 'registerGoogleLawyer']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/verify-reset-otp', [AuthController::class, 'verifyResetOtp']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Public lawyer routes
Route::get('/lawyers', [LawyerController::class, 'index']);
Route::get('/lawyers/{id}', [LawyerController::class, 'show']);
Route::get('/lawyers/{id}/availability', [LawyerController::class, 'availability']);
Route::get('/lawyers/{id}/reviews', [ReviewController::class, 'getLawyerReviews']);

// Public document types route
Route::get('/document-types', [DocumentController::class, 'listTypes']);
Route::get('/document-types/{id}', [DocumentController::class, 'getType']);
Route::get('/document-types/{id}/lawyers', [DocumentController::class, 'lawyersForType']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/change-password-otp', [AuthController::class, 'changePasswordWithOtp']);
    Route::post('/auth/set-password', [AuthController::class, 'setPassword']);
    Route::delete('/auth/delete', [AuthController::class, 'deleteAccount']);
    Route::put('/auth/lawyer-profile', [AuthController::class, 'updateLawyerProfile']);

    // Consultations
    Route::get('/consultations', [ConsultationController::class, 'index']);
    Route::post('/consultations', [ConsultationController::class, 'store']);
    Route::get('/consultations/{id}', [ConsultationController::class, 'show']);
    Route::put('/consultations/{id}/status', [ConsultationController::class, 'updateStatus']);

    // Documents
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::get('/client/documents', [DocumentController::class, 'index']);
    Route::get('/lawyer/documents', [DocumentController::class, 'lawyerDocuments']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::get('/documents/{id}', [DocumentController::class, 'show']);
    Route::put('/documents/{id}/client-response', [DocumentController::class, 'submitClientResponse']);
    Route::post('/documents/{id}/generate', [DocumentController::class, 'generate']);
    Route::get('/documents/{id}/download', [DocumentController::class, 'download']);
    Route::put('/documents/{id}/status', [DocumentController::class, 'updateStatus']);
    // Lawyer-specific status update (allows file upload when completing)
    Route::put('/lawyer/documents/{id}/status', [DocumentController::class, 'lawyerUpdateStatus']);

    // Payments
    Route::post('/payments/consultation', [PaymentController::class, 'processConsultationPayment']);
    Route::post('/payments/document', [PaymentController::class, 'processDocumentPayment']);
    Route::get('/payments/{type}/{id}', [PaymentController::class, 'getPaymentStatus']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/my-reviews', [ReviewController::class, 'myReviews']);

    // Ratings (site-wide)
    Route::post('/ratings', [\App\Http\Controllers\RatingController::class, 'store']);
    Route::get('/ratings/summary', [\App\Http\Controllers\RatingController::class, 'summary']);
    Route::get('/ratings/me', [\App\Http\Controllers\RatingController::class, 'me']);
    Route::get('/ratings/distribution', [\App\Http\Controllers\RatingController::class, 'distribution']);
    Route::delete('/ratings/me', [\App\Http\Controllers\RatingController::class, 'destroyMe']);

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/conversations', [MessageController::class, 'getConversations']);
    Route::get('/messages/unread', [MessageController::class, 'getUnreadMessages']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markAsRead']);
    Route::get('/messages/unread-count', [MessageController::class, 'getUnreadCount']);

    // Help center API
    Route::get('/help', [\App\Http\Controllers\Api\HelpController::class, 'index']);
    Route::post('/help', [\App\Http\Controllers\Api\HelpController::class, 'store']);
    Route::get('/help/{helpTicket}', [\App\Http\Controllers\Api\HelpController::class, 'show']);
    Route::post('/help/{helpTicket}/reply', [\App\Http\Controllers\Api\HelpController::class, 'reply']);

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/pending-verifications', [AdminController::class, 'pendingVerifications']);
        Route::post('/verify/{user}', [AdminController::class, 'verifyLawyer']);
        Route::post('/reject/{user}', [AdminController::class, 'rejectLawyer']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/users/{id}', [AdminController::class, 'getUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/logs', [AdminController::class, 'logs']);
        Route::get('/consultations', [AdminController::class, 'consultations']);
        Route::get('/documents', [AdminController::class, 'documents']);
        // Admin help management
        Route::get('/help', [\App\Http\Controllers\Api\Admin\HelpController::class, 'index']);
        Route::get('/help/{helpTicket}', [\App\Http\Controllers\Api\Admin\HelpController::class, 'show']);
        Route::post('/help/{helpTicket}/reply', [\App\Http\Controllers\Api\Admin\HelpController::class, 'reply']);
        Route::post('/help/{helpTicket}/resolve', [\App\Http\Controllers\Api\Admin\HelpController::class, 'resolve']);
    });
});
