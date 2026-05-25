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

class AddFakeLawyersSeeder extends Seeder
{
    public function run(): void
    {
        $specializations = Specialization::query()->pluck('id', 'slug');
        $regions = Region::query()->pluck('id', 'city');
        $documentTypes = DocumentType::query()->get()->keyBy('slug');

        if ($specializations->isEmpty() || $regions->isEmpty() || $documentTypes->isEmpty()) {
            throw new \RuntimeException('Seed specializations, regions, and document types before running AddFakeLawyersSeeder.');
        }

        $lawyers = [
            ['name' => 'Adv. Aditi Malhotra', 'email' => 'aditi.malhotra@legalconnect.test', 'phone' => '+91-9000000031', 'specializations' => ['family-law', 'consumer-protection'], 'regions' => ['New Delhi', 'Jaipur']],
            ['name' => 'Adv. Saurabh Mehta', 'email' => 'saurabh.mehta@legalconnect.test', 'phone' => '+91-9000000032', 'specializations' => ['criminal-law', 'property-law'], 'regions' => ['Mumbai', 'Pune']],
            ['name' => 'Adv. Nisha Iyer', 'email' => 'nisha.iyer@legalconnect.test', 'phone' => '+91-9000000033', 'specializations' => ['corporate-law', 'tax-law'], 'regions' => ['Bangalore', 'Hyderabad']],
            ['name' => 'Adv. Farhan Qureshi', 'email' => 'farhan.qureshi@legalconnect.test', 'phone' => '+91-9000000034', 'specializations' => ['property-law', 'family-law'], 'regions' => ['Chennai', 'New Delhi']],
            ['name' => 'Adv. Rhea Kapoor', 'email' => 'rhea.kapoor@legalconnect.test', 'phone' => '+91-9000000035', 'specializations' => ['intellectual-property', 'corporate-law'], 'regions' => ['Kolkata', 'Bangalore']],
            ['name' => 'Adv. Varun Sethi', 'email' => 'varun.sethi@legalconnect.test', 'phone' => '+91-9000000036', 'specializations' => ['employment-law', 'consumer-protection'], 'regions' => ['Hyderabad', 'Pune']],
            ['name' => 'Adv. Megha Arora', 'email' => 'megha.arora@legalconnect.test', 'phone' => '+91-9000000037', 'specializations' => ['tax-law', 'property-law'], 'regions' => ['Ahmedabad', 'Jaipur']],
            ['name' => 'Adv. Imran Siddiqui', 'email' => 'imran.siddiqui@legalconnect.test', 'phone' => '+91-9000000038', 'specializations' => ['immigration-law', 'family-law'], 'regions' => ['Lucknow', 'New Delhi']],
            ['name' => 'Adv. Pooja Bansal', 'email' => 'pooja.bansal@legalconnect.test', 'phone' => '+91-9000000039', 'specializations' => ['environmental-law', 'property-law'], 'regions' => ['Jaipur', 'Chennai']],
            ['name' => 'Adv. Kunal Rao', 'email' => 'kunal.rao@legalconnect.test', 'phone' => '+91-9000000040', 'specializations' => ['consumer-protection', 'criminal-law'], 'regions' => ['Mumbai', 'Lucknow']],
            ['name' => 'Adv. Shraddha Menon', 'email' => 'shraddha.menon@legalconnect.test', 'phone' => '+91-9000000041', 'specializations' => ['family-law', 'property-law'], 'regions' => ['Chennai', 'Pune']],
            ['name' => 'Adv. Dev Malik', 'email' => 'dev.malik@legalconnect.test', 'phone' => '+91-9000000042', 'specializations' => ['corporate-law', 'employment-law'], 'regions' => ['Bangalore', 'Mumbai']],
            ['name' => 'Adv. Tanya Jain', 'email' => 'tanya.jain@legalconnect.test', 'phone' => '+91-9000000043', 'specializations' => ['tax-law', 'consumer-protection'], 'regions' => ['Ahmedabad', 'New Delhi']],
            ['name' => 'Adv. Arjun Deshpande', 'email' => 'arjun.deshpande@legalconnect.test', 'phone' => '+91-9000000044', 'specializations' => ['criminal-law', 'family-law'], 'regions' => ['Pune', 'Hyderabad']],
            ['name' => 'Adv. Neha Kapoor', 'email' => 'neha.kapoor@legalconnect.test', 'phone' => '+91-9000000045', 'specializations' => ['intellectual-property', 'environmental-law'], 'regions' => ['Kolkata', 'Jaipur']],
            ['name' => 'Adv. Roshan Ali', 'email' => 'roshan.ali@legalconnect.test', 'phone' => '+91-9000000046', 'specializations' => ['employment-law', 'property-law'], 'regions' => ['Lucknow', 'Chennai']],
            ['name' => 'Adv. Meera Shah', 'email' => 'meera.shah@legalconnect.test', 'phone' => '+91-9000000047', 'specializations' => ['corporate-law', 'consumer-protection'], 'regions' => ['Mumbai', 'Ahmedabad']],
            ['name' => 'Adv. Vikram Bhatia', 'email' => 'vikram.bhatia@legalconnect.test', 'phone' => '+91-9000000048', 'specializations' => ['property-law', 'tax-law'], 'regions' => ['New Delhi', 'Pune']],
            ['name' => 'Adv. Shalini Ghosh', 'email' => 'shalini.ghosh@legalconnect.test', 'phone' => '+91-9000000049', 'specializations' => ['family-law', 'immigration-law'], 'regions' => ['Kolkata', 'Mumbai']],
            ['name' => 'Adv. Harsh Trivedi', 'email' => 'harsh.trivedi@legalconnect.test', 'phone' => '+91-9000000050', 'specializations' => ['environmental-law', 'consumer-protection'], 'regions' => ['Jaipur', 'Ahmedabad']],
            ['name' => 'Adv. Simran Kaur', 'email' => 'simran.kaur@legalconnect.test', 'phone' => '+91-9000000051', 'specializations' => ['criminal-law', 'employment-law'], 'regions' => ['Hyderabad', 'New Delhi']],
            ['name' => 'Adv. Adnan Khan', 'email' => 'adnan.khan@legalconnect.test', 'phone' => '+91-9000000052', 'specializations' => ['corporate-law', 'tax-law'], 'regions' => ['Bangalore', 'Pune']],
            ['name' => 'Adv. Isha Verma', 'email' => 'isha.verma@legalconnect.test', 'phone' => '+91-9000000053', 'specializations' => ['property-law', 'family-law'], 'regions' => ['Chennai', 'Lucknow']],
            ['name' => 'Adv. Pranav Joshi', 'email' => 'pranav.joshi@legalconnect.test', 'phone' => '+91-9000000054', 'specializations' => ['consumer-protection', 'immigration-law'], 'regions' => ['Mumbai', 'New Delhi']],
            ['name' => 'Adv. Nandita Rao', 'email' => 'nandita.rao@legalconnect.test', 'phone' => '+91-9000000055', 'specializations' => ['tax-law', 'environmental-law'], 'regions' => ['Ahmedabad', 'Kolkata']],
            ['name' => 'Adv. Mohit Ahuja', 'email' => 'mohit.ahuja@legalconnect.test', 'phone' => '+91-9000000056', 'specializations' => ['employment-law', 'corporate-law'], 'regions' => ['Hyderabad', 'Bangalore']],
            ['name' => 'Adv. Sana Mirza', 'email' => 'sana.mirza@legalconnect.test', 'phone' => '+91-9000000057', 'specializations' => ['family-law', 'consumer-protection'], 'regions' => ['Lucknow', 'Jaipur']],
            ['name' => 'Adv. Rahul Khanna', 'email' => 'rahul.khanna@legalconnect.test', 'phone' => '+91-9000000058', 'specializations' => ['criminal-law', 'property-law'], 'regions' => ['Pune', 'Chennai']],
            ['name' => 'Adv. Anika Dutta', 'email' => 'anika.dutta@legalconnect.test', 'phone' => '+91-9000000059', 'specializations' => ['intellectual-property', 'employment-law'], 'regions' => ['Kolkata', 'Mumbai']],
            ['name' => 'Adv. Zoya Ahmed', 'email' => 'zoya.ahmed@legalconnect.test', 'phone' => '+91-9000000060', 'specializations' => ['environmental-law', 'tax-law'], 'regions' => ['New Delhi', 'Ahmedabad']],
        ];

        $designations = [
            'partner',
            'managing associate',
            'special counsel',
            'equity partner',
            'senior partner',
        ];

        $lawyers = $this->applyStructuredDetails($lawyers, $specializations->keys()->values()->all(), $regions->keys()->values()->all());
        $documentAssignments = $this->prepareDocumentAssignments($lawyers, $documentTypes);

        foreach ($lawyers as $index => $lawyer) {
            DB::transaction(function () use ($index, $lawyer, $specializations, $regions, $documentTypes, $documentAssignments, $designations): void {
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

                $designation = $designations[random_int(0, count($designations) - 1)];
                $isAvailable = ! in_array($index, [4, 10, 17, 23, 29], true);
                $yearsOfExperience = random_int(3, 24);
                $averageRating = random_int(32, 50) / 10;
                $consultationFee = $this->calculateConsultationFee($yearsOfExperience);
                $totalConsultations = random_int(max(18, $yearsOfExperience * 7), max(40, $yearsOfExperience * 32));

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
                        'designation' => $designation,
                        'bio' => $this->buildBio($lawyer['name'], $lawyer['specializations'], $lawyer['regions']),
                        'educational_qualifications' => $lawyer['educational_qualifications'],
                        'admissions_awards' => $lawyer['admissions_awards'],
                        'cities' => $lawyer['cities'],
                        'core_competencies' => $lawyer['core_competencies'],
                        'document_expertise' => $lawyer['document_expertise'],
                        'consultation_fee' => $consultationFee,
                        'consultation_fee_60' => round($consultationFee * 1.5, 2),
                        'consultation_fee_90' => round($consultationFee * 2.1, 2),
                        'is_available' => $isAvailable,
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

    private function applyStructuredDetails(array $lawyers, array $specializationSlugs, array $regionCities): array
    {
        $specializationLabels = [
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

        foreach ($lawyers as $index => $lawyer) {
            $lawyers[$index]['license_number'] = sprintf('LC-FF-2026-%03d', $index + 31);
            $lawyers[$index]['bar_council_id'] = sprintf('BAR-FF-2026-%03d', $index + 31);
            $lawyers[$index]['educational_qualifications'] = [
                [
                    'degree' => 'B.A. LL.B.',
                    'university' => $this->pickUniversity($index),
                ],
                [
                    'degree' => 'LL.M.',
                    'university' => $this->pickPostgradUniversity($index),
                ],
            ];
            $lawyers[$index]['admissions_awards'] = [
                'Enrolled with the ' . $this->pickBarCouncil($index),
                'Recognized for client-focused litigation and drafting',
            ];
            $lawyers[$index]['cities'] = $lawyer['regions'];
            $lawyers[$index]['core_competencies'] = array_values(array_map(
                static fn (string $slug): string => $specializationLabels[$slug] ?? str_replace('-', ' ', $slug),
                $lawyer['specializations']
            ));
            $lawyers[$index]['document_expertise'] = $this->buildDocumentExpertise(
                $lawyer['specializations'],
                $index
            );
            $lawyers[$index]['specializations'] = array_values(array_filter(
                $lawyer['specializations'],
                static fn (string $slug) => in_array($slug, $specializationSlugs, true)
            ));
            $lawyers[$index]['regions'] = array_values(array_filter(
                $lawyer['regions'],
                static fn (string $city) => in_array($city, $regionCities, true)
            ));
        }

        return $lawyers;
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
            '%s handles %s matters across %s with a strong focus on drafting, disputes, advisory work, and practical client guidance.',
            $name,
            $specializationText,
            $regionText
        );
    }

    private function getDocumentRelevanceMap(): array
    {
        return [
            'family-law' => ['divorce-petition', 'mutual-divorce', 'maintenance-application', 'will-testament', 'codicil', 'affidavit-general', 'affidavit-name-change'],
            'property-law' => ['sale-deed', 'gift-deed', 'relinquishment-deed', 'rent-agreement', 'lease-deed', 'legal-notice-eviction', 'poa-general', 'poa-special', 'affidavit-general'],
            'corporate-law' => ['nda', 'partnership-deed', 'promissory-note', 'cheque-bounce-complaint', 'poa-general', 'poa-special', 'affidavit-general'],
            'criminal-law' => ['bail-application', 'affidavit-general', 'cheque-bounce-complaint', 'legal-notice-eviction'],
            'intellectual-property' => ['nda', 'poa-special', 'affidavit-general', 'consumer-complaint'],
            'employment-law' => ['nda', 'consumer-complaint', 'poa-general', 'affidavit-general', 'promissory-note'],
            'tax-law' => ['promissory-note', 'affidavit-general', 'rti-application', 'consumer-complaint'],
            'immigration-law' => ['affidavit-general', 'poa-special', 'rti-application', 'nda', 'consumer-complaint'],
            'environmental-law' => ['rti-application', 'consumer-complaint', 'affidavit-general', 'legal-notice-eviction'],
            'consumer-protection' => ['consumer-complaint', 'legal-notice-eviction', 'rti-application', 'affidavit-general', 'nda'],
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

        foreach ($missingSlugs as $index => $slug) {
            $lawyer = $lawyers[$index % count($lawyers)];
            if (! in_array($slug, $assignments[$lawyer['email']], true)) {
                $assignments[$lawyer['email']][] = $slug;
            }
        }

        return $assignments;
    }

    private function buildDocumentPayloadFromSlugs(array $slugs, $documentTypes): array
    {
        $payload = [];

        foreach ($slugs as $slug) {
            $documentType = $documentTypes->get($slug);

            if (! $documentType) {
                continue;
            }

            $payload[$documentType->id] = [
                'custom_price' => $documentType->base_price,
            ];
        }

        return $payload;
    }

    private function buildDocumentExpertise(array $specializationSlugs, int $seedIndex): array
    {
        $relevanceMap = $this->getDocumentRelevanceMap();
        $documentLookup = [];

        foreach ($relevanceMap as $specializationSlug => $documentSlugs) {
            $documentLookup[$specializationSlug] = $documentSlugs;
        }

        $selected = [];

        foreach ($specializationSlugs as $specializationSlug) {
            foreach ($documentLookup[$specializationSlug] ?? [] as $documentSlug) {
                if (! in_array($documentSlug, $selected, true)) {
                    $selected[] = $documentSlug;
                }

                if (count($selected) >= 4) {
                    break 2;
                }
            }
        }

        $documentNames = [
            'divorce-petition' => 'Divorce Petition',
            'mutual-divorce' => 'Mutual Divorce Petition',
            'maintenance-application' => 'Maintenance Application',
            'sale-deed' => 'Sale Deed',
            'gift-deed' => 'Gift Deed',
            'relinquishment-deed' => 'Relinquishment Deed',
            'rent-agreement' => 'Rent Agreement',
            'lease-deed' => 'Lease Deed',
            'nda' => 'Non-Disclosure Agreement',
            'partnership-deed' => 'Partnership Deed',
            'promissory-note' => 'Promissory Note',
            'cheque-bounce-complaint' => 'Cheque Bounce Complaint',
            'bail-application' => 'Bail Application',
            'poa-general' => 'General Power of Attorney',
            'poa-special' => 'Special Power of Attorney',
            'rti-application' => 'RTI Application',
            'consumer-complaint' => 'Consumer Complaint',
            'legal-notice-eviction' => 'Legal Notice for Eviction',
            'affidavit-general' => 'General Affidavit',
            'affidavit-name-change' => 'Name Change Affidavit',
        ];

        $fees = [1800, 2200, 2500, 2800, 3000, 3200, 3500, 4000];

        return array_values(array_map(
            static function (string $slug) use ($documentNames, $fees, $seedIndex): array {
                $fee = $fees[($seedIndex + strlen($slug)) % count($fees)];

                return [
                    'name' => $documentNames[$slug] ?? str_replace('-', ' ', $slug),
                    'fee' => $fee,
                ];
            },
            $selected
        ));
    }

    private function calculateConsultationFee(int $yearsOfExperience): float
    {
        return match (true) {
            $yearsOfExperience >= 20 => 5200.00,
            $yearsOfExperience >= 15 => 4200.00,
            $yearsOfExperience >= 10 => 3200.00,
            $yearsOfExperience >= 5 => 2400.00,
            default => 1800.00,
        };
    }

    private function pickUniversity(int $index): string
    {
        $universities = [
            'National Law School of India University',
            'Faculty of Law, University of Delhi',
            'Symbiosis Law School, Pune',
            'Gujarat National Law University',
            'West Bengal National University of Juridical Sciences',
            'NALSAR University of Law',
        ];

        return $universities[$index % count($universities)];
    }

    private function pickPostgradUniversity(int $index): string
    {
        $universities = [
            'Indian Law Institute',
            'National Law University, Delhi',
            'Jindal Global Law School',
            'Rajiv Gandhi School of Intellectual Property Law',
            'The Tamil Nadu Dr. Ambedkar Law University',
        ];

        return $universities[$index % count($universities)];
    }

    private function pickBarCouncil(int $index): string
    {
        $councils = [
            'Delhi Bar Council',
            'Maharashtra Bar Council',
            'Karnataka Bar Council',
            'Tamil Nadu Bar Council',
            'West Bengal Bar Council',
            'Telangana Bar Council',
            'Gujarat Bar Council',
            'Rajasthan Bar Council',
            'Uttar Pradesh Bar Council',
        ];

        return $councils[$index % count($councils)];
    }
}