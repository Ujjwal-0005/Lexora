<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Request Received</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f8fafc; }
        .wrap { max-width: 640px; margin: 0 auto; padding: 24px; }
        .card { background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); }
        .brand { color: #0f172a; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .title { font-size: 24px; margin: 0 0 12px; color: #0f172a; }
        .muted { color: #6b7280; }
        .panel { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 18px 0; }
        .row { margin: 8px 0; }
        .label { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; font-weight: 700; }
        .value { font-size: 15px; color: #111827; font-weight: 600; }
        .footer { margin-top: 24px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
        .cta { display: inline-block; margin-top: 18px; background: #0f172a; color: #fff !important; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 700; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="card">
            <div class="brand">Lexora</div>
            <h1 class="title">A new document request is waiting for your review</h1>
            <p class="muted">A client has sent a custom document request through the portal. Review it, accept or reject it, and then send the required fields and fee.</p>

            <div class="panel">
                <div class="row"><span class="label">Document Name</span><br><span class="value">{{ $documentRequest->document_name ?? $documentRequest->documentType->name ?? 'Document' }}</span></div>
                <div class="row"><span class="label">Client</span><br><span class="value">{{ $documentRequest->client->name ?? 'Client' }}</span></div>
                <div class="row"><span class="label">Status</span><br><span class="value">{{ \Illuminate\Support\Str::headline(str_replace('_', ' ', $documentRequest->status ?? 'requested')) }}</span></div>
                @if(!empty($documentRequest->request_notes))
                    <div class="row"><span class="label">Notes</span><br><span class="value">{{ $documentRequest->request_notes }}</span></div>
                @endif
            </div>

            <p class="muted">Open the lawyer portal to define the required fields, quote the fee, and move the request forward.</p>
            <a class="cta" href="{{ app()->environment('local') ? 'http://localhost:5173/lawyer/documents' : config('app.frontend_url', url('/')) }}">Open Lawyer Portal</a>

            <div class="footer">
                <p>This is an automated message from Lexora.</p>
            </div>
        </div>
    </div>
</body>
</html>
