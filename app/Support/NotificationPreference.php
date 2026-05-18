<?php

namespace App\Support;

use App\Models\User;

class NotificationPreference
{
    public static function emailEnabled(?User $user, string $channel): bool
    {
        if (! $user) {
            return false;
        }

        $preferences = $user->notificationPreferences();

        if (! ($preferences['email'] ?? true)) {
            return false;
        }

        return match ($channel) {
            'consultation' => (bool) ($preferences['consultation_reminders'] ?? true),
            'document' => (bool) ($preferences['document_updates'] ?? true),
            default => true,
        };
    }
}
