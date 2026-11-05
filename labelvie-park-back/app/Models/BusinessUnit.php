<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessUnit extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'code', 'couleur', 'icone'];

    public function magasins(): HasMany
    {
        return $this->hasMany(Magasin::class);
    }

    // Attribut calculé : totaux (nombre de magasins, caisses, balances)
    public function getTotauxAttribute(): array
    {
        return [
            'magasins' => $this->magasins()->count(),
            'caisses' => $this->magasins()->sum('nombre_caisses'),
            'balances' => $this->magasins()->sum('nombre_balances'),
        ];
    }
}
