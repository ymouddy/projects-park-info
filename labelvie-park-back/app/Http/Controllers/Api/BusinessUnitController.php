<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessUnit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BusinessUnitController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(BusinessUnit::withCount('magasins')->orderBy('nom')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:business_units,code',
            'couleur' => 'nullable|string|max:20',
            'icone' => 'nullable|string|max:50',
        ]);

        $bu = BusinessUnit::create($data);

        return response()->json($bu, 201);
    }

    public function show(BusinessUnit $businessUnit): JsonResponse
    {
        return response()->json($businessUnit->load('magasins'));
    }

    public function update(Request $request, BusinessUnit $businessUnit): JsonResponse
    {
        $data = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:business_units,code,' . $businessUnit->id,
            'couleur' => 'nullable|string|max:20',
            'icone' => 'nullable|string|max:50',
        ]);

        $businessUnit->update($data);

        return response()->json($businessUnit);
    }

    public function destroy(BusinessUnit $businessUnit): JsonResponse
    {
        $businessUnit->delete();

        return response()->json(null, 204);
    }
}
