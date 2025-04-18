const {Router} = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/user.controller");
const { getUsersValidator, changeRoleValidator } = require("../validators/user.validator");
const { getCoursesValidator } = require("../validators/course.validator");
const multer = require("multer");
const path = require('path');

const router = Router()

const storage = multer.diskStorage({
    destination : function (req,file,cb){
        cb(null ,  path.join(__dirname, '..', 'public', 'avatars'))
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

const uploadAvatar = multer({
    storage,
    limits : {
        fileSize : 300 * 1024
    }
})

router.get('/',authMiddleware , roleGardMiddleware([]),getUsersValidator(), controller.getUsers)
router.get('/:id',authMiddleware , roleGardMiddleware([]), controller.getUserDetails)
router.delete('/:userId/delete-course/:courseId',authMiddleware , roleGardMiddleware([]), getCoursesValidator(),controller.deleteCourseOfUser)
router.get('/get-finders',authMiddleware , roleGardMiddleware([]), controller.getFinderParams)
router.get('/get-admins',authMiddleware , roleGardMiddleware([]), controller.getAdmins)
router.put('/change-role',authMiddleware , roleGardMiddleware([]),changeRoleValidator(), controller.changeRole)
router.put('/:userId/update-profile',authMiddleware , roleGardMiddleware([]),uploadAvatar.single('avatar'), controller.updateProfileAvatar)
router.delete('/:userId/delete-profile',authMiddleware , roleGardMiddleware([]),controller.deleteUserProfileImage)

module.exports = router;