<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_units', function (Blueprint $table) {
            $table->id();
            $table->string('nom');          // ex: HLV, CFM, ATACADAO, EXP, Franchisé, SUPECO
            $table->string('code')->unique(); // ex: HLV, CFM, ATACADAO...
            $table->string('couleur')->default('#3B82F6'); // couleur d'affichage (hex)
            $table->string('icone')->nullable(); // nom de l'icône (lucide-react)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_units');
    }
};
