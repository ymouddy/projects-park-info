<?php

namespace Database\Seeders;

use App\Models\BusinessUnit;
use App\Models\Equipement;
use App\Models\Magasin;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(BusinessUnitSeeder::class);

        // Admin par défaut
        User::updateOrCreate(
            ['email' => 'admin@labelvie.ma'],
            [
                'name' => 'Administrateur',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'actif' => true,
            ]
        );

        // Quelques magasins de démonstration (correspond à votre capture)
        $hlv = BusinessUnit::where('code', 'HLV')->first();
        $cfm = BusinessUnit::where('code', 'CFM')->first();
        $atacadao = BusinessUnit::where('code', 'ATACADAO')->first();

        $m1 = Magasin::updateOrCreate(['code' => 'HLV-001'], [
            'nom' => 'HLV Rabat Agdal', 'business_unit_id' => $hlv->id,
            'nombre_caisses' => 12, 'nombre_balances' => 3, 'statut' => 'operationnel',
            'ville' => 'Rabat',
        ]);

        $m2 = Magasin::updateOrCreate(['code' => 'CFM-001'], [
            'nom' => 'Carrefour Market Casablanca', 'business_unit_id' => $cfm->id,
            'nombre_caisses' => 18, 'nombre_balances' => 4, 'statut' => 'operationnel',
            'ville' => 'Casablanca',
        ]);

        $m3 = Magasin::updateOrCreate(['code' => 'ATC-001'], [
            'nom' => 'Atacadao Tanger', 'business_unit_id' => $atacadao->id,
            'nombre_caisses' => 24, 'nombre_balances' => 8, 'statut' => 'operationnel',
            'ville' => 'Tanger',
        ]);

        // Équipements de démonstration
        Equipement::updateOrCreate(['numero_serie' => 'SN-0001'], [
            'magasin_id' => $m1->id, 'type' => 'Caisse', 'marque' => 'NCR', 'statut' => 'actif',
        ]);
        Equipement::updateOrCreate(['numero_serie' => 'SN-0002'], [
            'magasin_id' => $m2->id, 'type' => 'Serveur', 'marque' => 'Dell', 'statut' => 'actif',
        ]);
        Equipement::updateOrCreate(['numero_serie' => 'SN-0003'], [
            'magasin_id' => $m3->id, 'type' => 'Balance', 'marque' => 'Mettler', 'statut' => 'en_panne',
        ]);
        Equipement::updateOrCreate(['numero_serie' => 'SN-0004'], [
            'magasin_id' => $m1->id, 'type' => 'Imprimante', 'marque' => 'Epson', 'statut' => 'actif',
        ]);
    }
}
