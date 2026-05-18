<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - LegalConnect</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .card {
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        .title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 10px 0;
        }
        .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
        }
        .content {
            text-align: center;
            margin: 30px 0;
        }
        .otp-box {
            background-color: #f3f4f6;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 6px;
            color: #3b82f6;
            font-family: 'Courier New', monospace;
        }
        .otp-expiry {
            font-size: 12px;
            color: #ef4444;
            margin-top: 10px;
        }
        .message {
            font-size: 14px;
            color: #4b5563;
            margin: 15px 0;
        }
        .footer {
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
            padding-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 15px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo">LegalConnect</div>
                <h1 class="title">Email Verification</h1>
                <p class="subtitle">Complete your registration</p>
            </div>

            <div class="content">
                <p class="message">Welcome! To complete your registration, please use the One-Time Password below:</p>
                
                <div class="otp-box">
                    <div class="otp-code">{{ $otp }}</div>
                    <div class="otp-expiry">This code expires in 10 minutes</div>
                </div>

                <div class="warning">
                    <strong>Important:</strong> Never share this code with anyone. LegalConnect will never ask for it via email or message.
                </div>

                <p class="message">If you didn't request this code, you can safely ignore this email.</p>
            </div>

            <div class="footer">
                <p>&copy; {{ date('Y') }} LegalConnect. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>