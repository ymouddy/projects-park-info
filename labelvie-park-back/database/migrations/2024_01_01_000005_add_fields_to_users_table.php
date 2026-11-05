<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'gestionnaire', 'technicien', 'utilisateur'])->default('utilisateur')->after('email');
            $table->foreignId('magasin_id')->nullable()->after('role')->constrained('magasins')->nullOnDelete();
            $table->string('telephone')->nullable()->after('magasin_id');
            $table->boolean('actif')->default(true)->after('telephone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['magasin_id']);
            $table->dropColumn(['role', 'magasin_id', 'telephone', 'actif']);
        });
    }
};
