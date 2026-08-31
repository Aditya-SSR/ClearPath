// Scheme eligibility conditions. ASSUMPTIONS ARE FLAGGED INLINE.
// Rules with industrySlug: null apply to every industry.

module.exports = [
    {
        // [ASSUMPTION] MUDRA targets non-corporate entities — private_limited
        // companies are excluded; micro/small scale only.
        schemeSlug: `mudra_loan`,
        industrySlug: null,
        condition: {
            and: [
                { field: `businessScale`, op: `in`, value: [`micro`, `small`] },
                { not: { field: `entityType`, op: `eq`, value: `private_limited` } },
            ],
        },
    },
    {
        // [ASSUMPTION] PMEGP is only for NEW units, with project cost caps
        // (₹25 L manufacturing / ₹10 L service). The questionnaire cannot yet
        // distinguish manufacturing vs service project cost per industry, so the
        // higher manufacturing cap is used as the filter.
        schemeSlug: `pmegp`,
        industrySlug: null,
        condition: {
            and: [
                { field: `projectStage`, op: `eq`, value: `new_business` },
                { field: `investmentAmount`, op: `lte`, value: 2500000 },
            ],
        },
    },
    {
        // CGTMSE covers micro & small enterprises across ALL industries
        // (flagged: the brief listed it under Food Processing only).
        schemeSlug: `cgtmse`,
        industrySlug: null,
        condition: { field: `businessScale`, op: `in`, value: [`micro`, `small`] },
    },
    {
        // [ASSUMPTION] PM FME targets MICRO food-processing units specifically;
        // also requires the unit to actually process/manufacture food.
        schemeSlug: `pm_fme`,
        industrySlug: `food_processing`,
        condition: {
            and: [
                { field: `businessScale`, op: `eq`, value: `micro` },
                { field: `isManufacturing`, op: `eq`, value: true },
            ],
        },
    },
    {
        // [ASSUMPTION] ATUFS covers powerloom/processing sub-sectors for tech
        // upgradation; handloom is deliberately excluded (separate handloom
        // schemes exist). Actual coverage is machinery sub-sector specific.
        schemeSlug: `atufs`,
        industrySlug: `textile_manufacturing`,
        condition: {
            or: [
                { field: `productionType`, op: `eq`, value: `powerloom` },
                { field: `usesDyeingProcess`, op: `eq`, value: true },
            ],
        },
    },
    {
        // [ASSUMPTION] PM Vishwakarma is defined for 18 traditional trades; the
        // brief's intent (individual artisans OR small registered enterprises)
        // is modeled with an employee-count threshold of 10.
        schemeSlug: `pm_vishwakarma`,
        industrySlug: `handicrafts`,
        condition: {
            or: [
                { field: `producerType`, op: `eq`, value: `individual_artisan` },
                {
                    and: [
                        { field: `producerType`, op: `eq`, value: `registered_enterprise` },
                        { field: `employeeCount`, op: `lte`, value: 10 },
                    ],
                },
            ],
        },
    },
    {
        // NHDP supports the handicrafts sector broadly → universal within the
        // handicrafts industry (null condition).
        schemeSlug: `nhdp`,
        industrySlug: `handicrafts`,
        condition: null,
    },
    {
        // [ASSUMPTION] DPIIT recognition requires Pvt Ltd / LLP / Partnership
        // entities. The <10 years age and <₹100 Cr turnover criteria are not
        // captured by the current questionnaire — add later if needed.
        schemeSlug: `startup_india_dpiit`,
        industrySlug: `it_services`,
        condition: {
            field: `entityType`,
            op: `in`,
            value: [`private_limited`, `llp`, `partnership`],
        },
    },
    {
        // Per the brief: STPI benefits only when the unit is export-oriented
        // (has or plans overseas clients).
        schemeSlug: `stpi_benefits`,
        industrySlug: `it_services`,
        condition: { field: `hasOverseasClients`, op: `eq`, value: true },
    },
];