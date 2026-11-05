<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessUnit;
use App\Models\Equipement;
use App\Models\Intervention;
use App\Models\Magasin;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $totalMagasins = Magasin::count();
        $totalEquipements = Equipement::count();
        $equipementsActifs = Equipement::where('statut', 'actif')->count();
        $equipementsEnPanne = Equipement::where('statut', 'en_panne')->count();

        $incidentsCritiques = Intervention::where('priorite', 'critique')
            ->whereIn('statut', ['ouverte', 'en_cours'])
            ->count();

        $businessUnits = BusinessUnit::withCount('magasins')
            ->with(['magasins' => function ($q) {
                $q->select('id', 'business_unit_id', 'nombre_caisses', 'nombre_balances');
            }])
            ->get()
            ->map(function (BusinessUnit $bu) {
                return [
                    'id' => $bu->id,
                    'nom' => $bu->nom,
                    'code' => $bu->code,
                    'couleur' => $bu->couleur,
                    'icone' => $bu->icone,
                    'magasins' => $bu->magasins_count,
                    'caisses' => $bu->magasins->sum('nombre_caisses'),
                    'balances' => $bu->magasins->sum('nombre_balances'),
                ];
            });

        return response()->json([
            'stats' => [
                'magasins' => ['total' => $totalMagasins, 'label' => 'TOTAL'],
                'equipements' => ['total' => $totalEquipements, 'label' => 'TOTAL'],
                'operationnels' => ['total' => $equipementsActifs, 'label' => 'ACTIFS'],
                'incidents' => ['total' => $equipementsEnPanne, 'critique' => $incidentsCritiques, 'label' => 'EN PANNE'],
            ],
            'business_units' => $businessUnits,
        ]);
    }
}
