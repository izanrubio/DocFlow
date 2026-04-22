<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Signature extends Model
{
    protected $fillable = [
        'signer_id', 'document_id', 'signature_data',
        'ip_address', 'user_agent',
    ];

    public function signer(): BelongsTo
    {
        return $this->belongsTo(Signer::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
