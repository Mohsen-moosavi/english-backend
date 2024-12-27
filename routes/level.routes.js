const {Router} = require("express");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/level.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const { createLevelValidator } = require("../validators/level.validator");

const router = Router();

router.post('/' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]), createLevelValidator() ,controller.createLevel);
router.get('/' ,controller.getLevels);
router.delete('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]) ,controller.deleteLevel);
router.put('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]), createLevelValidator() ,controller.updateLevel);

module.exports = router;