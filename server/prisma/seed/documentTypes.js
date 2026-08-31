// Global catalog of regulatory documents/licenses (industry-agnostic rows).
// Industry applicability is expressed ONLY through documentRules conditions —
// adding a new industry never requires touching this catalog for reuse.
module.exports = [
    {
        slug: `udyam_registration`,
        name: `Udyam (MSME) Registration`,
        description: `Government registration that certifies your business as an MSME and unlocks priority-sector lending, subsidies and scheme eligibility.`,
    },
    {
        slug: `gst_registration`,
        name: `GST Registration (GSTIN)`,
        description: `Goods and Services Tax registration required for businesses above the turnover threshold or making inter-state/taxable supplies.`,
    },
    {
        slug: `shop_establishment_registration`,
        name: `Shop & Establishment Registration`,
        description: `Registration under the state Shops and Establishments Act for any premises where trade or business is carried out.`,
    },
    {
        slug: `trade_license`,
        name: `Trade License (Municipal)`,
        description: `License from the local municipal authority permitting the business to operate a specific trade at a specific location.`,
    },
    {
        slug: `professional_tax_registration`,
        name: `Professional Tax Registration`,
        description: `State-level registration to deduct and pay professional tax on salaries/wages in states that levy it.`,
    },
    {
        slug: `fssai_license`,
        name: `FSSAI License/Registration`,
        description: `Food Safety and Standards Authority of India license/registration mandatory for any food business (tier depends on scale).`,
    },
    {
        slug: `pollution_control_noc`,
        name: `Pollution Control Board NOC/CTE`,
        description: `Consent to Establish/Operate (NOC) from the State Pollution Control Board for polluting or potentially polluting activities.`,
    },
    {
        slug: `fire_safety_noc`,
        name: `Fire Safety NOC`,
        description: `No-Objection Certificate from the state fire services confirming the premises meet fire safety norms.`,
    },
    {
        slug: `legal_metrology_registration`,
        name: `Legal Metrology (Packaged Commodities) Registration`,
        description: `Registration as manufacturer/packer under Legal Metrology (Packaged Commodities) Rules for pre-packaged goods.`,
    },
    {
        slug: `factory_license`,
        name: `Factory License (Factories Act, 1948)`,
        description: `License under the Factories Act for manufacturing units employing workers with/without power above statutory thresholds.`,
    },
    {
        slug: `pollution_consent_cte_cto`,
        name: `Pollution Board Consent (CTE & CTO)`,
        description: `Consent to Establish and Consent to Operate for industrial processes with higher pollution load (e.g. dyeing, chemical processing).`,
    },
    {
        slug: `industrial_land_allotment`,
        name: `Industrial Land/Shed Allotment`,
        description: `Allotment or lease deed from the state industrial development corporation for industrial land or sheds.`,
    },
    {
        slug: `artisan_identity_card`,
        name: `Artisan Identity Card (Pehchan)`,
        description: `Identity card issued by the Office of DC (Handicrafts) certifying an individual as an artisan — required for artisan schemes.`,
    },
    {
        slug: `gi_authorised_user_certificate`,
        name: `GI Authorised User Certificate`,
        description: `Registration as an authorised user of a Geographical Indication, letting you sell products under a registered GI tag.`,
    },
    {
        slug: `import_export_code`,
        name: `Import Export Code (IEC)`,
        description: `10-digit IEC issued by DGFT, needed for international trade and to claim most export-related benefits.`,
    },
];