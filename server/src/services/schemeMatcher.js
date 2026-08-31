const prisma = require(`../../db`);
const { evaluateCondition } = require(`./ruleEngine`);

/**
 * Matches Schemes for a profile via SchemeEligibilityRule rows.
 * Same scoping semantics as documentMatcher: industryId null = universal.
 *
 * @param {object} profile    normalized profileData from profileBuilder
 * @param {string} industryId internal Industry.id
 * @returns {Promise<Array<{id, name, description, benefits, officialLink}>>} deduped matches
 */
async function matchSchemes(profile, industryId) {
    const rules = await prisma.schemeEligibilityRule.findMany({
        where: {
            OR: [{ industryId: null }, { industryId }],
        },
        include: { scheme: true },
    });

    const matched = new Map();

    for (const rule of rules) {
        if (!evaluateCondition(profile, rule.condition)) continue;
        matched.set(rule.scheme.id, {
            id: rule.scheme.id,
            name: rule.scheme.name,
            description: rule.scheme.description,
            benefits: rule.scheme.benefits,
            officialLink: rule.scheme.officialLink,
        });
    }

    return [...matched.values()];
}

module.exports = { matchSchemes };