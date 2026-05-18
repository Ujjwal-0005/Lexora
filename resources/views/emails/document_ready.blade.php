<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Ready</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f8fafc; }
        .wrap { max-width: 640px; margin: 0 auto; padding: 24px; }
        .card { background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); }
        .brand { color: #0f172a; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .title { font-size: 24px; margin: 0 0 12px; color: #0f172a; }
        .muted { color: #6b7280; }
        .panel { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 16px; margin: 18px 0; }
        .row { margin: 8px 0; }
        .label { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #047857; font-weight: 700; }
        .value { font-size: 15px; color: #111827; font-weight: 600; }
        .footer { margin-top: 24px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
        .cta { display: inline-block; margin-top: 18px; background: #0f172a; color: #fff !important; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 700; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="card">
            <div class="brand">LegalConnect</div>
            <h1 class="title">Your document is ready to download</h1>
            <p class="muted">The lawyer has completed your document request and the file is now available in your account.</p>

            <div class="panel">
                <div class="row"><span class="label">Document Type</span><br><span class="value">{{ $documentRequest->documentType->name ?? 'Document' }}</span></div>
                <div class="row"><span class="label">Status</span><br><span class="value">Completed</span></div>
                <div class="row"><span class="label">Next Step</span><br><span class="value">Download it from your documents dashboard</span></div>
            </div>

            <p class="muted">Please log in to review, download, and keep a copy for your records.</p>
            <a class="cta" href="{{ app()->environment('local') ? 'http://localhost:5173/client/documents' : config('app.frontend_url', url('/')) }}">Open Documents</a>

            <div class="footer">
                <p>This is an automated message from Lexora.</p>
            </div>
        </div>
    </div>
</body>
</html>
