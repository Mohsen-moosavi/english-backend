const {Router} = require("express");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/comment.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const { createCommentValidator, getCommentsValidator, changeAcceptValidator, answerValidator, commentLoopAnswerValidator } = require("../validators/comment.validator");

const router = Router();

router.post('/' ,authMiddleware , createCommentValidator() ,controller.createComment);
router.get('/',getCommentsValidator() ,controller.getComments);
router.get('/:id', authMiddleware , roleGardMiddleware([configs.roles.teacher]) ,controller.getCommentLoop);
router.delete('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),getCommentsValidator() ,controller.deleteComment);
router.put('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]), [...getCommentsValidator(),...changeAcceptValidator()] ,controller.changeStatus);
router.put('/comment-loop/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]), changeAcceptValidator() ,controller.changeAcceptWithGettingLoop);
router.delete('/comment-loop/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]) ,controller.deleteCommentWithGettingLoop);
router.post('/answer' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]), answerValidator() ,controller.answer);
router.post('/comment-loop/answer/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]), commentLoopAnswerValidator() ,controller.commentLoopAnswer);


module.exports = router;