const {Router} = require("express");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/off.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const { createOffValidator, getOffValidator, applyCodeValidator } = require("../validators/off.validator");


const router = Router();

router.post('/' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]), createOffValidator() , controller.createOff);
router.post('/user-side/apply-off',authMiddleware,applyCodeValidator(), controller.applyOffForUserBag)
router.get('/' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]), getOffValidator() , controller.getOffs);
router.delete('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]) , getOffValidator() ,controller.deleteOff);
// router.put('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]), createTagValidator() ,controller.updateTag);

module.exports = router;