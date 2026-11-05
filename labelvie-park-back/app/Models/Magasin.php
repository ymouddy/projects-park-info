<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Magasin extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom', 'code', 'business_unit_id', 'adresse', 'ville',
        'nombre_caisses', 'nombre_balances', 'statut', 'responsable', 'telephone',
    ];

    public function businessUnit(): BelongsTo
    {
        return $this->belongsTo(BusinessUnit::class);
    }

    public function equipements(): HasMany
    {
        return $this->hasMany(Equipement::class);
    }

    public function utilisateurs(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
