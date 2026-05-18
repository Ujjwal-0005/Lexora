<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use App\Models\LawyerProfile;
use App\Models\Region;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LawyerSeeder extends Seeder
{
    public function run(): void
    {
        $specializations = Specialization::query()->pluck('id', 'slug');
        $regions = Region::query()->pluck('id', 'city');
        $documentTypes = DocumentType::query()->get()->keyBy('slug');

        if ($specializations->isEmpty() || $regions->isEmpty() || $documentTypes->isEmpty()) {
            throw new \RuntimeException('Seed specializations, regions, and document types before running LawyerSeeder.');
        }

        $lawyers = [
            [
                'name' => 'Adv. Aarav Mehta',
                'email' => 'aarav.mehta@legalconnect.test',
                'phone' => '+91-9000000001',
                'specializations' => ['family-law', 'property-law'],
                'regions' => ['New Delhi', 'Jaipur'],
                'license_number' => 'LC-DL-2026-001',
                'bar_council_id' => 'BAR-DL-2026-001',
            ],
            [
                'name' => 'Adv. Nandini Rao',
                'email' => 'nandini.rao@legalconnect.test',
                'phone' => '+91-9000000002',
                'specializations' => ['family-law', 'criminal-law'],
                'regions' => ['New Delhi', 'Mumbai'],
                'license_number' => 'LC-DL-2026-002',
                'bar_council_id' => 'BAR-DL-2026-002',
            ],
            [
                'name' => 'Adv. Kabir Sethi',
                'email' => 'kabir.sethi@legalconnect.test',
                'phone' => '+91-9000000003',
                'specializations' => ['family-law', 'consumer-protection'],
                'regions' => ['New Delhi', 'Lucknow'],
                'license_number' => 'LC-DL-2026-003',
                'bar_council_id' => 'BAR-DL-2026-003',
            ],
            [
                'name' => 'Adv. Ayesha Khan',
                'email' => 'ayesha.khan@legalconnect.test',
                'phone' => '+91-9000000004',
                'specializations' => ['criminal-law', 'consumer-protection'],
                'regions' => ['Mumbai', 'Pune'],
                'license_number' => 'LC-MH-2026-004',
                'bar_council_id' => 'BAR-MH-2026-004',
            ],
            [
                'name' => 'Adv. Vikram Joshi',
                'email' => 'vikram.joshi@legalconnect.test',
                'phone' => '+91-9000000005',
                'specializations' => ['criminal-law', 'family-law'],
                'regions' => ['Mumbai', 'New Delhi'],
                'license_number' => 'LC-MH-2026-005',
                'bar_council_id' => 'BAR-MH-2026-005',
            ],
            [
                'name' => 'Adv. Rohan Dutta',
                'email' => 'rohan.dutta@legalconnect.test',
                'phone' => '+91-9000000006',
                'specializations' => ['criminal-law', 'property-law'],
                'regions' => ['Mumbai', 'Bangalore'],
                'license_number' => 'LC-MH-2026-006',
                'bar_council_id' => 'BAR-MH-2026-006',
            ],
            [
                'name' => 'Adv. Priya Nair',
                'email' => 'priya.nair@legalconnect.test',
                'phone' => '+91-9000000007',
                'specializations' => ['corporate-law', 'tax-law'],
                'regions' => ['Bangalore', 'Hyderabad'],
                'license_number' => 'LC-KA-2026-007',
                'bar_council_id' => 'BAR-KA-2026-007',
            ],
            [
                'name' => 'Adv. Arjun Iyer',
                'email' => 'arjun.iyer@legalconnect.test',
                'phone' => '+91-9000000008',
                'specializations' => ['corporate-law', 'intellectual-property'],
                'regions' => ['Bangalore', 'Kolkata'],
                'license_number' => 'LC-KA-2026-008',
                'bar_council_id' => 'BAR-KA-2026-008',
            ],
            [
                'name' => 'Adv. Mehul Bansal',
                'email' => 'mehul.bansal@legalconnect.test',
                'phone' => '+91-9000000009',
                'specializations' => ['corporate-law', 'employment-law'],
                'regions' => ['Bangalore', 'Mumbai'],
                'license_number' => 'LC-KA-2026-009',
                'bar_council_id' => 'BAR-KA-2026-009',
            ],
            [
                'name' => 'Adv. Shruti Menon',
                'email' => 'shruti.menon@legalconnect.test',
                'phone' => '+91-9000000010',
                'specializations' => ['property-law', 'family-law'],
                'regions' => ['Chennai', 'New Delhi'],
                'license_number' => 'LC-TN-2026-010',
                'bar_council_id' => 'BAR-TN-2026-010',
            ],
            [
                'name' => 'Adv. Harish Rao',
                'email' => 'harish.rao@legalconnect.test',
                'phone' => '+91-9000000011',
                'specializations' => ['property-law', 'corporate-law'],
                'regions' => ['Chennai', 'Pune'],
                'license_number' => 'LC-TN-2026-011',
                'bar_council_id' => 'BAR-TN-2026-011',
            ],
            [
                'name' => 'Adv. Ananya Kulkarni',
                'email' => 'ananya.kulkarni@legalconnect.test',
                'phone' => '+91-9000000012',
                'specializations' => ['property-law', 'consumer-protection'],
                'regions' => ['Chennai', 'Lucknow'],
                'license_number' => 'LC-TN-2026-012',
                'bar_council_id' => 'BAR-TN-2026-012',
            ],
            [
                'name' => 'Adv. Sanya Ghosh',
                'email' => 'sanya.ghosh@legalconnect.test',
                'phone' => '+91-9000000013',
                'specializations' => ['intellectual-property', 'corporate-law'],
                'regions' => ['Kolkata', 'Bangalore'],
                'license_number' => 'LC-WB-2026-013',
                'bar_council_id' => 'BAR-WB-2026-013',
            ],
            [
                'name' => 'Adv. Devendra Chatterjee',
                'email' => 'devendra.chatterjee@legalconnect.test',
                'phone' => '+91-9000000014',
                'specializations' => ['intellectual-property', 'employment-law'],
                'regions' => ['Kolkata', 'Hyderabad'],
                'license_number' => 'LC-WB-2026-014',
                'bar_council_id' => 'BAR-WB-2026-014',
            ],
            [
                'name' => 'Adv. Ishita Banerjee',
                'email' => 'ishita.banerjee@legalconnect.test',
                'phone' => '+91-9000000015',
                'specializations' => ['intellectual-property', 'family-law'],
                'regions' => ['Kolkata', 'New Delhi'],
                'license_number' => 'LC-WB-2026-015',
                'bar_council_id' => 'BAR-WB-2026-015',
            ],
            [
                'name' => 'Adv. Sameer Ahmed',
                'email' => 'sameer.ahmed@legalconnect.test',
                'phone' => '+91-9000000016',
                'specializations' => ['employment-law', 'corporate-law'],
                'regions' => ['Hyderabad', 'Mumbai'],
                'license_number' => 'LC-TG-2026-016',
                'bar_council_id' => 'BAR-TG-2026-016',
            ],
            [
                'name' => 'Adv. Tanya Verma',
                'email' => 'tanya.verma@legalconnect.test',
                'phone' => '+91-9000000017',
                'specializations' => ['employment-law', 'consumer-protection'],
                'regions' => ['Hyderabad', 'Jaipur'],
                'license_number' => 'LC-TG-2026-017',
                'bar_council_id' => 'BAR-TG-2026-017',
            ],
            [
                'name' => 'Adv. Nilesh Reddy',
                'email' => 'nilesh.reddy@legalconnect.test',
                'phone' => '+91-9000000018',
                'specializations' => ['employment-law', 'property-law'],
                'regions' => ['Hyderabad', 'Chennai'],
                'license_number' => 'LC-TG-2026-018',
                'bar_council_id' => 'BAR-TG-2026-018',
            ],
            [
                'name' => 'Adv. Ritu Shah',
                'email' => 'ritu.shah@legalconnect.test',
                'phone' => '+91-9000000019',
                'specializations' => ['tax-law', 'corporate-law'],
                'regions' => ['Pune', 'Ahmedabad'],
                'license_number' => 'LC-MH-2026-019',
                'bar_council_id' => 'BAR-MH-2026-019',
            ],
            [
                'name' => 'Adv. Karan Malhotra',
                'email' => 'karan.malhotra@legalconnect.test',
                'phone' => '+91-9000000020',
                'specializations' => ['tax-law', 'property-law'],
                'regions' => ['Pune', 'Lucknow'],
                'license_number' => 'LC-MH-2026-020',
                'bar_council_id' => 'BAR-MH-2026-020',
            ],
            [
                'name' => 'Adv. Pooja Desai',
                'email' => 'pooja.desai@legalconnect.test',
                'phone' => '+91-9000000021',
                'specializations' => ['tax-law', 'consumer-protection'],
                'regions' => ['Pune', 'New Delhi'],
                'license_number' => 'LC-MH-2026-021',
                'bar_council_id' => 'BAR-MH-2026-021',
            ],
            [
                'name' => 'Adv. Farhan Patel',
                'email' => 'farhan.patel@legalconnect.test',
                'phone' => '+91-9000000022',
                'specializations' => ['immigration-law', 'family-law'],
                'regions' => ['Ahmedabad', 'New Delhi'],
                'license_number' => 'LC-GJ-2026-022',
                'bar_council_id' => 'BAR-GJ-2026-022',
            ],
            [
                'name' => 'Adv. Neha Sood',
                'email' => 'neha.sood@legalconnect.test',
                'phone' => '+91-9000000023',
                'specializations' => ['immigration-law', 'corporate-law'],
                'regions' => ['Ahmedabad', 'Bangalore'],
                'license_number' => 'LC-GJ-2026-023',
                'bar_council_id' => 'BAR-GJ-2026-023',
            ],
            [
                'name' => 'Adv. Imran Shaikh',
                'email' => 'imran.shaikh@legalconnect.test',
                'phone' => '+91-9000000024',
                'specializations' => ['immigration-law', 'consumer-protection'],
                'regions' => ['Ahmedabad', 'Mumbai'],
                'license_number' => 'LC-GJ-2026-024',
                'bar_council_id' => 'BAR-GJ-2026-024',
            ],
            [
                'name' => 'Adv. Meera Joshi',
                'email' => 'meera.joshi@legalconnect.test',
                'phone' => '+91-9000000025',
                'specializations' => ['environmental-law', 'property-law'],
                'regions' => ['Jaipur', 'Chennai'],
                'license_number' => 'LC-RJ-2026-025',
                'bar_council_id' => 'BAR-RJ-2026-025',
            ],
            [
                'name' => 'Adv. Aditya Bhat',
                'email' => 'aditya.bhat@legalconnect.test',
                'phone' => '+91-9000000026',
                'specializations' => ['environmental-law', 'tax-law'],
                'regions' => ['Jaipur', 'Pune'],
                'license_number' => 'LC-RJ-2026-026',
                'bar_council_id' => 'BAR-RJ-2026-026',
            ],
            [
                'name' => 'Adv. Shilpa Jain',
                'email' => 'shilpa.jain@legalconnect.test',
                'phone' => '+91-9000000027',
                'specializations' => ['environmental-law', 'consumer-protection'],
                'regions' => ['Jaipur', 'Lucknow'],
                'license_number' => 'LC-RJ-2026-027',
                'bar_council_id' => 'BAR-RJ-2026-027',
            ],
            [
                'name' => 'Adv. Rohit Kapoor',
                'email' => 'rohit.kapoor@legalconnect.test',
                'phone' => '+91-9000000028',
                'specializations' => ['consumer-protection', 'criminal-law'],
                'regions' => ['Lucknow', 'Mumbai'],
                'license_number' => 'LC-UP-2026-028',
                'bar_council_id' => 'BAR-UP-2026-028',
            ],
            [
                'name' => 'Adv. Fatima Ansari',
                'email' => 'fatima.ansari@legalconnect.test',
                'phone' => '+91-9000000029',
                'specializations' => ['consumer-protection', 'family-law'],
                'regions' => ['Lucknow', 'New Delhi'],
                'license_number' => 'LC-UP-2026-029',
                'bar_council_id' => 'BAR-UP-2026-029',
            ],
            [
                'name' => 'Adv. Shivam Trivedi',
                'email' => 'shivam.trivedi@legalconnect.test',
                'phone' => '+91-9000000030',
                'specializations' => ['consumer-protection', 'employment-law'],
                'regions' => ['Lucknow', 'Hyderabad'],
                'license_number' => 'LC-UP-2026-030',
                'bar_council_id' => 'BAR-UP-2026-030',
            ],
        ];

        $lawyers = $this->ensureSpecializationRegionCoverage(
            $lawyers,
            $specializations->keys()->values()->all(),
            $regions->keys()->values()->all(),
            2,
            6,
            7
        );

        $documentAssignments = $this->prepareDocumentAssignments($lawyers, $documentTypes);

        foreach ($lawyers as $lawyer) {
            DB::transaction(function () use ($lawyer, $specializations, $regions, $documentTypes, $documentAssignments): void {
                $specializationIds = [];
                foreach ($lawyer['specializations'] as $specializationSlug) {
                    $specializationId = $specializations->get($specializationSlug);

                    if (! $specializationId) {
                        throw new \RuntimeException("Missing specialization slug: {$specializationSlug}");
                    }

                    $specializationIds[] = $specializationId;
                }

                $regionIds = [];
                foreach ($lawyer['regions'] as $city) {
                    $regionId = $regions->get($city);

                    if (! $regionId) {
                        throw new \RuntimeException("Missing region city: {$city}");
                    }

                    $regionIds[] = $regionId;
                }

                $yearsOfExperience = random_int(2, 25);
                $averageRating = random_int(30, 50) / 10;
                $consultationFee = $this->calculateConsultationFee($yearsOfExperience);
                $totalConsultations = random_int(max(12, $yearsOfExperience * 8), max(24, $yearsOfExperience * 35));

                $user = User::updateOrCreate(
                    ['email' => $lawyer['email']],
                    [
                        'name' => $lawyer['name'],
                        'password' => Hash::make('Pass@123'),
                        'phone' => $lawyer['phone'],
                        'role' => 'lawyer',
                        'is_verified_by_admin' => true,
                    ]
                );

                $profile = LawyerProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'license_number' => $lawyer['license_number'],
                        'bar_council_id' => $lawyer['bar_council_id'],
                        'years_of_experience' => $yearsOfExperience,
                        'bio' => $this->buildBio($lawyer['name'], $lawyer['specializations'], $lawyer['regions']),
                        'consultation_fee' => $consultationFee,
                        'is_available' => true,
                        'average_rating' => $averageRating,
                        'total_consultations' => $totalConsultations,
                    ]
                );

                $profile->specializations()->sync($specializationIds);
                $profile->regions()->sync($regionIds);
                $profile->documentTypes()->sync(
                    $this->buildDocumentPayloadFromSlugs($documentAssignments[$lawyer['email']] ?? [], $documentTypes)
                );
            });
        }
    }

    private function buildBio(string $name, array $specializationSlugs, array $regions): string
    {
        $specializationNames = [
            'family-law' => 'Family Law',
            'criminal-law' => 'Criminal Law',
            'corporate-law' => 'Corporate Law',
            'property-law' => 'Property Law',
            'intellectual-property' => 'Intellectual Property',
            'employment-law' => 'Employment Law',
            'tax-law' => 'Tax Law',
            'immigration-law' => 'Immigration Law',
            'environmental-law' => 'Environmental Law',
            'consumer-protection' => 'Consumer Protection',
        ];

        $readableSpecializations = array_map(
            static fn (string $slug): string => $specializationNames[$slug] ?? str_replace('-', ' ', $slug),
            $specializationSlugs
        );

        $specializationText = implode(' and ', array_slice($readableSpecializations, 0, 2));
        $regionText = implode(' and ', $regions);

        return sprintf(
            '%s is a practising advocate focused on %s matters across %s. Handles consultations, drafting, and court appearances for individuals, businesses, and families.',
            $name,
            $specializationText,
            $regionText
        );
    }

    private function getDocumentRelevanceMap(): array
    {
        return [
            'family-law' => [
                'divorce-petition',
                'mutual-divorce',
                'maintenance-application',
                'will-testament',
                'codicil',
                'affidavit-general',
                'affidavit-name-change',
            ],
            'property-law' => [
                'sale-deed',
                'gift-deed',
                'relinquishment-deed',
                'rent-agreement',
                'lease-deed',
                'legal-notice-eviction',
                'poa-general',
                'poa-special',
                'affidavit-general',
            ],
            'corporate-law' => [
                'nda',
                'partnership-deed',
                'promissory-note',
                'cheque-bounce-complaint',
                'poa-general',
                'poa-special',
                'affidavit-general',
            ],
            'criminal-law' => [
                'bail-application',
                'affidavit-general',
                'cheque-bounce-complaint',
                'legal-notice-eviction',
            ],
            'intellectual-property' => [
                'nda',
                'poa-special',
                'affidavit-general',
                'consumer-complaint',
            ],
            'employment-law' => [
                'nda',
                'consumer-complaint',
                'poa-general',
                'affidavit-general',
                'promissory-note',
            ],
            'tax-law' => [
                'promissory-note',
                'affidavit-general',
                'rti-application',
                'consumer-complaint',
            ],
            'immigration-law' => [
                'affidavit-general',
                'poa-special',
                'rti-application',
                'nda',
                'consumer-complaint',
            ],
            'environmental-law' => [
                'rti-application',
                'consumer-complaint',
                'affidavit-general',
                'legal-notice-eviction',
            ],
            'consumer-protection' => [
                'consumer-complaint',
                'legal-notice-eviction',
                'rti-application',
                'affidavit-general',
                'nda',
            ],
        ];
    }

    private function prepareDocumentAssignments(array $lawyers, $documentTypes): array
    {
        $relevanceMap = $this->getDocumentRelevanceMap();
        $allDocumentSlugs = $documentTypes->keys()->values()->all();

        $assignments = [];
        $covered = [];

        foreach ($lawyers as $lawyer) {
            $selected = [];

            // Keep each lawyer's document service list focused instead of attaching every possible document.
            foreach ($lawyer['specializations'] as $specializationSlug) {
                foreach ($relevanceMap[$specializationSlug] ?? [] as $slug) {
                    if (! in_array($slug, $selected, true)) {
                        $selected[] = $slug;
                    }

                    if (count($selected) >= 6) {
                        break 2;
                    }
                }
            }

            if (! in_array('affidavit-general', $selected, true)) {
                $selected[] = 'affidavit-general';
            }

            $selected = array_values(array_unique($selected));
            $assignments[$lawyer['email']] = $selected;

            foreach ($selected as $slug) {
                $covered[$slug] = true;
            }
        }

        $missingSlugs = array_values(array_diff($allDocumentSlugs, array_keys($covered)));
        $emails = array_values(array_column($lawyers, 'email'));

        foreach ($missingSlugs as $idx => $missingSlug) {
            $email = $emails[$idx % count($emails)];

            if (! in_array($missingSlug, $assignments[$email], true)) {
                $assignments[$email][] = $missingSlug;
            }
        }

        return $assignments;
    }

    private function ensureSpecializationRegionCoverage(
        array $lawyers,
        array $specializationSlugs,
        array $regionCities,
        int $minimumCoverage,
        int $maxSpecializationsPerLawyer,
        int $maxRegionsPerLawyer
    ): array {
        foreach ($specializationSlugs as $specializationSlug) {
            foreach ($regionCities as $regionCity) {
                while ($this->combinationCoverageCount($lawyers, $specializationSlug, $regionCity) < $minimumCoverage) {
                    $candidateIndex = $this->findCoverageCandidate(
                        $lawyers,
                        $specializationSlug,
                        $regionCity,
                        $maxSpecializationsPerLawyer,
                        $maxRegionsPerLawyer
                    );

                    // Safety fallback so coverage can still be guaranteed even if soft caps are exhausted.
                    if ($candidateIndex === null) {
                        $candidateIndex = $this->findCoverageCandidate(
                            $lawyers,
                            $specializationSlug,
                            $regionCity,
                            20,
                            20
                        );
                    }

                    if ($candidateIndex === null) {
                        break;
                    }

                    if (! in_array($specializationSlug, $lawyers[$candidateIndex]['specializations'], true)) {
                        $lawyers[$candidateIndex]['specializations'][] = $specializationSlug;
                    }

                    if (! in_array($regionCity, $lawyers[$candidateIndex]['regions'], true)) {
                        $lawyers[$candidateIndex]['regions'][] = $regionCity;
                    }

                    $lawyers[$candidateIndex]['specializations'] = array_values(array_unique($lawyers[$candidateIndex]['specializations']));
                    $lawyers[$candidateIndex]['regions'] = array_values(array_unique($lawyers[$candidateIndex]['regions']));
                }
            }
        }

        return $lawyers;
    }

    private function combinationCoverageCount(array $lawyers, string $specializationSlug, string $regionCity): int
    {
        $count = 0;

        foreach ($lawyers as $lawyer) {
            if (
                in_array($specializationSlug, $lawyer['specializations'], true)
                && in_array($regionCity, $lawyer['regions'], true)
            ) {
                $count++;
            }
        }

        return $count;
    }

    private function findCoverageCandidate(
        array $lawyers,
        string $specializationSlug,
        string $regionCity,
        int $maxSpecializationsPerLawyer,
        int $maxRegionsPerLawyer
    ): ?int {
        $bestIndex = null;
        $bestScore = PHP_INT_MAX;

        foreach ($lawyers as $index => $lawyer) {
            $hasSpecialization = in_array($specializationSlug, $lawyer['specializations'], true);
            $hasRegion = in_array($regionCity, $lawyer['regions'], true);

            if ($hasSpecialization && $hasRegion) {
                continue;
            }

            $canAddSpecialization = $hasSpecialization || count($lawyer['specializations']) < $maxSpecializationsPerLawyer;
            $canAddRegion = $hasRegion || count($lawyer['regions']) < $maxRegionsPerLawyer;

            if (! $canAddSpecialization || ! $canAddRegion) {
                continue;
            }

            $score = (count($lawyer['specializations']) * 10)
                + (count($lawyer['regions']) * 8)
                + ($hasSpecialization ? 0 : 5)
                + ($hasRegion ? 0 : 5);

            if ($score < $bestScore) {
                $bestScore = $score;
                $bestIndex = $index;
            }
        }

        return $bestIndex;
    }

    private function buildDocumentPayloadFromSlugs(array $documentSlugs, $documentTypes): array
    {
        $documentSlugs = array_values(array_unique($documentSlugs));

        if (empty($documentSlugs)) {
            $documentSlugs = ['affidavit-general'];
        }

        $payload = [];
        foreach ($documentSlugs as $documentSlug) {
            $documentType = $documentTypes->get($documentSlug);

            if (! $documentType) {
                throw new \RuntimeException("Missing document type slug: {$documentSlug}");
            }

            $payload[$documentType->id] = [
                'custom_price' => $this->calculateCustomPrice((float) $documentType->base_price),
            ];
        }

        return $payload;
    }

    private function calculateConsultationFee(int $yearsOfExperience): int
    {
        return match (true) {
            $yearsOfExperience <= 5 => random_int(1000, 5000),
            $yearsOfExperience <= 10 => random_int(4000, 9000),
            $yearsOfExperience <= 15 => random_int(8000, 15000),
            default => random_int(12000, 30000),
        };
    }

    private function calculateCustomPrice(float $basePrice): float
    {
        $customPrice = ($basePrice * random_int(120, 180) / 100) + random_int(250, 3500);

        return round(max(1000, min(30000, $customPrice)), 2);
    }
}