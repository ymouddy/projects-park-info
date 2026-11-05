<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('magasins', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('code')->unique();
            $table->foreignId('business_unit_id')->constrained('business_units')->cascadeOnDelete();
            $table->string('adresse')->nullable();
            $table->string('ville')->nullable();
            $table->integer('nombre_caisses')->default(0);
            $table->integer('nombre_balances')->default(0);
            $table->enum('statut', ['operationnel', 'en_panne', 'maintenance', 'ferme'])->default('operationnel');
            $table->string('responsable')->nullable();
            $table->string('telephone')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('magasins');
    }
};
