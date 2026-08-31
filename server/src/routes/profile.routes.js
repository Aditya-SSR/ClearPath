const { Router } = require(`express`);
const controller = require(`../controllers/profile.controller`);
const requireAuth = require(`../middlewares/auth`);

const router = Router();

router.get(`/:id`, requireAuth, controller.getProfile);

module.exports = router;