<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Intervention extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipement_id', 'technicien_id', 'titre', 'description',
        'type', 'statut', 'priorite', 'date_intervention', 'date_resolution',
    ];

    protected $casts = [
        'date_intervention' => 'datetime',
        'date_resolution' => 'datetime',
    ];

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class);
    }

    public function technicien(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technicien_id');
    }
}
