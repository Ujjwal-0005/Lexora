<?php

namespace Database\Seeders;

use App\Models\LawyerProfile;
use Illuminate\Database\Seeder;

class BackfillCoreCompetenciesSeeder extends Seeder
{
    public function run(): void
    {
        $profiles = LawyerProfile::query()->with('specializations')->get();

        foreach ($profiles as $profile) {
            $current = $profile->core_competencies;
            $hasValues = is_array($current) && count(array_filter($current, static fn ($value) => ! empty($value))) > 0;

            if ($hasValues) {
                continue;
            }

            $mapped = $profile->specializations
                ->pluck('name')
                ->filter()
                ->unique()
                ->values()
                ->all();

            if (count($mapped) === 0) {
                $mapped = ['General Legal Advisory'];
            }

            $profile->core_competencies = $mapped;
            $profile->save();
        }
    }
}