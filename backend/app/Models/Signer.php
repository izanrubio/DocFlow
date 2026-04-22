<?php

namespace App\Models;

use App\Enums\SignerStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Signer extends Model
{
    protected $fillable = [
        'document_id', 'tenant_id', 'name', 'email',
        'order', 'status', 'token', 'signed_at',
    ];

    protected $casts = [
        'status' => SignerStatus::class,
        'signed_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $signer) {
            if (empty($signer->token)) {
                $signer->token = (string) Str::uuid();
            }
        });
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function signature(): HasOne
    {
        return $this->hasOne(Signature::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(DocumentEvent::class);
    }
}
