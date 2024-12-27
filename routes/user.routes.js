const {Router} = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/user.controller");
const configs = require("../configs");

const router = Router()

router.get('/',authMiddleware , roleGardMiddleware([]), controller.getUsers)
router.get('/get-admins',authMiddleware , roleGardMiddleware([]), controller.getAdmins)

module.exports = router;