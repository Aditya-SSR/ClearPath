const { Router } = require(`express`);
const controller = require(`../controllers/questionnaire.controller`);
const requireAuth = require(`../middlewares/auth`);

const router = Router();

router.post(`/submit`, requireAuth, controller.submit);
router.get(`/questions`, requireAuth, controller.questions);

module.exports = router;