<?php

namespace App\Http\Controllers;

use App\Mail\DocumentReadyMail;
use App\Mail\DocumentRequestedMail;
use App\Models\DocumentRequest;
use App\Models\DocumentType;
use App\Models\LawyerProfile;
use App\Support\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isClient()) {
            $documents = DocumentRequest::with(['documentType', 'lawyerProfile.user', 'payment'])
                ->where('client_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        } else if ($user->isLawyer()) {
            $lawyerProfile = $user->lawyerProfile;
            $documents = DocumentRequest::with(['documentType', 'client', 'payment'])
                ->where('lawyer_profile_id', $lawyerProfile->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $documents->getCollection()->transform(function ($document) {
            $document->document_type_name = $document->documentType?->name ?? 'Document';
            $document->document_type_slug = $document->documentType?->slug ?? 'document';
            $document->advocate_name = $document->lawyerProfile?->user?->name ?? 'Unassigned advocate';

            return $document;
        });

        return response()->json(['documents' => $documents]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'document_type_id' => 'required|exists:document_types,id',
            'lawyer_profile_id' => 'required|exists:lawyer_profiles,id',
            'custom_fields' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->isClient()) {
            return response()->json(['message' => 'Only clients can request documents'], 403);
        }

        $documentType = DocumentType::findOrFail($request->document_type_id);

        // Calculate price using lawyer custom_price if available, otherwise base price
        $price = $documentType->base_price;
        $lawyerProfile = LawyerProfile::findOrFail($request->lawyer_profile_id);
        $pivot = $lawyerProfile->documentTypes()
            ->where('document_type_id', $documentType->id)
            ->first();
        if ($pivot && $pivot->pivot->custom_price) {
            $price = $pivot->pivot->custom_price;
        }

        // Create document request in pending state (awaiting payment/acceptance)
        $documentRequest = DocumentRequest::create([
            'client_id' => $user->id,
            'lawyer_profile_id' => $request->lawyer_profile_id,
            'document_type_id' => $request->document_type_id,
            'custom_fields' => $request->custom_fields,
            'status' => 'pending',
            'price' => $price,
        ]);

        if (NotificationPreference::emailEnabled($user, 'document')) {
            Mail::to($user->email)->send(new DocumentRequestedMail($documentRequest->load(['documentType', 'lawyerProfile.user'])));
        }

        return response()->json([
            'document' => $documentRequest->load(['documentType', 'lawyerProfile.user']),
            'message' => 'Document request created successfully',
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $document = DocumentRequest::with([
            'client',
            'lawyerProfile.user',
            'documentType',
            'payment'
        ])->findOrFail($id);

        // Check authorization
        if ($user->id !== $document->client_id &&
            (!$document->lawyerProfile || $user->id !== $document->lawyerProfile->user_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['document' => $document]);
    }

    public function generate(Request $request, $id)
    {
        $user = $request->user();
        $documentRequest = DocumentRequest::with(['documentType', 'client', 'payment'])->findOrFail($id);

        // Authorization: only the assigned lawyer may perform system generation
        if (!($user->isLawyer() && $documentRequest->lawyer_profile_id && $user->id === $documentRequest->lawyerProfile->user_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Ensure document is paid before generation
        if (!$documentRequest->payment || $documentRequest->payment->status !== 'completed') {
            return response()->json(['message' => 'Document must be paid before generation'], 402);
        }

        $template = $this->buildGeneratedDocumentHtml($documentRequest);

        // Generate PDF with proper options
        $pdf = PDF::loadHTML($template);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOption('margin-top', 0);
        $pdf->setOption('margin-bottom', 0);
        $pdf->setOption('margin-left', 0);
        $pdf->setOption('margin-right', 0);

        // Ensure documents directory exists
        if (!Storage::disk('public')->exists('documents')) {
            Storage::disk('public')->makeDirectory('documents');
        }

        // Generate filename with document type slug
        $filename = 'doc_' . $documentRequest->id . '_' . Str::slug($documentRequest->documentType->slug) . '_' . time() . '.pdf';
        $path = 'documents/' . $filename;

        // Store PDF
        Storage::disk('public')->put($path, $pdf->output());

        // Update document request - mark as completed
        $previousStatus = $documentRequest->status;
        $documentRequest->generated_file_path = $path;
        $documentRequest->status = 'completed';
        $documentRequest->save();

        if ($previousStatus !== 'completed' && NotificationPreference::emailEnabled($documentRequest->client, 'document')) {
            Mail::to($documentRequest->client->email)->send(new DocumentReadyMail($documentRequest->load(['documentType', 'client'])));
        }

        return response()->json([
            'document' => $documentRequest->load(['documentType', 'client', 'payment']),
            'download_url' => Storage::disk('public')->url($path),
            'preview_url' => Storage::disk('public')->url($path),
            'message' => 'Document generated successfully',
        ], 200);
    }

    private function buildGeneratedDocumentHtml(DocumentRequest $documentRequest): string
    {
        $template = $documentRequest->documentType->base_template ?? '';
        $template = $this->replaceTemplatePlaceholders($template, $documentRequest);
        $template = $this->injectDocumentSummary($template, $documentRequest);

        return $template;
    }

    private function replaceTemplatePlaceholders(string $template, DocumentRequest $documentRequest): string
    {
        $customFields = $documentRequest->custom_fields ?? [];

        foreach ($customFields as $key => $value) {
            $placeholder = '[' . $key . ']';

            if (is_array($value) || is_object($value)) {
                $value = json_encode($value);
            }

            $template = str_replace($placeholder, (string) $value, $template);
        }

        $dateFormatted = now()->format('d M Y');
        foreach (['date', 'agreement_date', 'contract_date', 'deed_date', 'verification_date', 'issue_date', 'notice_date', 'purchase_date', 'application_date', 'change_date'] as $placeholder) {
            $template = str_replace('[' . $placeholder . ']', $dateFormatted, $template);
        }

        return preg_replace('/\[[a-zA-Z0-9_]+\]/', '&mdash;', $template) ?? $template;
    }

    private function injectDocumentSummary(string $template, DocumentRequest $documentRequest): string
    {
        $summaryHtml = $this->buildDocumentSummaryHtml($documentRequest);
        $summaryStyles = <<<'HTML'
<style>
    .generated-summary {
        font-family: Arial, Helvetica, sans-serif;
        background: #fbf8f1;
        border: 1px solid #d7c8a2;
        border-radius: 12px;
        padding: 22px 24px;
        margin: 18px 0 26px 0;
        color: #1f2937;
    }
    .generated-summary__header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
        border-bottom: 1px solid #e4d6b5;
        padding-bottom: 14px;
        margin-bottom: 18px;
    }
    .generated-summary__eyebrow {
        font-size: 10px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #8a6d2f;
        font-weight: 700;
        margin-bottom: 6px;
    }
    .generated-summary__title {
        font-size: 22px;
        font-weight: 700;
        margin: 0 0 6px 0;
        color: #111827;
    }
    .generated-summary__subtitle {
        font-size: 11px;
        line-height: 1.6;
        color: #4b5563;
        max-width: 140mm;
    }
    .generated-summary__badge {
        min-width: 92px;
        text-align: center;
        padding: 10px 12px;
        border-radius: 999px;
        background: #111827;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }
    .generated-summary__meta {
        display: table;
        width: 100%;
        table-layout: fixed;
        margin-bottom: 18px;
        border-collapse: separate;
        border-spacing: 10px 10px;
    }
    .generated-summary__meta-item {
        display: table-cell;
        width: 33.333%;
        background: #fff;
        border: 1px solid #eadfbf;
        border-radius: 10px;
        padding: 12px 14px;
        vertical-align: top;
    }
    .generated-summary__meta-label {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #8a6d2f;
        margin-bottom: 6px;
        font-weight: 700;
    }
    .generated-summary__meta-value {
        font-size: 11px;
        color: #111827;
        line-height: 1.5;
        word-break: break-word;
    }
    .generated-summary__section-title {
        font-size: 13px;
        font-weight: 700;
        color: #111827;
        margin: 18px 0 12px 0;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
    .generated-summary__table {
        width: 100%;
        border-collapse: collapse;
        background: #fff;
        border: 1px solid #eadfbf;
        border-radius: 12px;
        overflow: hidden;
    }
    .generated-summary__table td {
        border-top: 1px solid #efe5c8;
        padding: 10px 12px;
        vertical-align: top;
        font-size: 10.5px;
    }
    .generated-summary__table tr:first-child td {
        border-top: 0;
    }
    .generated-summary__label {
        width: 38%;
        font-weight: 700;
        color: #374151;
        background: #fcfaf3;
    }
    .generated-summary__value {
        width: 62%;
        color: #111827;
        word-break: break-word;
        line-height: 1.55;
    }
    .generated-summary__note {
        margin-top: 16px;
        font-size: 10px;
        line-height: 1.6;
        color: #6b7280;
        background: #fff;
        border-left: 3px solid #c9a24b;
        padding: 10px 12px;
        border-radius: 6px;
    }
</style>
HTML;

        $summaryBlock = $summaryStyles . $summaryHtml . '<div style="page-break-after: always;"></div>';

        if (preg_match('/<body[^>]*>/i', $template)) {
            return preg_replace('/<body[^>]*>/i', '$0' . $summaryBlock, $template, 1) ?? $template . $summaryBlock;
        }

        return $summaryBlock . $template;
    }

    private function buildDocumentSummaryHtml(DocumentRequest $documentRequest): string
    {
        $fieldDefinitions = $documentRequest->documentType->field_definitions ?? [];
        $customFields = $documentRequest->custom_fields ?? [];

        $metaItems = [
            ['label' => 'Document', 'value' => $documentRequest->documentType->name ?? 'Document'],
            ['label' => 'Client', 'value' => $documentRequest->client?->name ?? 'Client'],
            ['label' => 'Lawyer', 'value' => $documentRequest->lawyerProfile?->user?->name ?? 'Assigned lawyer'],
            ['label' => 'Request Date', 'value' => optional($documentRequest->created_at)->format('d M Y, h:i A') ?? now()->format('d M Y, h:i A')],
            ['label' => 'Status', 'value' => Str::headline(str_replace('_', ' ', $documentRequest->status ?? 'pending'))],
            ['label' => 'Amount', 'value' => '₹' . number_format((float) $documentRequest->price, 2)],
        ];

        $metaHtml = '';
        foreach ($metaItems as $item) {
            $metaHtml .= '<div class="generated-summary__meta-item">'
                . '<div class="generated-summary__meta-label">' . e($item['label']) . '</div>'
                . '<div class="generated-summary__meta-value">' . e($item['value']) . '</div>'
                . '</div>';
        }

        $rowsHtml = '';
        foreach ($fieldDefinitions as $definition) {
            $name = $definition['name'] ?? null;
            if (!$name) {
                continue;
            }

            $label = $definition['label'] ?? Str::headline(str_replace('_', ' ', $name));
            $value = $customFields[$name] ?? null;

            if (is_array($value)) {
                $value = implode(', ', array_map(function ($item) {
                    return is_scalar($item) ? (string) $item : json_encode($item);
                }, $value));
            } elseif (is_object($value)) {
                $value = json_encode($value);
            }

            $value = filled($value) ? (string) $value : '—';

            $rowsHtml .= '<tr>'
                . '<td class="generated-summary__label">' . e($label) . '</td>'
                . '<td class="generated-summary__value">' . nl2br(e($value)) . '</td>'
                . '</tr>';
        }

        return '<div class="generated-summary">'
            . '<div class="generated-summary__header">'
            . '<div>'
            . '<div class="generated-summary__eyebrow">System Generated Legal Draft</div>'
            . '<div class="generated-summary__title">' . e($documentRequest->documentType->name ?? 'Document') . '</div>'
            . '<div class="generated-summary__subtitle">This cover page consolidates every field submitted in the request so the final draft is easy to review, print, and file.</div>'
            . '</div>'
            . '<div class="generated-summary__badge">Draft Ready</div>'
            . '</div>'
            . '<div class="generated-summary__meta">' . $metaHtml . '</div>'
            . '<div class="generated-summary__section-title">Submitted Details</div>'
            . '<table class="generated-summary__table">' . $rowsHtml . '</table>'
            . '<div class="generated-summary__note">The body of the document below is formatted from the selected template. Any empty fields are intentionally shown as em dashes to keep the draft clean and readable.</div>'
            . '</div>';
    }

    public function download(Request $request, $id)
    {
        $user = $request->user();
        $document = DocumentRequest::findOrFail($id);

        // Check authorization
        if ($user->id !== $document->client_id &&
            (!$document->lawyerProfile || $user->id !== $document->lawyerProfile->user_id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$document->generated_file_path) {
            return response()->json(['message' => 'Document not yet generated'], 404);
        }

        $filePath = $document->generated_file_path;
        
        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json(['message' => 'Document file not found on server'], 404);
        }

        // Stream the file download
        $filename = pathinfo($filePath, PATHINFO_BASENAME);
        
        return Storage::disk('public')->download(
            $filePath,
            $document->documentType->slug . '-' . $document->id . '.pdf',
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $document->documentType->slug . '-' . $document->id . '.pdf"'
            ]
        );
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,review,completed,delivered',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $document = DocumentRequest::findOrFail($id);

        // Only lawyer can update status
        if (!$user->isLawyer() || $document->lawyer_profile_id !== $user->lawyerProfile->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $previousStatus = $document->status;
        $document->status = $request->status;
        $document->save();

        if ($previousStatus !== 'completed' && $request->status === 'completed' && NotificationPreference::emailEnabled($document->client, 'document')) {
            Mail::to($document->client->email)->send(new DocumentReadyMail($document->load(['documentType', 'client'])));
        }

        return response()->json([
            'document' => $document,
            'message' => 'Status updated successfully',
        ]);
    }

    public function listTypes(Request $request)
    {
        $documentTypes = DocumentType::with('lawyerProfiles')->get()->map(function (DocumentType $documentType) {
            $documentType->minimum_lawyer_fee = $this->getMinimumLawyerFee($documentType);
            return $documentType;
        });

        return response()->json(['documentTypes' => $documentTypes]);
    }

    public function getType(Request $request, $id)
    {
        $documentType = DocumentType::with('lawyerProfiles')->findOrFail($id);
        $documentType->minimum_lawyer_fee = $this->getMinimumLawyerFee($documentType);
        return response()->json(['documentType' => $documentType]);
    }

    // New: return lawyers offering this document type with custom_price and profile
    public function lawyersForType(Request $request, $id)
    {
        $documentType = DocumentType::with(['lawyerProfiles.user'])->findOrFail($id);

        $lawyers = $documentType->lawyerProfiles->map(function ($lp) use ($documentType) {
            return [
                'id' => $lp->id,
                'user' => $lp->user,
                'bio' => $lp->bio,
                'average_rating' => $lp->average_rating,
                'custom_price' => optional($lp->pivot)->custom_price ?? null,
            ];
        });

        return response()->json(['lawyers' => $lawyers]);
    }

    private function getMinimumLawyerFee(DocumentType $documentType): float
    {
        $customFees = $documentType->lawyerProfiles
            ->pluck('pivot.custom_price')
            ->filter(fn ($fee) => $fee !== null && $fee !== '')
            ->map(fn ($fee) => (float) $fee)
            ->values();

        if ($customFees->isNotEmpty()) {
            return (float) $customFees->min();
        }

        return (float) $documentType->base_price;
    }

    // New: list documents assigned to logged-in lawyer (only paid requests)
    public function lawyerDocuments(Request $request)
    {
        $user = $request->user();
        if (! $user->isLawyer() || ! $user->lawyerProfile) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $lawyerProfile = $user->lawyerProfile;

        $documents = DocumentRequest::with(['documentType', 'client', 'payment'])
            ->where('lawyer_profile_id', $lawyerProfile->id)
            ->whereHas('payment', function ($q) {
                $q->where('status', 'completed');
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $documents->getCollection()->transform(function ($document) {
            $document->document_type_name = $document->documentType?->name ?? 'Document';
            $document->document_type_slug = $document->documentType?->slug ?? 'document';
            $document->advocate_name = $document->client?->name ?? 'Client';

            return $document;
        });

        return response()->json(['documents' => $documents]);
    }

    // New: lawyer updates status; can upload file when marking completed
    public function lawyerUpdateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:accepted,in_progress,completed,delivered',
            'file' => 'nullable|file|mimes:pdf|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (! $user->isLawyer() || ! $user->lawyerProfile) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $document = DocumentRequest::findOrFail($id);
        if ($document->lawyer_profile_id !== $user->lawyerProfile->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $status = $request->status;

        // If marking completed and a file is provided, store it
        if ($status === 'completed' && $request->hasFile('file')) {
            $file = $request->file('file');
            if (!Storage::disk('public')->exists('documents')) {
                Storage::disk('public')->makeDirectory('documents');
            }
            $filename = 'uploaded_doc_' . $document->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('documents', $filename, 'public');
            $document->generated_file_path = $path;
            $document->status = 'completed';
            $document->save();

            return response()->json(['document' => $document, 'message' => 'File uploaded and request completed']);
        }

        // Otherwise just update status
        $document->status = $status;
        $document->save();

        return response()->json(['document' => $document, 'message' => 'Status updated successfully']);
    }
}
