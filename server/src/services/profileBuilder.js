/**
 * Derives a normalized BusinessProfile from raw questionnaire answers.
 *
 * Normalization goals:
 *   - Coerce every answer to its proper type (number/boolean/string)
 *   - Canonicalize entityType / projectStage (tolerate alias spellings)
 *   - Derive businessScale using MSME (2020 revision) thresholds
 *   - Never throw on bad input — bad values become null and simply
 *     cause rule-engine conditions referencing them to non-match.
 */

const PHASE_A_KEYS = [
    `businessName`,
    `industry`,
    `projectStage`,
    `entityType`,
    `state`,
    `district`,
    `employeeCount`,
    `investmentAmount`,
    `hasPhysicalPremises`,
];

// MSME classification (2020 revision) — [investmentCap, turnoverCap] in ₹
const MSME_THRESHOLDS = {
    micro: [10000000, 50000000],     //  1 Cr /  5 Cr
    small: [100000000, 500000000],   // 10 Cr / 50 Cr
    medium: [500000000, 2500000000], // 50 Cr / 250 Cr
};

const ENTITY_TYPE_ALIASES = {
    proprietorship: `proprietorship`,
    sole_proprietorship: `proprietorship`,
    soleproprietorship: `proprietorship`,
    partnership: `partnership`,
    partnership_firm: `partnership`,
    llp: `llp`,
    limited_liability_partnership: `llp`,
    private_limited: `private_limited`,
    pvt_ltd: `private_limited`,
    private_ltd: `private_limited`,
};

const PROJECT_STAGE_ALIASES = {
    new_business: `new_business`,
    new: `new_business`,
    newbusiness: `new_business`,
    already_operating: `already_operating`,
    operating: `already_operating`,
    existing: `already_operating`,
};

function toTrimmedString(value) {
    return typeof value === `string` ? value.trim() : null;
}

function toNumber(value) {
    if (typeof value === `number` && Number.isFinite(value)) return value;
    if (typeof value === `string` && value.trim() !== `` && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return null;
}

function toBool(value) {
    if (typeof value === `boolean`) return value;
    if (value === `true` || value === 1 || value === `1` || value === `yes`) return true;
    if (value === `false` || value === 0 || value === `0` || value === `no`) return false;
    return null;
}

function normalizeEntityType(value) {
    const key = toTrimmedString(value)?.toLowerCase().replace(/[\s-]+/g, `_`);
    return ENTITY_TYPE_ALIASES[key] || null;
}

function normalizeProjectStage(value) {
    const key = toTrimmedString(value)?.toLowerCase().replace(/[\s-]+/g, `_`);
    return PROJECT_STAGE_ALIASES[key] || null;
}

/**
 * MSME scale classification. Uses BOTH investment and turnover when available;
 * falls back to whichever field exists when the other is missing (graceful).
 * Values above every threshold are classified as "large" (outside MSME scope).
 */
function deriveBusinessScale({ investmentAmount, annualTurnover }) {
    const investment = toNumber(investmentAmount);
    const turnover = toNumber(annualTurnover);

    if (investment === null && turnover === null) return null;

    for (const [scale, [investmentCap, turnoverCap]] of Object.entries(MSME_THRESHOLDS)) {
        const investmentOk = investment === null ? true : investment <= investmentCap;
        const turnoverOk = turnover === null ? true : turnover <= turnoverCap;

        if (investmentOk && turnoverOk) return scale;
    }

    return `large`;
}

/**
 * @param {object} rawAnswers merged Phase A + Phase B answers (keys = question keys)
 * @param {object} industry   the Industry row for this submission
 * @returns {{ profileData: object, businessScale: string|null, entityType: string|null }}
 */
function buildProfile(rawAnswers, industry) {
    const answers = rawAnswers && typeof rawAnswers === `object` ? rawAnswers : {};

    const profileData = {};

    // Normalized Phase A fields
    profileData.businessName = toTrimmedString(answers.businessName);
    profileData.industrySlug = industry ? industry.slug : null;
    profileData.projectStage = normalizeProjectStage(answers.projectStage);
    profileData.entityType = normalizeEntityType(answers.entityType);
    profileData.state = toTrimmedString(answers.state);
    profileData.district = toTrimmedString(answers.district);
    profileData.employeeCount = toNumber(answers.employeeCount);
    profileData.investmentAmount = toNumber(answers.investmentAmount);
    profileData.hasPhysicalPremises = toBool(answers.hasPhysicalPremises);

    // Phase B fields — normalized per type, passed through as-is otherwise
    for (const [key, value] of Object.entries(answers)) {
        if (PHASE_A_KEYS.includes(key)) continue;

        if (typeof value === `boolean`) {
            profileData[key] = value;
        } else if (typeof value === `number`) {
            profileData[key] = Number.isFinite(value) ? value : null;
        } else if (typeof value === `string`) {
            const trimmed = value.trim();
            if (trimmed !== `` && !Number.isNaN(Number(trimmed)) && /^(annualTurnover|.*Count|.*Amount)$/.test(key)) {
                profileData[key] = Number(trimmed); // known numeric Phase B keys
            } else {
                profileData[key] = trimmed.toLowerCase() === trimmed || /[A-Z]/.test(trimmed) === false
                    ? trimmed
                    : trimmed;
            }
        } else {
            profileData[key] = value ?? null;
        }
    }

    // Derived fields
    profileData.businessScale = deriveBusinessScale({
        investmentAmount: profileData.investmentAmount,
        annualTurnover: profileData.annualTurnover,
    });

    return {
        profileData,
        businessScale: profileData.businessScale,
        entityType: profileData.entityType,
    };
}

module.exports = { buildProfile, deriveBusinessScale, normalizeEntityType };