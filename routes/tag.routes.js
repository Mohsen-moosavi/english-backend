const {Router} = require("express");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/tag.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const { createTagValidator, getTagValidator } = require("../validators/tag.validator");

const router = Router();

router.post('/' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]), createTagValidator() ,controller.createTag);
router.get('/' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),getTagValidator() ,controller.getTags);
router.delete('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]) , getTagValidator() ,controller.deleteTag);
router.put('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]), createTagValidator() ,controller.updateTag);

module.exports = router;