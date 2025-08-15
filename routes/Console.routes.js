const {Router} = require("express");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/console.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const { createCommentValidator, getCommentsValidator, changeAcceptValidator, answerValidator, commentLoopAnswerValidator } = require("../validators/comment.validator");

const router = Router();

router.get('/get-data' ,authMiddleware ,roleGardMiddleware([]), createCommentValidator() ,controller.getData);
router.get('/course-data' ,authMiddleware ,roleGardMiddleware([]), createCommentValidator() ,controller.getCourseData);

module.exports = router;