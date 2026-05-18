<?php

namespace Database\Seeders;

use App\Models\Specialization;
use Illuminate\Database\Seeder;

class SpecializationSeeder extends Seeder
{
    public function run(): void
    {
        $specializations = [
            ['name' => 'Family Law', 'slug' => 'family-law', 'icon' => 'users'],
            ['name' => 'Criminal Law', 'slug' => 'criminal-law', 'icon' => 'shield'],
            ['name' => 'Corporate Law', 'slug' => 'corporate-law', 'icon' => 'building'],
            ['name' => 'Property Law', 'slug' => 'property-law', 'icon' => 'home'],
            ['name' => 'Intellectual Property', 'slug' => 'intellectual-property', 'icon' => 'lightbulb'],
            ['name' => 'Employment Law', 'slug' => 'employment-law', 'icon' => 'briefcase'],
            ['name' => 'Tax Law', 'slug' => 'tax-law', 'icon' => 'calculator'],
            ['name' => 'Immigration Law', 'slug' => 'immigration-law', 'icon' => 'globe'],
            ['name' => 'Environmental Law', 'slug' => 'environmental-law', 'icon' => 'leaf'],
            ['name' => 'Consumer Protection', 'slug' => 'consumer-protection', 'icon' => 'shield-alt'],
        ];

        foreach ($specializations as $specialization) {
            Specialization::create($specialization);
        }
    }
}
