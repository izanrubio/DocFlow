<?php

namespace App\Enums;

enum DocumentEventType: string
{
    case Created = 'created';
    case Sent = 'sent';
    case Viewed = 'viewed';
    case Signed = 'signed';
    case Rejected = 'rejected';
    case Completed = 'completed';
    case Expired = 'expired';
    case ReminderSent = 'reminder_sent';
    case Cancelled = 'cancelled';
}
