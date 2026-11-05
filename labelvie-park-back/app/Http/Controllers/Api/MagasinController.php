<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Magasin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MagasinController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Magasin::with('businessUnit')->withCount('equipements');

        if ($request->filled('business_unit_id')) {
            $query->where('business_unit_id', $request->business_unit_id);
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nom', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->orderBy('nom')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:magasins,code',
            'business_unit_id' => 'required|exists:business_units,id',
            'adresse' => 'nullable|string',
            'ville' => 'nullable|string',
            'nombre_caisses' => 'nullable|integer|min:0',
            'nombre_balances' => 'nullable|integer|min:0',
            'statut' => 'nullable|in:operationnel,en_panne,maintenance,ferme',
            'responsable' => 'nullable|string',
            'telephone' => 'nullable|string',
        ]);

        $magasin = Magasin::create($data);

        return response()->json($magasin->load('businessUnit'), 201);
    }

    public function show(Magasin $magasin): JsonResponse
    {
        return response()->json($magasin->load(['businessUnit', 'equipements']));
    }

    public function update(Request $request, Magasin $magasin): JsonResponse
    {
        $data = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:magasins,code,' . $magasin->id,
            'business_unit_id' => 'sometimes|required|exists:business_units,id',
            'adresse' => 'nullable|string',
            'ville' => 'nullable|string',
            'nombre_caisses' => 'nullable|integer|min:0',
            'nombre_balances' => 'nullable|integer|min:0',
            'statut' => 'nullable|in:operationnel,en_panne,maintenance,ferme',
            'responsable' => 'nullable|string',
            'telephone' => 'nullable|string',
        ]);

        $magasin->update($data);

        return response()->json($magasin->load('businessUnit'));
    }

    public function destroy(Magasin $magasin): JsonResponse
    {
        $magasin->delete();

        return response()->json(null, 204);
    }
}
