<?php

namespace App\Http\Controllers;

use App\Mail\ConsultationConfirmedMail;
use App\Models\Consultation;
use App\Models\ConsultationPayment;
use App\Models\DocumentRequest;
use App\Models\DocumentPayment;
use App\Support\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function processConsultationPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consultation_id' => 'required|exists:consultations,id',
            'payment_method' => 'required|in:card,upi,netbanking',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $consultation = Consultation::findOrFail($request->consultation_id);

        // Verify ownership
        if ($consultation->client_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if already paid
        if ($consultation->payment && $consultation->payment->status === 'completed') {
            return response()->json(['message' => 'Payment already completed'], 400);
        }

        // Mock payment processing
        $transactionId = 'TXN' . strtoupper(Str::random(12));

        $payment = ConsultationPayment::updateOrCreate(
            ['consultation_id' => $consultation->id],
            [
                'amount' => $consultation->fee,
                'payment_method' => $request->payment_method,
                'transaction_id' => $transactionId,
                'status' => 'completed',
                'paid_at' => now(),
            ]
        );

        // Update consultation status
        $previousStatus = $consultation->status;
        $consultation->status = 'confirmed';
        $consultation->save();

        if ($previousStatus !== 'confirmed' && NotificationPreference::emailEnabled($consultation->client, 'consultation')) {
            Mail::to($consultation->client->email)->send(new ConsultationConfirmedMail($consultation->load(['lawyerProfile.user', 'client'])));
        }

        return response()->json([
            'payment' => $payment,
            'message' => 'Payment processed successfully',
        ]);
    }

    public function processDocumentPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'document_request_id' => 'required|exists:document_requests,id',
            'payment_method' => 'required|in:card,upi,netbanking',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $documentRequest = DocumentRequest::findOrFail($request->document_request_id);

        // Verify ownership
        if ($documentRequest->client_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if already paid
        if ($documentRequest->payment && $documentRequest->payment->status === 'completed') {
            return response()->json(['message' => 'Payment already completed'], 400);
        }

        if ($documentRequest->price <= 0) {
            return response()->json(['message' => 'This document does not have a payable amount yet'], 409);
        }

        if (!in_array($documentRequest->status, ['awaiting_payment', 'client_info_submitted', 'accepted', 'pending', 'requested'], true)) {
            return response()->json(['message' => 'This document is not ready for payment'], 409);
        }

        // Mock payment processing
        $transactionId = 'TXN' . strtoupper(Str::random(12));

        $payment = DocumentPayment::updateOrCreate(
            ['document_request_id' => $documentRequest->id],
            [
                'amount' => $documentRequest->price,
                'payment_method' => $request->payment_method,
                'transaction_id' => $transactionId,
                'status' => 'completed',
                'paid_at' => now(),
            ]
        );

        // Update document status to pending so lawyer can act on it
        $documentRequest->status = 'paid';
        $documentRequest->payment_completed_at = now();
        $documentRequest->save();

        return response()->json([
            'payment' => $payment,
            'message' => 'Payment processed successfully',
        ]);
    }

    public function getPaymentStatus(Request $request, $type, $id)
    {
        $user = $request->user();

        if ($type === 'consultation') {
            $payment = ConsultationPayment::where('consultation_id', $id)->first();
            $item = Consultation::findOrFail($id);
        } else if ($type === 'document') {
            $payment = DocumentPayment::where('document_request_id', $id)->first();
            $item = DocumentRequest::findOrFail($id);
        } else {
            return response()->json(['message' => 'Invalid payment type'], 400);
        }

        // Verify ownership
        if ($item->client_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['payment' => $payment]);
    }
}
