<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            ['name' => 'Delhi High Court', 'state' => 'Delhi', 'city' => 'New Delhi', 'type' => 'court'],
            ['name' => 'Mumbai City', 'state' => 'Maharashtra', 'city' => 'Mumbai', 'type' => 'city'],
            ['name' => 'Bangalore District', 'state' => 'Karnataka', 'city' => 'Bangalore', 'type' => 'district'],
            ['name' => 'Chennai High Court', 'state' => 'Tamil Nadu', 'city' => 'Chennai', 'type' => 'court'],
            ['name' => 'Kolkata City', 'state' => 'West Bengal', 'city' => 'Kolkata', 'type' => 'city'],
            ['name' => 'Hyderabad District', 'state' => 'Telangana', 'city' => 'Hyderabad', 'type' => 'district'],
            ['name' => 'Pune City', 'state' => 'Maharashtra', 'city' => 'Pune', 'type' => 'city'],
            ['name' => 'Ahmedabad District', 'state' => 'Gujarat', 'city' => 'Ahmedabad', 'type' => 'district'],
            ['name' => 'Jaipur City', 'state' => 'Rajasthan', 'city' => 'Jaipur', 'type' => 'city'],
            ['name' => 'Lucknow District', 'state' => 'Uttar Pradesh', 'city' => 'Lucknow', 'type' => 'district'],
        ];

        foreach ($regions as $region) {
            Region::create($region);
        }
    }
}
