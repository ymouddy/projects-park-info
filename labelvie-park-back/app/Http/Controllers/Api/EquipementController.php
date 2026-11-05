<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EquipementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Equipement::with('magasin.businessUnit');

        if ($request->filled('magasin_id')) {
            $query->where('magasin_id', $request->magasin_id);
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'magasin_id' => 'required|exists:magasins,id',
            'type' => 'required|string|max:100',
            'marque' => 'nullable|string|max:100',
            'modele' => 'nullable|string|max:100',
            'numero_serie' => 'nullable|string|max:100|unique:equipements,numero_serie',
            'statut' => 'nullable|in:actif,en_panne,maintenance,hors_service',
            'date_installation' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $equipement = Equipement::create($data);

        return response()->json($equipement->load('magasin'), 201);
    }

    public function show(Equipement $equipement): JsonResponse
    {
        return response()->json($equipement->load(['magasin.businessUnit', 'interventions']));
    }

    public function update(Request $request, Equipement $equipement): JsonResponse
    {
        $data = $request->validate([
            'magasin_id' => 'sometimes|required|exists:magasins,id',
            'type' => 'sometimes|required|string|max:100',
            'marque' => 'nullable|string|max:100',
            'modele' => 'nullable|string|max:100',
            'numero_serie' => 'nullable|string|max:100|unique:equipements,numero_serie,' . $equipement->id,
            'statut' => 'nullable|in:actif,en_panne,maintenance,hors_service',
            'date_installation' => 'nullable|date',
            'date_derniere_maintenance' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $equipement->update($data);

        return response()->json($equipement->load('magasin'));
    }

    public function destroy(Equipement $equipement): JsonResponse
    {
        $equipement->delete();

        return response()->json(null, 204);
    }
}
