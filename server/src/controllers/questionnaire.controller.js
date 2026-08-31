const questionnaireService = require(`../services/questionnaireService`);

// POST /questionnaire/submit
// Body: { industry: "<slug>", answers: { ...merged Phase A + Phase B answers } }
async function submit(req, res, next) {
    try {
        const { industry, answers } = req.body || {};

        if (!industry || typeof industry !== `string`) {
            return res.status(400).json({ error: `Body must include "industry" (slug)` });
        }

        if (!answers || typeof answers !== `object` || Array.isArray(answers)) {
            return res.status(400).json({ error: `Body must include "answers" object` });
        }

        const result = await questionnaireService.submitQuestionnaire({
            clerkUserId: req.userId,
            industrySlug: industry,
            answers,
        });

        return res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

// GET /questionnaire/questions[?industry=<slug>]
async function questions(req, res, next) {
    try {
        const data = await questionnaireService.getQuestions(req.query.industry);
        return res.json(data);
    } catch (err) {
        next(err);
    }
}

module.exports = { submit, questions };