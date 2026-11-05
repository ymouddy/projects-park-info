<?php

namespace Database\Seeders;

use App\Models\BusinessUnit;
use Illuminate\Database\Seeder;

class BusinessUnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['nom' => 'HLV',       'code' => 'HLV',       'couleur' => '#3B82F6'], // bleu
            ['nom' => 'CFM',       'code' => 'CFM',       'couleur' => '#EF4444'], // rouge/rose
            ['nom' => 'Atacadao',  'code' => 'ATACADAO',  'couleur' => '#84CC16'], // vert clair
            ['nom' => 'Exp',       'code' => 'EXP',       'couleur' => '#10B981'], // vert
            ['nom' => 'Franchisé', 'code' => 'FRANCHISE', 'couleur' => '#14B8A6'], // teal
            ['nom' => 'Supeco',    'code' => 'SUPECO',    'couleur' => '#F97316'], // orange
        ];

        foreach ($units as $unit) {
            BusinessUnit::updateOrCreate(['code' => $unit['code']], $unit);
        }
    }
}
