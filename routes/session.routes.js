const {Router} = require("express");
const path = require("path");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/session.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const multer = require("multer");
const { updateDetailsWithoutFileValidator, getSessionValidator, updateVideoValidator, uploadVideoValidator } = require("../validators/sessionValidator");

const router = Router();

const uploadVideo = multer({ storage: multer.memoryStorage() , limits : {fileSize : 600 * 1024 * 1024}});
const uploadFile = multer({ storage: multer.memoryStorage() , limits : {fileSize : 10 * 1024 * 1024}});

router.post('/upload-video' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),uploadVideo.single('video'),uploadVideoValidator(),controller.uploadVideo);
router.post('/update-video' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),uploadVideo.single('video'),updateVideoValidator(),controller.updateVideo);
router.post('/' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),uploadFile.single('file'),controller.uploadSessionDetails);
router.post('/without-file' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),updateDetailsWithoutFileValidator(),controller.uploadSessionDetailsWithoutFile);
router.get('/:courseId' ,getSessionValidator() , controller.getSessions);
router.get('/single/:id' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),controller.getSingleSessionforAdmin);
// router.get('/:id' , controller.getArticle);
router.delete('/:id/:courseId' ,authMiddleware , roleGardMiddleware([configs.roles.admin , configs.roles.writter]),getSessionValidator(),controller.deleteSession);
// router.delete('/cach/:name' ,authMiddleware , roleGardMiddleware([configs.roles.admin , configs.roles.writter]),controller.deleteCash);
// router.put('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),uploadFile.single('cover'), createArticleValidator() ,controller.updateArticle);

module.exports = router;