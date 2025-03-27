const {Router} = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/user.controller");
const { getUsersValidator } = require("../validators/user.validator");
const { getCoursesValidator } = require("../validators/course.validator");

const router = Router()

router.get('/',authMiddleware , roleGardMiddleware([]),getUsersValidator(), controller.getUsers)
router.get('/:id',authMiddleware , roleGardMiddleware([]), controller.getUserDetails)
router.delete('/:userId/delete-course/:courseId',authMiddleware , roleGardMiddleware([]), getCoursesValidator(),controller.deleteCourseOfUser)
router.get('/get-finders',authMiddleware , roleGardMiddleware([]), controller.getFinderParams)
router.get('/get-admins',authMiddleware , roleGardMiddleware([]), controller.getAdmins)

module.exports = router;