<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\DocumentType;
use App\Models\LawyerProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $educationalQualifications = $this->sanitizeEducationalQualifications(
            $this->decodeJsonArray($request->input('educational_qualifications'))
        );
        $admissionsAwards = $this->sanitizeSimpleList($this->decodeJsonArray($request->input('admissions_awards')));
        $cities = $this->sanitizeSimpleList($this->decodeJsonArray($request->input('cities')));
        $coreCompetencies = $this->sanitizeSimpleList($this->decodeJsonArray($request->input('core_competencies')));
        $documentExpertise = $this->sanitizeDocumentExpertise(
            $this->decodeJsonArray($request->input('document_expertise'))
        );

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/'
            ],
            'phone' => 'nullable|string|regex:/^\d{10}$/',
            'role' => 'required|in:client,lawyer',
            'license_number' => 'nullable|required_if:role,lawyer|string|unique:lawyer_profiles',
            'bar_council_id' => 'nullable|required_if:role,lawyer|string',
            'years_of_experience' => 'nullable|required_if:role,lawyer|integer|min:0',
            'bio' => 'nullable|required_if:role,lawyer|string',
            'consultation_fee' => 'nullable|required_if:role,lawyer|numeric|min:0',
            'consultation_fee_60' => 'nullable|required_if:role,lawyer|numeric|min:0',
            'consultation_fee_90' => 'nullable|required_if:role,lawyer|numeric|min:0',
            'educational_qualifications' => 'nullable|required_if:role,lawyer',
            'admissions_awards' => 'nullable|required_if:role,lawyer',
            'cities' => 'nullable|required_if:role,lawyer',
            'core_competencies' => 'nullable|required_if:role,lawyer',
            'document_expertise' => 'nullable|required_if:role,lawyer',
            'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'profile_photo_path' => 'nullable|string',
        ], [
            'phone.regex' => 'Phone number must be exactly 10 digits.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profilePhotoPath = $request->input('profile_photo_path');
        if ($request->hasFile('profile_photo')) {
            $profilePhotoPath = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        if ($request->role === 'lawyer') {
            if (empty($educationalQualifications)) {
                return response()->json(['errors' => ['educational_qualifications' => ['Add at least one educational qualification.']]], 422);
            }

            if (empty($admissionsAwards)) {
                return response()->json(['errors' => ['admissions_awards' => ['Add at least one admission or award entry.']]], 422);
            }

            if (empty($cities)) {
                return response()->json(['errors' => ['cities' => ['Add at least one city.']]], 422);
            }

            if (empty($coreCompetencies)) {
                return response()->json(['errors' => ['core_competencies' => ['Add at least one core competency.']]], 422);
            }

            if (empty($documentExpertise)) {
                return response()->json(['errors' => ['document_expertise' => ['Add at least one document expertise entry with fee.']]], 422);
            }

            if (empty($profilePhotoPath)) {
                return response()->json(['errors' => ['profile_photo' => ['Profile photo is required for lawyer registration.']]], 422);
            }
        }

        // Generate OTP and store verification payload instead of creating user immediately
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Prepare payload and hash the password for safe storage
        $payload = [
            'purpose' => 'register',
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => $request->role,
            'license_number' => $request->license_number,
            'bar_council_id' => $request->bar_council_id,
            'years_of_experience' => $request->years_of_experience ?? null,
            'bio' => $request->bio ?? null,
            'consultation_fee' => $request->consultation_fee ?? null,
            'consultation_fee_60' => $request->consultation_fee_60 ?? null,
            'consultation_fee_90' => $request->consultation_fee_90 ?? null,
            'educational_qualifications' => $educationalQualifications,
            'admissions_awards' => $admissionsAwards,
            'cities' => $cities,
            'core_competencies' => $coreCompetencies,
            'document_expertise' => $documentExpertise,
            'profile_photo' => $profilePhotoPath,
        ];

        // Remove any existing verification for this email
        DB::table('email_verifications')->where('email', $request->email)->delete();

        DB::table('email_verifications')->insert([
            'email' => $request->email,
            'otp' => $otp,
            'payload' => json_encode($payload),
            'expires_at' => Carbon::now()->addMinutes(10),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // Send OTP email
        try {
            Log::info('Attempting to send OTP email to: ' . $request->email);
            Mail::to($request->email)->send(new OtpMail($otp));
            Log::info('OTP email sent successfully to: ' . $request->email);
        } catch (\Exception $e) {
            Log::error('Failed sending OTP email to ' . $request->email . ': ' . $e->getMessage());
            Log::error('Exception trace: ' . $e->getTraceAsString());
            // Return error response so frontend knows what happened
            return response()->json([
                'message' => 'Registration saved but email delivery failed. Please try again or contact support.',
                'error' => 'email_send_failed'
            ], 500);
        }

        return response()->json([
            'message' => 'OTP sent to email. Please verify within 10 minutes.',
            'profile_photo_path' => $profilePhotoPath,
        ], 200);
    }

    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = DB::table('email_verifications')
            ->where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid OTP or email'], 422);
        }

        if (Carbon::now()->greaterThan(Carbon::parse($record->expires_at))) {
            return response()->json(['message' => 'OTP expired'], 422);
        }

        $payload = json_decode($record->payload, true);

        if (($payload['purpose'] ?? 'register') !== 'register') {
            return response()->json(['message' => 'Invalid OTP purpose'], 422);
        }

        // Create the user
        $user = User::create([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'password' => $payload['password'],
            'phone' => $payload['phone'] ?? null,
            'role' => $payload['role'],
            'profile_photo' => $payload['profile_photo'] ?? null,
            'is_verified_by_admin' => $payload['role'] === 'client',
        ]);

        if ($payload['role'] === 'lawyer') {
            $lawyerProfile = LawyerProfile::create([
                'user_id' => $user->id,
                'license_number' => $payload['license_number'],
                'bar_council_id' => $payload['bar_council_id'],
                'years_of_experience' => $payload['years_of_experience'] ?? 0,
                'bio' => $payload['bio'] ?? null,
                'consultation_fee' => $payload['consultation_fee'] ?? 1000,
                'consultation_fee_60' => $payload['consultation_fee_60'] ?? ($payload['consultation_fee'] ?? 1000),
                'consultation_fee_90' => $payload['consultation_fee_90'] ?? ($payload['consultation_fee'] ?? 1000),
                'educational_qualifications' => $payload['educational_qualifications'] ?? [],
                'admissions_awards' => $payload['admissions_awards'] ?? [],
                'cities' => $payload['cities'] ?? [],
                'core_competencies' => $payload['core_competencies'] ?? [],
                'document_expertise' => $payload['document_expertise'] ?? [],
                'is_available' => true,
            ]);

            $this->syncLawyerDocumentExpertise($lawyerProfile, $payload['document_expertise'] ?? []);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Delete OTP record
        DB::table('email_verifications')->where('email', $request->email)->delete();

        return response()->json([
            'user' => $user->load('lawyerProfile'),
            'token' => $token,
            'message' => 'Verification successful',
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        // Check if lawyer is verified
        if ($user->role === 'lawyer' && !$user->is_verified_by_admin) {
            return response()->json([
                'message' => 'Your account is pending admin verification.',
                'pending_verification' => true,
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('lawyerProfile'),
            'token' => $token,
            'message' => 'Login successful',
        ]);
    }

    public function googleRedirect(Request $request)
    {
        if (empty(config('services.google.client_id')) || empty(config('services.google.client_secret'))) {
            return response()->json([
                'message' => 'Google authentication is not configured on the server.',
            ], 500);
        }

        $intent = $request->query('intent', 'login');
        if (!in_array($intent, ['login', 'register'], true)) {
            $intent = 'login';
        }

        $role = $request->query('role', 'client');
        if (!in_array($role, ['client', 'lawyer'], true)) {
            $role = 'client';
        }

        $state = base64_encode(json_encode([
            'intent' => $intent,
            'role' => $role,
            'ts' => now()->timestamp,
        ]));

        $url = Socialite::driver('google')
            ->stateless()
            ->with(['state' => $state])
            ->redirect()
            ->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    public function googleCallback()
    {
        $frontendUrl = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $intent = 'login';
        $role = 'client';

        $state = request()->query('state');
        if (is_string($state) && $state !== '') {
            $decoded = json_decode(base64_decode($state, true) ?: '', true);
            if (is_array($decoded)) {
                $intent = in_array(($decoded['intent'] ?? ''), ['login', 'register'], true)
                    ? $decoded['intent']
                    : 'login';
                $role = in_array(($decoded['role'] ?? ''), ['client', 'lawyer'], true)
                    ? $decoded['role']
                    : 'client';
            }
        }

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable $e) {
            Log::error('Google OAuth callback failed: ' . $e->getMessage());

            return redirect()->away($frontendUrl . '/auth/google/callback?error=oauth_failed');
        }

        if (empty($googleUser->getEmail())) {
            return redirect()->away($frontendUrl . '/auth/google/callback?error=email_missing');
        }

        $email = mb_strtolower(trim((string) $googleUser->getEmail()));
        $user = User::where('email', $email)->first();

        if ($intent === 'register' && $role === 'lawyer') {
            if ($user) {
                return redirect()->away($frontendUrl . '/auth/google/callback?error=account_exists');
            }

            $registrationToken = (string) Str::uuid();
            Cache::put('google_lawyer_registration:' . $registrationToken, [
                'name' => $googleUser->getName() ?: 'Google User',
                'email' => $email,
                'google_id' => (string) $googleUser->getId(),
                'google_avatar' => $googleUser->getAvatar(),
            ], now()->addMinutes(15));

            return redirect()->away($frontendUrl . '/auth/google/callback?lawyer_registration_token=' . urlencode($registrationToken));
        }

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->getName() ?: 'Google User',
                'email' => $email,
                'password' => Hash::make(Str::random(40)),
                'role' => 'client',
                'is_verified_by_admin' => true,
                'google_id' => (string) $googleUser->getId(),
                'google_avatar' => $googleUser->getAvatar(),
                'auth_provider' => 'google',
                'email_verified_at' => now(),
            ]);
        } else {
            if ($user->role === 'lawyer' && !$user->is_verified_by_admin) {
                return redirect()->away($frontendUrl . '/auth/google/callback?error=lawyer_pending_verification');
            }

            $updates = [
                'google_id' => (string) $googleUser->getId(),
                'google_avatar' => $googleUser->getAvatar(),
            ];

            if (empty($user->auth_provider)) {
                $updates['auth_provider'] = 'google';
            }

            if (empty($user->email_verified_at)) {
                $updates['email_verified_at'] = now();
            }

            $user->update($updates);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return redirect()->away($frontendUrl . '/auth/google/callback?token=' . urlencode($token));
    }

    public function googleLawyerProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payload = Cache::get('google_lawyer_registration:' . $request->token);
        if (!$payload) {
            return response()->json(['message' => 'Google registration token expired or invalid.'], 422);
        }

        return response()->json([
            'name' => $payload['name'] ?? null,
            'email' => $payload['email'] ?? null,
            'google_avatar' => $payload['google_avatar'] ?? null,
        ]);
    }

    public function registerGoogleLawyer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'google_registration_token' => 'required|string',
            'phone' => 'nullable|string|regex:/^\d{10}$/',
            'license_number' => 'required|string|unique:lawyer_profiles',
            'bar_council_id' => 'required|string',
            'years_of_experience' => 'required|integer|min:0',
            'bio' => 'required|string',
            'consultation_fee' => 'required|numeric|min:0',
            'consultation_fee_60' => 'required|numeric|min:0',
            'consultation_fee_90' => 'required|numeric|min:0',
            'educational_qualifications' => 'required',
            'admissions_awards' => 'required',
            'cities' => 'required',
            'core_competencies' => 'required',
            'document_expertise' => 'required',
            'profile_photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096',
        ], [
            'phone.regex' => 'Phone number must be exactly 10 digits.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cacheKey = 'google_lawyer_registration:' . $request->google_registration_token;
        $googlePayload = Cache::get($cacheKey);

        if (!$googlePayload) {
            return response()->json(['message' => 'Google registration session expired. Please start again.'], 422);
        }

        $email = mb_strtolower(trim((string) ($googlePayload['email'] ?? '')));
        if ($email === '') {
            return response()->json(['message' => 'Google profile is missing a valid email.'], 422);
        }

        if (User::where('email', $email)->exists()) {
            return response()->json(['message' => 'An account already exists with this email. Please sign in.'], 409);
        }

        $educationalQualifications = $this->sanitizeEducationalQualifications(
            $this->decodeJsonArray($request->input('educational_qualifications'))
        );
        $admissionsAwards = $this->sanitizeSimpleList($this->decodeJsonArray($request->input('admissions_awards')));
        $cities = $this->sanitizeSimpleList($this->decodeJsonArray($request->input('cities')));
        $coreCompetencies = $this->sanitizeSimpleList($this->decodeJsonArray($request->input('core_competencies')));
        $documentExpertise = $this->sanitizeDocumentExpertise(
            $this->decodeJsonArray($request->input('document_expertise'))
        );

        if (empty($educationalQualifications)) {
            return response()->json(['errors' => ['educational_qualifications' => ['Add at least one educational qualification.']]], 422);
        }

        if (empty($admissionsAwards)) {
            return response()->json(['errors' => ['admissions_awards' => ['Add at least one admission or award entry.']]], 422);
        }

        if (empty($cities)) {
            return response()->json(['errors' => ['cities' => ['Add at least one city.']]], 422);
        }

        if (empty($coreCompetencies)) {
            return response()->json(['errors' => ['core_competencies' => ['Add at least one core competency.']]], 422);
        }

        if (empty($documentExpertise)) {
            return response()->json(['errors' => ['document_expertise' => ['Add at least one document expertise entry with fee.']]], 422);
        }

        $profilePhotoPath = $request->file('profile_photo')->store('profile-photos', 'public');

        $user = User::create([
            'name' => (string) ($googlePayload['name'] ?? 'Google User'),
            'email' => $email,
            'password' => Hash::make(Str::random(40)),
            'phone' => $request->input('phone') ?: null,
            'role' => 'lawyer',
            'profile_photo' => $profilePhotoPath,
            'is_verified_by_admin' => false,
            'google_id' => (string) ($googlePayload['google_id'] ?? ''),
            'google_avatar' => $googlePayload['google_avatar'] ?? null,
            'auth_provider' => 'google',
            'email_verified_at' => now(),
        ]);

        $lawyerProfile = LawyerProfile::create([
            'user_id' => $user->id,
            'license_number' => $request->license_number,
            'bar_council_id' => $request->bar_council_id,
            'years_of_experience' => $request->years_of_experience,
            'bio' => $request->bio,
            'consultation_fee' => $request->consultation_fee,
            'consultation_fee_60' => $request->consultation_fee_60,
            'consultation_fee_90' => $request->consultation_fee_90,
            'educational_qualifications' => $educationalQualifications,
            'admissions_awards' => $admissionsAwards,
            'cities' => $cities,
            'core_competencies' => $coreCompetencies,
            'document_expertise' => $documentExpertise,
            'is_available' => true,
        ]);

        $this->syncLawyerDocumentExpertise($lawyerProfile, $documentExpertise);
        Cache::forget($cacheKey);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('lawyerProfile'),
            'token' => $token,
            'message' => 'Lawyer account registered successfully. Pending admin verification.',
        ], 201);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => 'Email does not exist'], 404);
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('email_verifications')->where('email', $request->email)->delete();
        DB::table('email_verifications')->insert([
            'email' => $request->email,
            'otp' => $otp,
            'payload' => json_encode(['purpose' => 'reset']),
            'expires_at' => Carbon::now()->addMinutes(10),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        try {
            Mail::to($request->email)->send(new OtpMail($otp));
        } catch (\Exception $e) {
            Log::error('Failed sending reset OTP email to ' . $request->email . ': ' . $e->getMessage());

            return response()->json([
                'message' => 'Unable to send reset OTP. Please try again.',
                'error' => 'email_send_failed',
            ], 500);
        }

        return response()->json(['message' => 'Reset OTP sent to your email.']);
    }

    public function verifyResetOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = DB::table('email_verifications')
            ->where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Invalid OTP or email'], 422);
        }

        if (Carbon::now()->greaterThan(Carbon::parse($record->expires_at))) {
            return response()->json(['message' => 'OTP expired'], 422);
        }

        $payload = json_decode($record->payload, true);
        if (($payload['purpose'] ?? null) !== 'reset') {
            return response()->json(['message' => 'Invalid OTP purpose'], 422);
        }

        return response()->json(['message' => 'OTP verified successfully']);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'new_password' => [
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/',
            ],
            'password_confirmation' => 'required|string|same:new_password',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $record = DB::table('email_verifications')
            ->where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Invalid OTP or email'], 422);
        }

        if (Carbon::now()->greaterThan(Carbon::parse($record->expires_at))) {
            return response()->json(['message' => 'OTP expired'], 422);
        }

        $payload = json_decode($record->payload, true);
        if (($payload['purpose'] ?? null) !== 'reset') {
            return response()->json(['message' => 'Invalid OTP purpose'], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        DB::table('email_verifications')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successful']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('lawyerProfile.specializations', 'lawyerProfile.regions'),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|regex:/^\d{10}$/',
            'notification_preferences' => 'sometimes|array',
            'notification_preferences.email' => 'sometimes|boolean',
            'notification_preferences.sms' => 'sometimes|boolean',
            'notification_preferences.consultation_reminders' => 'sometimes|boolean',
            'notification_preferences.document_updates' => 'sometimes|boolean',
        ], [
            'phone.regex' => 'Please enter a valid 10-digit phone number.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        
        if ($request->filled('phone')) {
            $user->phone = trim($request->phone);
        }

        if ($request->has('notification_preferences')) {
            $preferences = array_merge($user->notificationPreferences(), $request->input('notification_preferences', []));

            if (!($preferences['email'] ?? false)) {
                $preferences['sms'] = false;
                $preferences['consultation_reminders'] = false;
                $preferences['document_updates'] = false;
            }

            $user->notification_preferences = $preferences;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('lawyerProfile'),
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/',
            ],
            'new_password_confirmation' => 'required|string|same:new_password',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 401);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function updateLawyerProfile(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'lawyer') {
            return response()->json(['message' => 'Only lawyers can access this endpoint'], 403);
        }

        $educationalQualifications = $this->sanitizeEducationalQualifications(
            $this->decodeJsonArray($request->input('educational_qualifications'))
        );
        $admissionsAwards = $this->sanitizeSimpleList($this->decodeJsonArray($request->input('admissions_awards')));
        $cities = $this->sanitizeSimpleList($this->decodeJsonArray($request->input('cities')));
        $coreCompetencies = $this->sanitizeSimpleList($this->decodeJsonArray($request->input('core_competencies')));
        $documentExpertise = $this->sanitizeDocumentExpertise(
            $this->decodeJsonArray($request->input('document_expertise'))
        );

        $validator = Validator::make($request->all(), [
            'years_of_experience' => 'sometimes|integer|min:0',
            'consultation_fee' => 'sometimes|numeric|min:0',
            'consultation_fee_60' => 'sometimes|numeric|min:0',
            'consultation_fee_90' => 'sometimes|numeric|min:0',
            'bio' => 'sometimes|string',
            'is_available' => 'sometimes|boolean',
            'profile_photo' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profile = $user->lawyerProfile;
        
        if ($request->has('years_of_experience')) {
            $profile->years_of_experience = $request->years_of_experience;
        }
        
        if ($request->has('consultation_fee')) {
            $profile->consultation_fee = $request->consultation_fee;
        }

        if ($request->has('consultation_fee_60')) {
            $profile->consultation_fee_60 = $request->consultation_fee_60;
        }

        if ($request->has('consultation_fee_90')) {
            $profile->consultation_fee_90 = $request->consultation_fee_90;
        }
        
        if ($request->has('bio')) {
            $profile->bio = $request->bio;
        }
        
        if ($request->has('is_available')) {
            $profile->is_available = $request->is_available;
        }

        if ($request->has('educational_qualifications')) {
            $profile->educational_qualifications = $educationalQualifications;
        }

        if ($request->has('admissions_awards')) {
            $profile->admissions_awards = $admissionsAwards;
        }

        if ($request->has('cities')) {
            $profile->cities = $cities;
        }

        if ($request->has('core_competencies')) {
            $profile->core_competencies = $coreCompetencies;
        }

        if ($request->has('document_expertise')) {
            $profile->document_expertise = $documentExpertise;
            $this->syncLawyerDocumentExpertise($profile, $documentExpertise);
        }

        if ($request->hasFile('profile_photo')) {
            $user->profile_photo = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        $profile->save();
        $user->save();

        return response()->json([
            'message' => 'Lawyer profile updated successfully',
            'user' => $user->load('lawyerProfile.specializations', 'lawyerProfile.regions', 'lawyerProfile.documentTypes'),
        ]);
    }

    private function decodeJsonArray($value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (!is_string($value) || trim($value) === '') {
            return [];
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function sanitizeSimpleList(array $values): array
    {
        return collect($values)
            ->map(fn ($value) => is_string($value) ? trim($value) : '')
            ->filter(fn ($value) => $value !== '')
            ->unique(fn ($value) => mb_strtolower($value))
            ->values()
            ->all();
    }

    private function sanitizeEducationalQualifications(array $values): array
    {
        return collect($values)
            ->map(function ($item) {
                $degree = is_array($item) ? trim((string) ($item['degree'] ?? '')) : '';
                $university = is_array($item) ? trim((string) ($item['university'] ?? '')) : '';

                if ($degree === '' || $university === '') {
                    return null;
                }

                return [
                    'degree' => $degree,
                    'university' => $university,
                ];
            })
            ->filter()
            ->unique(fn ($item) => mb_strtolower(($item['degree'] ?? '') . '|' . ($item['university'] ?? '')))
            ->values()
            ->all();
    }

    private function sanitizeDocumentExpertise(array $values): array
    {
        return collect($values)
            ->map(function ($item) {
                $name = is_array($item) ? trim((string) ($item['name'] ?? '')) : '';
                $fee = is_array($item) ? ($item['fee'] ?? null) : null;
                $source = is_array($item) ? trim((string) ($item['source'] ?? 'portal')) : 'portal';

                if ($name === '' || !is_numeric($fee)) {
                    return null;
                }

                return [
                    'name' => $name,
                    'fee' => round((float) $fee, 2),
                    'source' => in_array($source, ['portal', 'custom']) ? $source : 'portal',
                ];
            })
            ->filter(fn ($item) => $item !== null && $item['fee'] >= 0)
            ->unique(fn ($item) => mb_strtolower($item['name']))
            ->values()
            ->all();
    }

    private function syncLawyerDocumentExpertise(LawyerProfile $lawyerProfile, array $documentExpertise): void
    {
        if (empty($documentExpertise)) {
            return;
        }

        $documentTypes = DocumentType::all();
        $syncPayload = [];

        foreach ($documentExpertise as $entry) {
            $name = mb_strtolower(trim((string) ($entry['name'] ?? '')));
            $fee = $entry['fee'] ?? null;

            if ($name === '' || !is_numeric($fee)) {
                continue;
            }

            $matchedType = $documentTypes->first(function (DocumentType $documentType) use ($name) {
                return mb_strtolower($documentType->name) === $name;
            });

            if ($matchedType) {
                $syncPayload[$matchedType->id] = ['custom_price' => round((float) $fee, 2)];
            }
        }

        if (!empty($syncPayload)) {
            $lawyerProfile->documentTypes()->syncWithoutDetaching($syncPayload);
        }
    }
}
