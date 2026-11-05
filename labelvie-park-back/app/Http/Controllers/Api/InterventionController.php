<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Intervention;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InterventionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Intervention::with(['equipement.magasin', 'technicien']);

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('priorite')) {
            $query->where('priorite', $request->priorite);
        }
        if ($request->filled('equipement_id')) {
            $query->where('equipement_id', $request->equipement_id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'equipement_id' => 'required|exists:equipements,id',
            'technicien_id' => 'nullable|exists:users,id',
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|in:preventive,curative,installation,autre',
            'statut' => 'nullable|in:ouverte,en_cours,resolue,annulee',
            'priorite' => 'nullable|in:basse,normale,haute,critique',
            'date_intervention' => 'nullable|date',
        ]);

        $intervention = Intervention::create($data);

        return response()->json($intervention->load('equipement'), 201);
    }

    public function show(Intervention $intervention): JsonResponse
    {
        return response()->json($intervention->load(['equipement.magasin', 'technicien']));
    }

    public function update(Request $request, Intervention $intervention): JsonResponse
    {
        $data = $request->validate([
            'technicien_id' => 'nullable|exists:users,id',
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|in:preventive,curative,installation,autre',
            'statut' => 'nullable|in:ouverte,en_cours,resolue,annulee',
            'priorite' => 'nullable|in:basse,normale,haute,critique',
            'date_intervention' => 'nullable|date',
            'date_resolution' => 'nullable|date',
        ]);

        $intervention->update($data);

        return response()->json($intervention->load('equipement'));
    }

    public function destroy(Intervention $intervention): JsonResponse
    {
        $intervention->delete();

        return response()->json(null, 204);
    }
}
