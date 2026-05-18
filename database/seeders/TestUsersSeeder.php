<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\LawyerProfile;
use App\Models\Specialization;
use App\Models\Region;
use App\Models\DocumentType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Create test client
        $client = User::create([
            'name' => 'Test Client',
            'email' => 'client@test.com',
            'password' => Hash::make('password'),
            'phone' => '+91-9876543210',
            'role' => 'client',
            'is_verified_by_admin' => true,
        ]);

        // Create test lawyer 1
        $lawyer1 = User::create([
            'name' => 'Adv. Rajesh Sharma',
            'email' => 'lawyer1@test.com',
            'password' => Hash::make('password'),
            'phone' => '+91-8765432109',
            'role' => 'lawyer',
            'is_verified_by_admin' => true,
        ]);

        $profile1 = LawyerProfile::create([
            'user_id' => $lawyer1->id,
            'license_number' => 'BAR12345DL2024',
            'bar_council_id' => 'DHC-2015-001',
            'years_of_experience' => 8,
            'bio' => 'Experienced advocate specializing in family law and criminal defense. Practicing at Delhi High Court with over 500 successful cases.',
            'consultation_fee' => 2000.00,
            'is_available' => true,
            'average_rating' => 4.5,
            'total_consultations' => 150,
        ]);

        // Attach specializations
        $familyLaw = Specialization::where('slug', 'family-law')->first();
        $criminalLaw = Specialization::where('slug', 'criminal-law')->first();
        $profile1->specializations()->attach([$familyLaw->id, $criminalLaw->id]);

        // Attach regions
        $delhiRegion = Region::where('city', 'New Delhi')->first();
        $mumbaiRegion = Region::where('city', 'Mumbai')->first();
        $profile1->regions()->attach([$delhiRegion->id, $mumbaiRegion->id]);

        // Attach document types with custom prices
        $willDoc = DocumentType::where('slug', 'will-testament')->first();
        $rentalDoc = DocumentType::where('slug', 'rent-agreement')->first();
        if ($willDoc && $rentalDoc) {
            $profile1->documentTypes()->attach([
                $willDoc->id => ['custom_price' => 3000.00],
                $rentalDoc->id => ['custom_price' => 2000.00],
            ]);
        }

        // Create test lawyer 2
        $lawyer2 = User::create([
            'name' => 'Adv. Priya Patel',
            'email' => 'lawyer2@test.com',
            'password' => Hash::make('password'),
            'phone' => '+91-7654321098',
            'role' => 'lawyer',
            'is_verified_by_admin' => true,
        ]);

        $profile2 = LawyerProfile::create([
            'user_id' => $lawyer2->id,
            'license_number' => 'BAR67890MH2024',
            'bar_council_id' => 'BHC-2018-002',
            'years_of_experience' => 5,
            'bio' => 'Corporate law expert with expertise in contracts, mergers, and acquisitions. Also handles intellectual property matters.',
            'consultation_fee' => 3000.00,
            'is_available' => true,
            'average_rating' => 4.8,
            'total_consultations' => 80,
        ]);

        // Attach specializations
        $corporateLaw = Specialization::where('slug', 'corporate-law')->first();
        $ipLaw = Specialization::where('slug', 'intellectual-property')->first();
        $profile2->specializations()->attach([$corporateLaw->id, $ipLaw->id]);

        // Attach regions
        $bangaloreRegion = Region::where('city', 'Bangalore')->first();
        $profile2->regions()->attach([$bangaloreRegion->id, $mumbaiRegion->id]);

        // Attach document types
        $ndaDoc = DocumentType::where('slug', 'nda')->first();
        $employmentDoc = DocumentType::where('slug', 'employment-contract')->first();
        $profile2->documentTypes()->attach([
            $ndaDoc->id => ['custom_price' => 3500.00],
            $employmentDoc->id => ['custom_price' => 2500.00],
        ]);
    }
}
