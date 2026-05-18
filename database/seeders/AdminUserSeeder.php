<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'System Administrator',
            'email' => 'admin@legalconnect.com',
            'password' => Hash::make('password'),
            'phone' => '+91-9999999999',
            'role' => 'admin',
            'is_verified_by_admin' => true,
        ]);
    }
}
