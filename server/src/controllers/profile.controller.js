const questionnaireService = require(`../services/questionnaireService`);

// GET /profile/:id — returns a previously generated result without recomputing.
// :id may be a GeneratedOutput id or a BusinessProfile id.
async function getProfile(req, res, next) {
    try {
        const output = await questionnaireService.getGeneratedResult(req.params.id);

        if (!output) {
            return res.status(404).json({ error: `Generated result not found` });
        }

        return res.json({
            outputId: output.id,
            profileId: output.profileId,
            requiredDocuments: output.requiredDocuments,
            eligibleSchemes: output.matchedSchemes,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getProfile };