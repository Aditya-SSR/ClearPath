const prisma = require(`../../db`);
const { buildProfile } = require(`./profileBuilder`);
const { matchDocumentTypes } = require(`./documentMatcher`);
const { matchSchemes } = require(`./schemeMatcher`);
const { upsertUserFromClerk } = require(`./userService`);

/**
 * Orchestrates the full Part-1 roadmap flow:
 *   raw answers → QuestionnaireResponse → BusinessProfile →
 *   document/scheme matching → GeneratedOutput
 */
async function submitQuestionnaire({ clerkUserId, industrySlug, answers }) {
    const industry = await prisma.industry.findUnique({ where: { slug: industrySlug } });

    if (!industry) {
        const error = new Error(`Unknown industry: ${industrySlug}`);
        error.status = 400;
        throw error;
    }

    // 1. Ensure local user exists (Clerk is the identity source)
    const user = await upsertUserFromClerk(clerkUserId);

    // 2. Persist raw answers exactly as submitted (audit trail)
    const response = await prisma.questionnaireResponse.create({
        data: {
            userId: user.id,
            industryId: industry.id,
            rawAnswers: answers,
        },
    });

    // 3. Derive the normalized business profile
    const { profileData, businessScale, entityType } = buildProfile(answers, industry);

    const profile = await prisma.businessProfile.create({
        data: {
            userId: user.id,
            responseId: response.id,
            industryId: industry.id,
            businessScale,
            entityType,
            profileData,
        },
    });

    // 4. Run the rule engine for documents + schemes
    const [requiredDocuments, eligibleSchemes] = await Promise.all([
        matchDocumentTypes(profileData, industry.id),
        matchSchemes(profileData, industry.id),
    ]);

    // 5. Persist the generated roadmap
    const output = await prisma.generatedOutput.create({
        data: {
            profileId: profile.id,
            requiredDocuments,
            matchedSchemes: eligibleSchemes,
        },
    });

    return {
        outputId: output.id,
        profileId: profile.id,
        industry: { id: industry.id, slug: industry.slug, name: industry.name },
        requiredDocuments,
        eligibleSchemes,
    };
}

/**
 * Phase A questions always; Phase B questions when an industry is given.
 */
async function getQuestions(industrySlug) {
    const phaseA = await prisma.question.findMany({
        where: { phase: `A` },
        orderBy: { orderIndex: `asc` },
    });

    let phaseB = [];

    if (industrySlug) {
        const industry = await prisma.industry.findUnique({ where: { slug: industrySlug } });

        if (industry) {
            phaseB = await prisma.question.findMany({
                where: { phase: `B`, industryId: industry.id },
                orderBy: { orderIndex: `asc` },
            });
        }
    }

    return { phaseA, phaseB };
}

/**
 * Fetch a previously generated result WITHOUT recomputing.
 * Accepts either the GeneratedOutput id or the BusinessProfile id.
 */
async function getGeneratedResult(id) {
    if (!id) return null;

    const output = await prisma.generatedOutput.findUnique({ where: { id } });
    if (output) return output;

    const profile = await prisma.businessProfile.findUnique({
        where: { id },
        include: { generatedOutput: true },
    });

    return profile ? profile.generatedOutput : null;
}

module.exports = { submitQuestionnaire, getQuestions, getGeneratedResult };