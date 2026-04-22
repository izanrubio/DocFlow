<?php

namespace App\Enums;

enum SignerStatus: string
{
    case Pending = 'pending';
    case Viewed = 'viewed';
    case Signed = 'signed';
    case Rejected = 'rejected';
}
