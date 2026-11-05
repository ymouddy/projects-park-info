<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Ajouter la colonne 'role' après 'password'
            $table->string('role')->default('utilisateur')->after('password');
            // Ajouter la colonne 'magasin_id' (clé étrangère vers magasins)
            $table->foreignId('magasin_id')->nullable()->constrained('magasins')->nullOnDelete()->after('role');
            // Ajouter la colonne 'actif' (boolean)
            $table->boolean('actif')->default(true)->after('magasin_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['magasin_id']);
            $table->dropColumn(['role', 'magasin_id', 'actif']);
        });
    }
};