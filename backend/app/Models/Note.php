<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
    use HasFactory;

    protected $fillable = [
        'evaluation_id',
        'eleve_id',
        'note',
        'absent',
        'appreciation',
        'observation',
    ];

    protected $casts = [
        'note' => 'decimal:2',
        'absent' => 'boolean',
    ];

    public function evaluation()
    {
        return $this->belongsTo(Evaluation::class);
    }

    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }
}
