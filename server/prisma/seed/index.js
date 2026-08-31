/**
 * Seed runner: `npx prisma db seed` (configured in package.json) or
 * `node prisma/seed/index.js`.
 *
 * Idempotent:
 *   - Industries / DocumentTypes → upserted by slug
 *   - Schemes → keyed by NAME (the Scheme model has no slug column)
 *   - Questions → upserted by (key, phase, industryId)
 *   - Rule tables → wiped and recreated from seed files (dev-mode semantics;
 *     rules have no natural key and nothing else references them)
 */
const { PrismaClient } = require(`@prisma/client`);
require(`dotenv`).config(); // standalone process: load server/.env for DATABASE_URL
const { validateCondition } = require(`../../src/services/ruleEngine`);

const industries = require(`./industries`);
const { phaseA, phaseB } = require(`./questions`);
const documentTypes = require(`./documentTypes`);
const documentRules = require(`./documentRules`);
const schemes = require(`./schemes`);
const schemeEligibilityRules = require(`./schemeEligibilityRules`);

const prisma = new PrismaClient();

async function upsertQuestion(question, phase, industryId) {
    const existing = await prisma.question.findFirst({
        where: { key: question.key, phase, industryId },
    });

    if (existing) {
        return prisma.question.update({
            where: { id: existing.id },
            data: {
                questionText: question.questionText,
                inputType: question.inputType,
                options: question.options,
                orderIndex: question.orderIndex,
            },
        });
    }

    return prisma.question.create({
        data: {
            key: question.key,
            questionText: question.questionText,
            inputType: question.inputType,
            options: question.options,
            phase,
            orderIndex: question.orderIndex,
            industryId,
        },
    });
}

async function main() {
    // 0. Validate every rule condition structurally — fail fast, loudly.
    for (const rule of documentRules) {
        const check = validateCondition(rule.condition, `documentRule[${rule.documentTypeSlug}]`);
        if (!check.valid) throw new Error(`Invalid document condition: ${check.reason}`);
    }
    for (const rule of schemeEligibilityRules) {
        const check = validateCondition(rule.condition, `schemeRule[${rule.schemeSlug}]`);
        if (!check.valid) throw new Error(`Invalid scheme condition: ${check.reason}`);
    }

    // 1. Industries
    const industryBySlug = {};
    for (const industry of industries) {
        const row = await prisma.industry.upsert({
            where: { slug: industry.slug },
            update: { name: industry.name },
            create: { slug: industry.slug, name: industry.name },
        });
        industryBySlug[industry.slug] = row;
    }

    // 2. Questions — Phase A (industryId: null) and Phase B (per industry)
    for (const question of phaseA) {
        await upsertQuestion(question, `A`, null);
    }
    for (const [slug, questions] of Object.entries(phaseB)) {
        const industry = industryBySlug[slug];
        if (!industry) throw new Error(`Phase B questions reference unknown industry: ${slug}`);
        for (const question of questions) {
            await upsertQuestion(question, `B`, industry.id);
        }
    }

    // 3. Document catalog + rules
    for (const docType of documentTypes) {
        await prisma.documentType.upsert({
            where: { slug: docType.slug },
            update: { name: docType.name, description: docType.description },
            create: { slug: docType.slug, name: docType.name, description: docType.description },
        });
    }

    await prisma.documentRule.deleteMany({});
    for (const rule of documentRules) {
        const docType = await prisma.documentType.findUnique({ where: { slug: rule.documentTypeSlug } });
        if (!docType) throw new Error(`Unknown documentTypeSlug: ${rule.documentTypeSlug}`);
        const industry = rule.industrySlug ? industryBySlug[rule.industrySlug] : null;
        if (rule.industrySlug && !industry) throw new Error(`Unknown industrySlug: ${rule.industrySlug}`);

        await prisma.documentRule.create({
            data: {
                documentTypeId: docType.id,
                industryId: industry ? industry.id : null,
                condition: rule.condition,
            },
        });
    }

    // 4. Scheme catalog (keyed by name — no slug column) + eligibility rules
    const schemeNameBySlug = {};
    for (const scheme of schemes) {
        const existing = await prisma.scheme.findFirst({ where: { name: scheme.name } });

        const data = {
            description: scheme.description,
            benefits: scheme.benefits,
            officialLink: scheme.officialLink,
            industryId: scheme.industrySlug ? industryBySlug[scheme.industrySlug].id : null,
        };

        const row = existing
            ? await prisma.scheme.update({ where: { id: existing.id }, data })
            : await prisma.scheme.create({ data: { name: scheme.name, ...data } });

        schemeNameBySlug[scheme.slug] = row;
    }

    await prisma.schemeEligibilityRule.deleteMany({});
    for (const rule of schemeEligibilityRules) {
        const scheme = schemeNameBySlug[rule.schemeSlug];
        if (!scheme) throw new Error(`Unknown schemeSlug: ${rule.schemeSlug}`);
        const industry = rule.industrySlug ? industryBySlug[rule.industrySlug] : null;
        if (rule.industrySlug && !industry) throw new Error(`Unknown industrySlug: ${rule.industrySlug}`);

        await prisma.schemeEligibilityRule.create({
            data: {
                schemeId: scheme.id,
                industryId: industry ? industry.id : null,
                condition: rule.condition,
            },
        });
    }

    // 5. Summary counts
    const [industryCount, questionCount, phaseACount, phaseBCount, docTypeCount, docRuleCount, schemeCount, schemeRuleCount] =
        await Promise.all([
            prisma.industry.count(),
            prisma.question.count(),
            prisma.question.count({ where: { phase: `A` } }),
            prisma.question.count({ where: { phase: `B` } }),
            prisma.documentType.count(),
            prisma.documentRule.count(),
            prisma.scheme.count(),
            prisma.schemeEligibilityRule.count(),
        ]);

    console.log(`Seed complete:`);
    console.log(`  industries:        ${industryCount}`);
    console.log(`  questions (total): ${questionCount} (Phase A: ${phaseACount}, Phase B: ${phaseBCount})`);
    console.log(`  document types:    ${docTypeCount}`);
    console.log(`  document rules:    ${docRuleCount}`);
    console.log(`  schemes:           ${schemeCount}`);
    console.log(`  scheme rules:      ${schemeRuleCount}`);
}

main()
    .catch((err) => {
        console.error(`Seed failed:`, err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());