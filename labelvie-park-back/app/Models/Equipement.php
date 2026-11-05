<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipement extends Model
{
    use HasFactory;

    protected $fillable = [
        'magasin_id', 'type', 'marque', 'modele', 'numero_serie',
        'statut', 'date_installation', 'date_derniere_maintenance', 'notes',
    ];

    protected $casts = [
        'date_installation' => 'date',
        'date_derniere_maintenance' => 'date',
    ];

    public function magasin(): BelongsTo
    {
        return $this->belongsTo(Magasin::class);
    }

    public function interventions(): HasMany
    {
        return $this->hasMany(Intervention::class);
    }
}
