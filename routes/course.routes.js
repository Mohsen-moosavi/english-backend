const {Router} = require("express");
const path = require("path");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/course.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const multer = require("multer");
const { createCourseValidator, getCoursesValidator } = require("../validators/course.validator");

const router = Router();


const coverStorage = multer.diskStorage({
    destination : function (req,file,cb){
        cb(null ,  path.join(__dirname, '..', 'public', 'images'))
    },
    filename  : function(req,file,cb){
        const extName = path.extname(file.originalname)
        const whiteTypes = ['.png' , '.jpg' , '.jpeg']
        if(whiteTypes.includes(extName)){
            const filename = `${Date.now()}${extName}`
            cb(null , filename)
        }else{
            cb(new Error('فقط فرمت jpeg و png و jpg مجاز است.'))
        }
    }
})

const uploadCover = multer({
    storage : coverStorage,
    limits : {
        fileSize : '200000'
    }
})

const uploadVideo = multer({ storage: multer.memoryStorage() , limits : {fileSize : 300 * 1024 * 1024}});



router.post('/' ,authMiddleware , roleGardMiddleware([configs.roles.admin]), uploadCover.single('cover'), createCourseValidator() ,controller.createCourse);
router.post('/upload-video' ,authMiddleware , roleGardMiddleware([configs.roles.admin]), uploadVideo.single('video') ,controller.uploadVideo);
router.get('/creating-data' ,authMiddleware , roleGardMiddleware([configs.roles.admin]) ,controller.getCreatingData);
router.post('/delete-video',authMiddleware,roleGardMiddleware([configs.roles.admin]),controller.deleteFile)
router.get('/',authMiddleware,roleGardMiddleware([configs.roles.admin]),getCoursesValidator(),controller.getCourses);
router.get('/short-date',controller.getShortCourseData);
router.get('/last-course',controller.getLastCourses);
router.get('/user-side/:slug',controller.getUserSideCourse);
router.get('/user-side/related/:slug',controller.getRelatedCourse);
router.get('/:id',controller.getCourse);
router.delete('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]) , getCoursesValidator() ,controller.deleteCourse);
router.post('/update/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),uploadCover.single('cover'), createCourseValidator() , controller.updateCourse);
router.post('/update-video/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),uploadVideo.single('video'),controller.updateVideo);
router.post('/change-status/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),getCoursesValidator(),controller.updateStatus);



module.exports = router;