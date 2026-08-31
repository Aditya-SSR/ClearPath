const prisma = require(`../../db`);
const { evaluateCondition } = require(`./ruleEngine`);

/**
 * Matches DocumentTypes for a profile via DocumentRule rows.
 *
 * Rule scope: industryId = industry → industry-specific;
 *             industryId = null    → applies to ALL industries.
 * The document catalog itself (DocumentType) is global — matching happens
 * entirely through rules, so adding a new industry means adding seed rows.
 *
 * @param {object} profile    normalized profileData from profileBuilder
 * @param {string} industryId internal Industry.id
 * @returns {Promise<Array<{id, slug, name, description}>>} deduped matches
 */
async function matchDocumentTypes(profile, industryId) {
    const rules = await prisma.documentRule.findMany({
        where: {
            OR: [{ industryId: null }, { industryId }],
        },
        include: { documentType: true },
    });

    const matched = new Map();

    for (const rule of rules) {
        if (!evaluateCondition(profile, rule.condition)) continue;
        matched.set(rule.documentType.id, {
            id: rule.documentType.id,
            slug: rule.documentType.slug,
            name: rule.documentType.name,
            description: rule.documentType.description,
        });
    }

    return [...matched.values()];
}

module.exports = { matchDocumentTypes };