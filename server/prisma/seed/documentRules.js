// Matching conditions per document type.
// industrySlug: null → applies to ALL industries (e.g. universal registrations).
// Condition JSON is evaluated by the generic rule engine against the
// normalized profile (Phase A + Phase B + derived fields like businessScale).
// ASSUMPTIONS ARE FLAGGED INLINE — review the [ASSUMPTION] comments.

module.exports = [
    // ───────────────────────── Universal (all industries) ─────────────────────────

    {
        // [ASSUMPTION] Udyam limited to MSME-scale businesses (investment ≤ ₹50 Cr).
        // In practice any business may register, but the roadmap targets MSMEs.
        industrySlug: null,
        documentTypeSlug: `udyam_registration`,
        condition: { field: `businessScale`, op: `in`, value: [`micro`, `small`, `medium`] },
    },
    {
        // [ASSUMPTION] GST presumed required for already-operating businesses, or
        // new businesses expecting turnover ≥ ₹20 L (services threshold). Goods
        // threshold is ₹40 L but services/commerce dominate the supported industries.
        industrySlug: null,
        documentTypeSlug: `gst_registration`,
        condition: {
            or: [
                { field: `projectStage`, op: `eq`, value: `already_operating` },
                { field: `annualTurnover`, op: `gte`, value: 2000000 },
            ],
        },
    },
    {
        // [ASSUMPTION] Only premises-based businesses need S&E registration;
        // fully remote businesses are excluded.
        industrySlug: null,
        documentTypeSlug: `shop_establishment_registration`,
        condition: { field: `hasPhysicalPremises`, op: `eq`, value: true },
    },
    {
        // [ASSUMPTION] Trade license applies to premises-based businesses that are
        // (or are becoming) operational.
        industrySlug: null,
        documentTypeSlug: `trade_license`,
        condition: {
            and: [
                { field: `hasPhysicalPremises`, op: `eq`, value: true },
                { field: `projectStage`, op: `eq`, value: `already_operating` },
            ],
        },
    },
    {
        // [ASSUMPTION] Professional Tax exists only in specific states — this list
        // covers the states that currently levy it. Review and update as rules change.
        industrySlug: null,
        documentTypeSlug: `professional_tax_registration`,
        condition: {
            field: `state`,
            op: `in`,
            value: [
                `Andhra Pradesh`, `Assam`, `Bihar`, `Chhattisgarh`, `Gujarat`, `Jharkhand`,
                `Karnataka`, `Kerala`, `Madhya Pradesh`, `Maharashtra`, `Meghalaya`,
                `Mizoram`, `Nagaland`, `Odisha`, `Sikkim`, `Tamil Nadu`, `Telangana`,
                `Tripura`, `West Bengal`,
            ],
        },
    },

    // ───────────────────────── Food Processing ─────────────────────────

    {
        // Universal for food: EVERY food business needs FSSAI in some tier
        // (Registration < ₹12L, State License ₹12L–₹20Cr, Central > ₹20Cr).
        // The roadmap always surfaces it; the tier depends on scale.
        industrySlug: `food_processing`,
        documentTypeSlug: `fssai_license`,
        condition: null,
    },
    {
        industrySlug: `food_processing`,
        documentTypeSlug: `pollution_control_noc`,
        condition: {
            or: [
                { field: `generatesWastewater`, op: `eq`, value: true },
                { field: `handlesChemicals`, op: `eq`, value: true },
            ],
        },
    },
    {
        // [ASSUMPTION] Fire NOC when premises + 10 or more employees.
        industrySlug: `food_processing`,
        documentTypeSlug: `fire_safety_noc`,
        condition: {
            and: [
                { field: `hasPhysicalPremises`, op: `eq`, value: true },
                { field: `employeeCount`, op: `gte`, value: 10 },
            ],
        },
    },
    {
        // [ASSUMPTION] Legal Metrology applies to businesses manufacturing packaged food.
        industrySlug: `food_processing`,
        documentTypeSlug: `legal_metrology_registration`,
        condition: { field: `isManufacturing`, op: `eq`, value: true },
    },

    // ─────────────────────── Textile/Garment Manufacturing ───────────────────────

    {
        // Factories Act thresholds: 10 workers WITH power, 20 WITHOUT power.
        // Uses Phase A employeeCount + Phase B productionType together.
        industrySlug: `textile_manufacturing`,
        documentTypeSlug: `factory_license`,
        condition: {
            or: [
                {
                    and: [
                        { field: `productionType`, op: `eq`, value: `powerloom` },
                        { field: `employeeCount`, op: `gte`, value: 10 },
                    ],
                },
                {
                    and: [
                        { field: `productionType`, op: `eq`, value: `handloom` },
                        { field: `employeeCount`, op: `gte`, value: 20 },
                    ],
                },
            ],
        },
    },
    {
        // Dyeing/printing = high pollution load (orange/red category) → full consent.
        industrySlug: `textile_manufacturing`,
        documentTypeSlug: `pollution_consent_cte_cto`,
        condition: { field: `usesDyeingProcess`, op: `eq`, value: true },
    },
    {
        // [ASSUMPTION] Fire NOC when premises + 10 or more factory workers.
        industrySlug: `textile_manufacturing`,
        documentTypeSlug: `fire_safety_noc`,
        condition: {
            and: [
                { field: `hasPhysicalPremises`, op: `eq`, value: true },
                { field: `factoryWorkerCount`, op: `gte`, value: 10 },
            ],
        },
    },
    {
        industrySlug: `textile_manufacturing`,
        documentTypeSlug: `industrial_land_allotment`,
        condition: { field: `needsIndustrialLand`, op: `eq`, value: true },
    },

    // ───────────────────────── Handicrafts/Handloom ─────────────────────────

    {
        // Pehchan card is for individual artisans; registered enterprises skip it.
        industrySlug: `handicrafts`,
        documentTypeSlug: `artisan_identity_card`,
        condition: { field: `producerType`, op: `eq`, value: `individual_artisan` },
    },
    {
        industrySlug: `handicrafts`,
        documentTypeSlug: `gi_authorised_user_certificate`,
        condition: { field: `giEligible`, op: `eq`, value: true },
    },

    // ───────────────────────── IT/Software Services ─────────────────────────

    {
        // [ASSUMPTION] IEC is technically optional for pure service exports but
        // required to claim most export benefits and used by banks for some
        // forex purposes — surfaced when overseas clients are involved.
        industrySlug: `it_services`,
        documentTypeSlug: `import_export_code`,
        condition: { field: `hasOverseasClients`, op: `eq`, value: true },
    },
];