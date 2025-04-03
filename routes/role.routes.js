const {Router} = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/role.controller")

const router = Router()

router.get('/',authMiddleware , roleGardMiddleware([]), controller.getRoles)

module.exports = router;