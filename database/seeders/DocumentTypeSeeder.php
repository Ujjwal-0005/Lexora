<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    private function getAshokaEmblem()
    {
        // Base64 encoded Ashoka Emblem SVG (simplified lion version)
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQo8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjg0ZjVlIiBzdHJva2Utd2lkdGg9IjEiLz4NCjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ1IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzI4NGY1ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+4oquPC90ZXh0Pg0KPC9zdmc+';
    }

    public function run(): void
    {
        $ashokaEmblem = $this->getAshokaEmblem();

        $documentTypes = [
            [
                "name" => "Divorce Petition (Section 13, Hindu Marriage Act)",
                "slug" => "divorce-petition",
                "description" => "A contested divorce petition filed under Section 13 of the Hindu Marriage Act, 1955 on grounds of adultery, cruelty, abandonment, etc.",
                "base_price" => 5500.00,
                "icon" => "gavel",
                "field_definitions" => [
                    ["name" => "petitioner_name", "label" => "Petitioner Full Name", "type" => "text", "required" => true],
                    ["name" => "petitioner_age", "label" => "Petitioner Age", "type" => "number", "required" => true],
                    ["name" => "petitioner_address", "label" => "Petitioner Address", "type" => "textarea", "required" => true],
                    ["name" => "respondent_name", "label" => "Respondent Full Name", "type" => "text", "required" => true],
                    ["name" => "respondent_age", "label" => "Respondent Age", "type" => "number", "required" => true],
                    ["name" => "respondent_address", "label" => "Respondent Address", "type" => "textarea", "required" => true],
                    ["name" => "marriage_date", "label" => "Date of Marriage", "type" => "date", "required" => true],
                    ["name" => "marriage_location", "label" => "Place of Marriage", "type" => "text", "required" => true],
                    ["name" => "separation_date", "label" => "Date of Separation", "type" => "date", "required" => true],
                    ["name" => "grounds_for_divorce", "label" => "Grounds for Divorce", "type" => "textarea", "required" => true],
                    ["name" => "state", "label" => "State/Court Jurisdiction", "type" => "text", "required" => true],
                ],
                "base_template" => $this->getDivorcePetitionTemplate($ashokaEmblem),
            ],
            [
                "name" => "Mutual Consent Divorce Petition",
                "slug" => "mutual-divorce",
                "description" => "Petition for divorce by mutual consent under Section 13B of the Hindu Marriage Act, 1955.",
                "base_price" => 4000.00,
                "icon" => "handshake",
                "field_definitions" => [
                    ["name" => "husband_name", "label" => "Husband Full Name", "type" => "text", "required" => true],
                    ["name" => "husband_age", "label" => "Husband Age", "type" => "number", "required" => true],
                    ["name" => "husband_address", "label" => "Husband Address", "type" => "textarea", "required" => true],
                    ["name" => "wife_name", "label" => "Wife Full Name", "type" => "text", "required" => true],
                    ["name" => "wife_age", "label" => "Wife Age", "type" => "number", "required" => true],
                    ["name" => "wife_address", "label" => "Wife Address", "type" => "textarea", "required" => true],
                    ["name" => "marriage_date", "label" => "Date of Marriage", "type" => "date", "required" => true],
                    ["name" => "marriage_location", "label" => "Place of Marriage", "type" => "text", "required" => true],
                    ["name" => "separation_date", "label" => "Date of Separation", "type" => "date", "required" => true],
                    ["name" => "alimony_details", "label" => "Alimony/Maintenance Settlement Details", "type" => "textarea", "required" => false],
                    ["name" => "child_custody", "label" => "Child Custody Arrangement", "type" => "textarea", "required" => false],
                    ["name" => "state", "label" => "State/Court Jurisdiction", "type" => "text", "required" => true],
                ],
                "base_template" => $this->getMutualDivorceTemplate($ashokaEmblem),
            ],
            [
                "name" => "Maintenance Application (Section 125 CrPC)",
                "slug" => "maintenance-application",
                "description" => "Application for maintenance/alimony under Section 125 of the Code of Criminal Procedure.",
                "base_price" => 3500.00,
                "icon" => "file-text",
                "field_definitions" => [
                    ["name" => "applicant_name", "label" => "Applicant Full Name", "type" => "text", "required" => true],
                    ["name" => "applicant_age", "label" => "Applicant Age", "type" => "number", "required" => true],
                    ["name" => "applicant_address", "label" => "Applicant Address", "type" => "textarea", "required" => true],
                    ["name" => "respondent_name", "label" => "Respondent Full Name", "type" => "text", "required" => true],
                    ["name" => "respondent_address", "label" => "Respondent Address", "type" => "textarea", "required" => true],
                    ["name" => "relationship", "label" => "Relationship to Respondent", "type" => "text", "required" => true],
                    ["name" => "marriage_date", "label" => "Date of Marriage/Cohabitation", "type" => "date", "required" => true],
                    ["name" => "separation_date", "label" => "Date of Separation", "type" => "date", "required" => true],
                    ["name" => "monthly_requirement", "label" => "Monthly Requirement (INR)", "type" => "number", "required" => true],
                    ["name" => "grounds", "label" => "Grounds for Maintenance", "type" => "textarea", "required" => true],
                    ["name" => "state", "label" => "State/Court Jurisdiction", "type" => "text", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("APPLICATION FOR MAINTENANCE UNDER SECTION 125 CrPC", $ashokaEmblem),
            ],
            [
                "name" => "Property Sale Deed",
                "slug" => "sale-deed",
                "description" => "Legal document transferring ownership of immovable property from seller to buyer.",
                "base_price" => 8000.00,
                "icon" => "home",
                "field_definitions" => [
                    ["name" => "seller_name", "label" => "Seller/Vendor Name", "type" => "text", "required" => true],
                    ["name" => "seller_age", "label" => "Seller Age", "type" => "number", "required" => true],
                    ["name" => "seller_address", "label" => "Seller Address", "type" => "textarea", "required" => true],
                    ["name" => "buyer_name", "label" => "Buyer/Purchaser Name", "type" => "text", "required" => true],
                    ["name" => "buyer_age", "label" => "Buyer Age", "type" => "number", "required" => true],
                    ["name" => "buyer_address", "label" => "Buyer Address", "type" => "textarea", "required" => true],
                    ["name" => "property_address", "label" => "Property Address", "type" => "textarea", "required" => true],
                    ["name" => "property_area", "label" => "Property Area (Sq. Ft./Sq. M.)", "type" => "text", "required" => true],
                    ["name" => "property_description", "label" => "Property Description", "type" => "textarea", "required" => true],
                    ["name" => "sale_consideration", "label" => "Sale Consideration (INR)", "type" => "number", "required" => true],
                    ["name" => "survey_number", "label" => "Survey/Plot Number", "type" => "text", "required" => false],
                    ["name" => "registration_office", "label" => "Registration Office", "type" => "text", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("SALE DEED", $ashokaEmblem),
            ],
            [
                "name" => "Gift Deed",
                "slug" => "gift-deed",
                "description" => "Document transferring ownership of property as a gift without consideration.",
                "base_price" => 5000.00,
                "icon" => "gift",
                "field_definitions" => [
                    ["name" => "donor_name", "label" => "Donor (Giver) Name", "type" => "text", "required" => true],
                    ["name" => "donor_age", "label" => "Donor Age", "type" => "number", "required" => true],
                    ["name" => "donor_address", "label" => "Donor Address", "type" => "textarea", "required" => true],
                    ["name" => "donee_name", "label" => "Donee (Recipient) Name", "type" => "text", "required" => true],
                    ["name" => "donee_age", "label" => "Donee Age", "type" => "number", "required" => true],
                    ["name" => "donee_address", "label" => "Donee Address", "type" => "textarea", "required" => true],
                    ["name" => "relationship", "label" => "Relationship", "type" => "text", "required" => false],
                    ["name" => "property_address", "label" => "Property Address", "type" => "textarea", "required" => true],
                    ["name" => "property_area", "label" => "Property Area (Sq. Ft./Sq. M.)", "type" => "text", "required" => true],
                    ["name" => "property_description", "label" => "Property Description", "type" => "textarea", "required" => true],
                    ["name" => "registration_office", "label" => "Registration Office", "type" => "text", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("GIFT DEED", $ashokaEmblem),
            ],
            [
                "name" => "Relinquishment Deed",
                "slug" => "relinquishment-deed",
                "description" => "Deed by which a person gives up their rights in a property in favor of another.",
                "base_price" => 4500.00,
                "icon" => "file-alt",
                "field_definitions" => [
                    ["name" => "relinquisher_name", "label" => "Relinquisher Name", "type" => "text", "required" => true],
                    ["name" => "beneficiary_name", "label" => "Beneficiary Name", "type" => "text", "required" => true],
                    ["name" => "property_address", "label" => "Property Address", "type" => "textarea", "required" => true],
                    ["name" => "registration_office", "label" => "Registration Office", "type" => "text", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("RELINQUISHMENT DEED", $ashokaEmblem),
            ],
            [
                "name" => "Will / Testament",
                "slug" => "will-testament",
                "description" => "Legal document declaring how property will be distributed after death.",
                "base_price" => 4000.00,
                "icon" => "scroll",
                "field_definitions" => [
                    ["name" => "testator_name", "label" => "Testator (Your) Full Name", "type" => "text", "required" => true],
                    ["name" => "testator_age", "label" => "Testator Age", "type" => "number", "required" => true],
                    ["name" => "testator_address", "label" => "Testator Address", "type" => "textarea", "required" => true],
                    ["name" => "testator_identification", "label" => "Identification Number (Aadhaar/PAN)", "type" => "text", "required" => false],
                    ["name" => "marital_status", "label" => "Marital Status", "type" => "text", "required" => false],
                    ["name" => "children_names", "label" => "Names of Children (if any)", "type" => "textarea", "required" => false],
                    ["name" => "executor_name", "label" => "Executor Name", "type" => "text", "required" => true],
                    ["name" => "executor_address", "label" => "Executor Address", "type" => "textarea", "required" => true],
                    ["name" => "executor_relationship", "label" => "Executor Relationship to Testator", "type" => "text", "required" => false],
                    ["name" => "property_details", "label" => "Property and Assets Details", "type" => "textarea", "required" => true],
                    ["name" => "asset_distribution", "label" => "Asset Distribution Details (Who gets what)", "type" => "textarea", "required" => true],
                    ["name" => "guardianship", "label" => "Guardianship Arrangement for Minor Children (if any)", "type" => "textarea", "required" => false],
                    ["name" => "specific_bequests", "label" => "Specific Bequests (Items/Money)", "type" => "textarea", "required" => false],
                    ["name" => "debt_and_liabilities", "label" => "Instructions for Outstanding Debts", "type" => "textarea", "required" => false],
                    ["name" => "alternate_executor", "label" => "Alternate Executor Name (if Executor unable)", "type" => "text", "required" => false],
                ],
                "base_template" => $this->getBasicTemplate("LAST WILL AND TESTAMENT", $ashokaEmblem),
            ],
            [
                "name" => "Codicil to Will",
                "slug" => "codicil",
                "description" => "Document that modifies or supplements the provisions of an existing will.",
                "base_price" => 2500.00,
                "icon" => "file-alt",
                "field_definitions" => [
                    ["name" => "testator_name", "label" => "Testator Full Name", "type" => "text", "required" => true],
                    ["name" => "will_date", "label" => "Date of Original Will", "type" => "date", "required" => true],
                    ["name" => "modifications", "label" => "Modifications/Changes", "type" => "textarea", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("CODICIL TO WILL", $ashokaEmblem),
            ],
            [
                "name" => "11-Month Rent Agreement",
                "slug" => "rent-agreement",
                "description" => "Rental agreement between landlord and tenant for 11 months.",
                "base_price" => 2500.00,
                "icon" => "home",
                "field_definitions" => [
                    ["name" => "landlord_name", "label" => "Landlord Full Name", "type" => "text", "required" => true],
                    ["name" => "tenant_name", "label" => "Tenant Full Name", "type" => "text", "required" => true],
                    ["name" => "property_address", "label" => "Property Address", "type" => "textarea", "required" => true],
                    ["name" => "monthly_rent", "label" => "Monthly Rent (INR)", "type" => "number", "required" => true],
                    ["name" => "security_deposit", "label" => "Security Deposit (INR)", "type" => "number", "required" => true],
                    ["name" => "start_date", "label" => "Agreement Start Date", "type" => "date", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("RENT AGREEMENT (11 MONTHS)", $ashokaEmblem),
            ],
            [
                "name" => "Lease Deed",
                "slug" => "lease-deed",
                "description" => "Legal document for leasing property for a long-term period.",
                "base_price" => 6500.00,
                "icon" => "file-text",
                "field_definitions" => [
                    ["name" => "lessor_name", "label" => "Lessor (Owner) Name", "type" => "text", "required" => true],
                    ["name" => "lessee_name", "label" => "Lessee (Tenant) Name", "type" => "text", "required" => true],
                    ["name" => "property_address", "label" => "Property Address", "type" => "textarea", "required" => true],
                    ["name" => "lease_period", "label" => "Lease Period (Years)", "type" => "number", "required" => true],
                    ["name" => "annual_rent", "label" => "Annual Rent (INR)", "type" => "number", "required" => true],
                    ["name" => "start_date", "label" => "Lease Start Date", "type" => "date", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("LEASE DEED", $ashokaEmblem),
            ],
            [
                "name" => "Non-Disclosure Agreement (NDA)",
                "slug" => "nda",
                "description" => "Confidentiality agreement between parties to protect sensitive information.",
                "base_price" => 3500.00,
                "icon" => "lock",
                "field_definitions" => [
                    ["name" => "discloser_name", "label" => "Disclosing Party Name", "type" => "text", "required" => true],
                    ["name" => "recipient_name", "label" => "Receiving Party Name", "type" => "text", "required" => true],
                    ["name" => "purpose", "label" => "Purpose of Disclosure", "type" => "textarea", "required" => true],
                    ["name" => "duration", "label" => "Confidentiality Duration (Years)", "type" => "number", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("NON-DISCLOSURE AGREEMENT", $ashokaEmblem),
            ],
            [
                "name" => "Partnership Deed",
                "slug" => "partnership-deed",
                "description" => "Agreement between partners defining rights, duties, and profit-sharing.",
                "base_price" => 7500.00,
                "icon" => "users",
                "field_definitions" => [
                    ["name" => "firm_name", "label" => "Partnership Firm Name", "type" => "text", "required" => true],
                    ["name" => "partner1_name", "label" => "Partner 1 Name", "type" => "text", "required" => true],
                    ["name" => "partner2_name", "label" => "Partner 2 Name", "type" => "text", "required" => true],
                    ["name" => "profit_sharing_ratio", "label" => "Profit Sharing Ratio", "type" => "text", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("PARTNERSHIP DEED", $ashokaEmblem),
            ],
            [
                "name" => "Employment Contract",
                "slug" => "employment-contract",
                "description" => "Comprehensive employment agreement defining terms, duties, compensation, and conditions.",
                "base_price" => 4500.00,
                "icon" => "briefcase",
                "field_definitions" => [
                    ["name" => "employer_name", "label" => "Employer/Company Name", "type" => "text", "required" => true],
                    ["name" => "employer_address", "label" => "Employer Address", "type" => "textarea", "required" => true],
                    ["name" => "employee_name", "label" => "Employee Full Name", "type" => "text", "required" => true],
                    ["name" => "employee_age", "label" => "Employee Age", "type" => "number", "required" => true],
                    ["name" => "employee_address", "label" => "Employee Address", "type" => "textarea", "required" => true],
                    ["name" => "job_title", "label" => "Job Title / Position", "type" => "text", "required" => true],
                    ["name" => "job_description", "label" => "Job Description", "type" => "textarea", "required" => true],
                    ["name" => "employment_type", "label" => "Employment Type (Permanent/Contractual/Temporary)", "type" => "text", "required" => true],
                    ["name" => "salary", "label" => "Monthly Salary (INR)", "type" => "number", "required" => true],
                    ["name" => "benefits", "label" => "Benefits & Perquisites", "type" => "textarea", "required" => false],
                    ["name" => "working_hours", "label" => "Working Hours (e.g., 9 AM - 6 PM)", "type" => "text", "required" => true],
                    ["name" => "leave_policy", "label" => "Leave Policy (Days)", "type" => "number", "required" => true],
                    ["name" => "start_date", "label" => "Employment Start Date", "type" => "date", "required" => true],
                    ["name" => "contract_duration", "label" => "Contract Duration (Months/Years)", "type" => "text", "required" => false],
                    ["name" => "probation_period", "label" => "Probation Period (Months)", "type" => "number", "required" => false],
                    ["name" => "notice_period", "label" => "Notice Period for Termination (Days)", "type" => "number", "required" => true],
                    ["name" => "confidentiality", "label" => "Confidentiality Obligations", "type" => "textarea", "required" => false],
                    ["name" => "non_compete", "label" => "Non-Compete Clause (if any)", "type" => "textarea", "required" => false],
                ],
                "base_template" => $this->getBasicTemplate("EMPLOYMENT CONTRACT", $ashokaEmblem),
            ],
            [
                "name" => "Power of Attorney (General)",
                "slug" => "poa-general",
                "description" => "Document authorizing an attorney to act on behalf of the principal.",
                "base_price" => 3000.00,
                "icon" => "file-signature",
                "field_definitions" => [
                    ["name" => "principal_name", "label" => "Principal (Your) Full Name", "type" => "text", "required" => true],
                    ["name" => "principal_age", "label" => "Principal Age", "type" => "number", "required" => true],
                    ["name" => "principal_address", "label" => "Principal Address", "type" => "textarea", "required" => true],
                    ["name" => "principal_identification", "label" => "Identification Number (Aadhaar/PAN)", "type" => "text", "required" => false],
                    ["name" => "attorney_name", "label" => "Attorney (Agent) Full Name", "type" => "text", "required" => true],
                    ["name" => "attorney_address", "label" => "Attorney Address", "type" => "textarea", "required" => true],
                    ["name" => "relationship", "label" => "Relationship to Principal", "type" => "text", "required" => false],
                    ["name" => "powers_granted", "label" => "Powers Granted (Financial, Legal, Property Management, etc.)", "type" => "textarea", "required" => true],
                    ["name" => "powers_limitations", "label" => "Any Limitations on Powers", "type" => "textarea", "required" => false],
                    ["name" => "validity_period", "label" => "Validity Period (Years)", "type" => "number", "required" => true],
                    ["name" => "revocation_clause", "label" => "Revocation Clause Details", "type" => "textarea", "required" => false],
                ],
                "base_template" => $this->getBasicTemplate("POWER OF ATTORNEY (GENERAL)", $ashokaEmblem),
            ],
            [
                "name" => "Special Power of Attorney",
                "slug" => "poa-special",
                "description" => "Document authorizing an attorney for specific transactions.",
                "base_price" => 3500.00,
                "icon" => "certificate",
                "field_definitions" => [
                    ["name" => "principal_name", "label" => "Principal (Your) Full Name", "type" => "text", "required" => true],
                    ["name" => "principal_age", "label" => "Principal Age", "type" => "number", "required" => true],
                    ["name" => "principal_address", "label" => "Principal Address", "type" => "textarea", "required" => true],
                    ["name" => "principal_identification", "label" => "Identification Number (Aadhaar/PAN)", "type" => "text", "required" => false],
                    ["name" => "attorney_name", "label" => "Attorney (Agent) Full Name", "type" => "text", "required" => true],
                    ["name" => "attorney_address", "label" => "Attorney Address", "type" => "textarea", "required" => true],
                    ["name" => "relationship", "label" => "Relationship to Principal", "type" => "text", "required" => false],
                    ["name" => "transaction_type", "label" => "Type of Specific Transaction", "type" => "text", "required" => true],
                    ["name" => "specific_transaction", "label" => "Details of Specific Transaction/Matter", "type" => "textarea", "required" => true],
                    ["name" => "transaction_date", "label" => "Expected Date of Transaction", "type" => "date", "required" => false],
                    ["name" => "transaction_value", "label" => "Estimated Transaction Value (INR)", "type" => "number", "required" => false],
                    ["name" => "property_details", "label" => "Property/Asset Details (if applicable)", "type" => "textarea", "required" => false],
                ],
                "base_template" => $this->getBasicTemplate("SPECIAL POWER OF ATTORNEY", $ashokaEmblem),
            ],
            [
                "name" => "Affidavit (General)",
                "slug" => "affidavit-general",
                "description" => "Sworn statement providing factual information for legal proceedings.",
                "base_price" => 1500.00,
                "icon" => "file-check",
                "field_definitions" => [
                    ["name" => "affiant_name", "label" => "Affiant (Your) Full Name", "type" => "text", "required" => true],
                    ["name" => "affidavit_purpose", "label" => "Purpose of Affidavit", "type" => "textarea", "required" => true],
                    ["name" => "statement_facts", "label" => "Statement of Facts", "type" => "textarea", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("AFFIDAVIT", $ashokaEmblem),
            ],
            [
                "name" => "Affidavit (Name Change)",
                "slug" => "affidavit-name-change",
                "description" => "Affidavit declaring a change of name for official recognition.",
                "base_price" => 1200.00,
                "icon" => "file-check",
                "field_definitions" => [
                    ["name" => "affiant_name", "label" => "Affiant Current Full Name", "type" => "text", "required" => true],
                    ["name" => "old_name", "label" => "Old/Previous Name", "type" => "text", "required" => true],
                    ["name" => "new_name", "label" => "New Name", "type" => "text", "required" => true],
                    ["name" => "change_reason", "label" => "Reason for Name Change", "type" => "textarea", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("AFFIDAVIT FOR NAME CHANGE", $ashokaEmblem),
            ],
            [
                "name" => "Promissory Note",
                "slug" => "promissory-note",
                "description" => "Written promise to pay a specific sum of money on a future date.",
                "base_price" => 1800.00,
                "icon" => "file-invoice-dollar",
                "field_definitions" => [
                    ["name" => "maker_name", "label" => "Maker (Borrower) Name", "type" => "text", "required" => true],
                    ["name" => "payee_name", "label" => "Payee (Lender) Name", "type" => "text", "required" => true],
                    ["name" => "principal_amount", "label" => "Principal Amount (INR)", "type" => "number", "required" => true],
                    ["name" => "interest_rate", "label" => "Interest Rate (% p.a.)", "type" => "number", "required" => false],
                    ["name" => "maturity_date", "label" => "Maturity/Due Date", "type" => "date", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("PROMISSORY NOTE", $ashokaEmblem),
            ],
            [
                "name" => "Bail Application (Regular)",
                "slug" => "bail-application",
                "description" => "Application for bail to be released from custody under CrPC.",
                "base_price" => 4500.00,
                "icon" => "gavel",
                "field_definitions" => [
                    ["name" => "applicant_name", "label" => "Applicant (Accused) Name", "type" => "text", "required" => true],
                    ["name" => "case_number", "label" => "Case Number/FIR No.", "type" => "text", "required" => true],
                    ["name" => "court_name", "label" => "Court Name", "type" => "text", "required" => true],
                    ["name" => "offence_section", "label" => "Section(s) of Offence", "type" => "text", "required" => true],
                    ["name" => "grounds_for_bail", "label" => "Grounds for Bail", "type" => "textarea", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("BAIL APPLICATION", $ashokaEmblem),
            ],
            [
                "name" => "Complaint under Section 138 NI Act",
                "slug" => "cheque-bounce-complaint",
                "description" => "Legal complaint for dishonored cheque under Section 138 of NI Act.",
                "base_price" => 3000.00,
                "icon" => "file-text",
                "field_definitions" => [
                    ["name" => "complainant_name", "label" => "Complainant Name", "type" => "text", "required" => true],
                    ["name" => "accused_name", "label" => "Accused (Drawer) Name", "type" => "text", "required" => true],
                    ["name" => "cheque_number", "label" => "Cheque Number", "type" => "text", "required" => true],
                    ["name" => "cheque_amount", "label" => "Cheque Amount (INR)", "type" => "number", "required" => true],
                    ["name" => "bank_name", "label" => "Bank Name", "type" => "text", "required" => true],
                    ["name" => "dishonor_reason", "label" => "Reason for Dishonor", "type" => "text", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("COMPLAINT UNDER SECTION 138 NI ACT", $ashokaEmblem),
            ],
            [
                "name" => "Legal Notice (Eviction)",
                "slug" => "legal-notice-eviction",
                "description" => "Legal notice to evict tenant for non-payment or breach.",
                "base_price" => 2500.00,
                "icon" => "file-contract",
                "field_definitions" => [
                    ["name" => "sender_name", "label" => "Sender (Landlord) Name", "type" => "text", "required" => true],
                    ["name" => "recipient_name", "label" => "Recipient (Tenant) Name", "type" => "text", "required" => true],
                    ["name" => "property_address", "label" => "Property Address", "type" => "textarea", "required" => true],
                    ["name" => "breach_details", "label" => "Details of Breach/Non-Payment", "type" => "textarea", "required" => true],
                    ["name" => "notice_period", "label" => "Notice Period (Days)", "type" => "number", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("LEGAL NOTICE - EVICTION", $ashokaEmblem),
            ],
            [
                "name" => "Consumer Complaint",
                "slug" => "consumer-complaint",
                "description" => "Complaint under Consumer Protection Act for defective goods/services.",
                "base_price" => 2000.00,
                "icon" => "file-alt",
                "field_definitions" => [
                    ["name" => "complainant_name", "label" => "Complainant Name", "type" => "text", "required" => true],
                    ["name" => "respondent_name", "label" => "Respondent (Seller/Provider) Name", "type" => "text", "required" => true],
                    ["name" => "product_service", "label" => "Product/Service Details", "type" => "textarea", "required" => true],
                    ["name" => "complaint_details", "label" => "Complaint Details", "type" => "textarea", "required" => true],
                    ["name" => "damages_claimed", "label" => "Damages/Compensation Claimed (INR)", "type" => "number", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("CONSUMER COMPLAINT", $ashokaEmblem),
            ],
            [
                "name" => "RTI Application",
                "slug" => "rti-application",
                "description" => "Application under Right to Information Act, 2005.",
                "base_price" => 500.00,
                "icon" => "info-circle",
                "field_definitions" => [
                    ["name" => "applicant_name", "label" => "Applicant Full Name", "type" => "text", "required" => true],
                    ["name" => "applicant_contact", "label" => "Contact Number", "type" => "text", "required" => true],
                    ["name" => "public_authority", "label" => "Name of Public Authority", "type" => "text", "required" => true],
                    ["name" => "information_sought", "label" => "Information Sought", "type" => "textarea", "required" => true],
                ],
                "base_template" => $this->getBasicTemplate("RIGHT TO INFORMATION (RTI) APPLICATION", $ashokaEmblem),
            ],
        ];

        foreach ($documentTypes as $documentType) {
            DocumentType::updateOrCreate(["slug" => $documentType["slug"]], $documentType);
        }
    }

    private function getDivorcePetitionTemplate($emblem)
    {
        return str_replace('[ASHOKA_EMBLEM]', $emblem, <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; }
        .page { max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; border: 2px double #000; }
        .header { text-align: center; margin-bottom: 15mm; border-bottom: 2px solid #000; padding-bottom: 10mm; }
        .emblem img { height: 50px; }
        .court-title { font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 10px 0; }
        .petition-title { text-align: center; font-size: 12pt; font-weight: bold; text-decoration: underline; margin: 15px 0; }
        .parties { margin: 15px 0; font-size: 10pt; }
        .paragraph { margin: 10px 0; text-align: justify; font-size: 10pt; line-height: 1.8; }
        .para-num { font-weight: bold; display: inline-block; width: 20px; }
        .signature-block { margin-top: 40px; }
        .sig-line { border-top: 1px solid #000; width: 150px; margin: 60px 0 10px 0; }
        .date-place { margin-top: 30px; font-size: 9pt; }
    </style>
</head>
<body>
<div class="page">
    <div class="header">
        <div><img src="[ASHOKA_EMBLEM]" alt="Emblem" style="height: 50px;"></div>
        <div class="court-title">IN THE FAMILY COURT AT [state]</div>
        <div style="font-weight: bold; margin-top: 10px;">PETITION UNDER SECTION 13 OF HINDU MARRIAGE ACT, 1955</div>
    </div>

    <div class="parties">
        <p><strong>Petitioner:</strong> [petitioner_name], Aged [petitioner_age] years, Residing at [petitioner_address]</p>
        <p style="text-align: center; margin: 10px 0; font-weight: bold;">- AND -</p>
        <p><strong>Respondent:</strong> [respondent_name], Aged [respondent_age] years, Residing at [respondent_address]</p>
    </div>

    <div class="petition-title">DIVORCE PETITION</div>

    <div>
        <p class="paragraph"><span class="para-num">1.</span> The marriage between the Petitioner and Respondent was solemnized on <strong>[marriage_date]</strong> at <strong>[marriage_location]</strong> according to Hindu rites.</p>
        <p class="paragraph"><span class="para-num">2.</span> The Petitioner has been residing with Respondent since marriage till [separation_date], after which they have been living separately.</p>
        <p class="paragraph"><span class="para-num">3.</span> The Petitioner hereby prays for a decree of divorce on the following grounds: [grounds_for_divorce]</p>
        <p class="paragraph"><span class="para-num">4.</span> All facts stated are true and correct to the best of Petitioner's knowledge.</p>
    </div>

    <div class="signature-block">
        <div style="width: 50%; display: inline-block;">
            <div class="sig-line"></div>
            <div style="font-size: 9pt;">Signature of Petitioner</div>
        </div>
    </div>

    <div class="date-place">
        <p>Place: [state]</p>
        <p>Date: [date]</p>
    </div>
</div>
</body>
</html>
HTML
        );
    }

    private function getMutualDivorceTemplate($emblem)
    {
        return str_replace('[ASHOKA_EMBLEM]', $emblem, <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; }
        .page { max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; border: 2px double #000; }
        .header { text-align: center; margin-bottom: 15mm; border-bottom: 2px solid #000; padding-bottom: 10mm; }
        .emblem img { height: 50px; }
        .court-title { font-size: 13pt; font-weight: bold; text-transform: uppercase; }
        .petition-title { text-align: center; font-size: 12pt; font-weight: bold; text-decoration: underline; margin: 15px 0; }
        .parties { margin: 15px 0; font-size: 10pt; }
        .paragraph { margin: 10px 0; text-align: justify; font-size: 10pt; line-height: 1.8; }
        .para-num { font-weight: bold; }
        .sig-block { margin-top: 40px; display: flex; gap: 50px; }
        .sig-item { flex: 1; }
        .sig-line { border-top: 1px solid #000; margin: 60px 0 10px 0; }
        .sig-label { font-size: 9pt; margin-top: 10px; text-align: center; }
        .date-place { margin-top: 30px; font-size: 9pt; }
    </style>
</head>
<body>
<div class="page">
    <div class="header">
        <div><img src="[ASHOKA_EMBLEM]" alt="Emblem" style="height: 50px;"></div>
        <div class="court-title">IN THE FAMILY COURT AT [state]</div>
        <div style="font-weight: bold; margin-top: 10px;">PETITION UNDER SECTION 13B HINDU MARRIAGE ACT, 1955</div>
    </div>

    <div class="parties">
        <p style="font-weight: bold;">Between:</p>
        <p style="margin-left: 10mm;"><strong>[husband_name]</strong>, Aged [husband_age] years, Residing at [husband_address]</p>
        <p style="text-align: center; margin: 10px 0; font-weight: bold;">- AND -</p>
        <p style="margin-left: 10mm;"><strong>[wife_name]</strong>, Aged [wife_age] years, Residing at [wife_address]</p>
    </div>

    <div class="petition-title">JOINT PETITION FOR DIVORCE BY MUTUAL CONSENT</div>

    <div>
        <p class="paragraph"><span class="para-num">1.</span> The marriage was solemnized on <strong>[marriage_date]</strong> at <strong>[marriage_location]</strong> according to Hindu rites.</p>
        <p class="paragraph"><span class="para-num">2.</span> The Petitioners have been living separately since <strong>[separation_date]</strong> and are desirous of dissolving the marriage by mutual consent.</p>
        <p class="paragraph"><span class="para-num">3.</span> Alimony/Maintenance Settlement: [alimony_details]</p>
        <p class="paragraph"><span class="para-num">4.</span> Child Custody Arrangement: [child_custody]</p>
        <p class="paragraph"><span class="para-num">5.</span> There is no dispute regarding property, maintenance, or guardianship of children.</p>
    </div>

    <div class="sig-block">
        <div class="sig-item">
            <div class="sig-line"></div>
            <div class="sig-label">Signature of Husband</div>
        </div>
        <div class="sig-item">
            <div class="sig-line"></div>
            <div class="sig-label">Signature of Wife</div>
        </div>
    </div>

    <div class="date-place">
        <p>Place: [state]</p>
        <p>Date: [date]</p>
    </div>
</div>
</body>
</html>
HTML
        );
    }

    private function getBasicTemplate($title, $emblem)
    {
        return str_replace('[ASHOKA_EMBLEM]', $emblem, <<<HTML
<!DOCTYPE html>
<html>
<head>
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; }
        .page { max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; border: 2px double #000; }
        .header { text-align: center; margin-bottom: 15mm; border-bottom: 2px solid #000; padding-bottom: 10mm; }
        .emblem img { height: 50px; }
        .court-title { font-size: 13pt; font-weight: bold; text-transform: uppercase; }
        .title { text-align: center; font-size: 12pt; font-weight: bold; text-decoration: underline; margin: 15px 0; }
        .paragraph { margin: 10px 0; text-align: justify; font-size: 10pt; line-height: 1.8; }
        .para-num { font-weight: bold; margin-right: 5px; }
        .sig-block { margin-top: 40px; }
        .sig-line { border-top: 1px solid #000; width: 150px; margin: 60px 0 10px 0; }
        .sig-label { font-size: 9pt; }
        .witness-section { margin-top: 20px; display: flex; gap: 50px; }
        .witness-item { flex: 1; }
        .date-place { margin-top: 30px; font-size: 9pt; }
    </style>
</head>
<body>
<div class="page">
    <div class="header">
        <div><img src="[ASHOKA_EMBLEM]" alt="Emblem" style="height: 50px;"></div>
        <div class="court-title">REPUBLIC OF INDIA</div>
    </div>

    <h1 class="title">{$title}</h1>

    <p class="paragraph"><span class="para-num">1.</span> This document is executed on [date] / [agreement_date] / [deed_date] / [contract_date].</p>
    <p class="paragraph"><span class="para-num">2.</span> The parties hereby agree to the terms and conditions as set out herein.</p>
    <p class="paragraph"><span class="para-num">3.</span> All facts and information provided are true and correct.</p>
    <p class="paragraph"><span class="para-num">4.</span> This document is executed in accordance with the laws of India.</p>

    <div class="sig-block">
        <div style="width: 45%; display: inline-block;">
            <div class="sig-line"></div>
            <div class="sig-label">Signature / Thumb Impression</div>
        </div>
    </div>

    <div class="witness-section">
        <div class="witness-item">
            <p style="font-weight: bold; font-size: 9pt;">Witness 1:</p>
            <div style="border-top: 1px solid #000; width: 150px; margin: 40px 0 10px 0;"></div>
            <p style="font-size: 8pt;">Name: _______________</p>
        </div>
        <div class="witness-item">
            <p style="font-weight: bold; font-size: 9pt;">Witness 2:</p>
            <div style="border-top: 1px solid #000; width: 150px; margin: 40px 0 10px 0;"></div>
            <p style="font-size: 8pt;">Name: _______________</p>
        </div>
    </div>

    <div class="date-place">
        <p>Place: _______________</p>
        <p>Date: [date]</p>
    </div>

    <div style="margin-top: 40px; text-align: right;">
        <p style="font-weight: bold; font-size: 9pt; margin-bottom: 20px;">Notary/Lawyer Certification:</p>
        <div style="border: 2px solid #c41e3a; border-radius: 50%; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 8pt; text-align: center; margin-left: auto;">ATTESTED<br/>SEAL</div>
    </div>
</div>
</body>
</html>
HTML
        );
    }
}
