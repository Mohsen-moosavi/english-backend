const {Router} = require("express");
const path = require("path");
const fs = require("fs");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/extrafiles.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const multer = require("multer");
const { findExtrafileValidator, deleteExtrafileValidator } = require("../validators/extrafile.validator");

const router = Router();


const imageStorage = multer.diskStorage({
    destination : function (req,file,cb){
        if (!fs.existsSync(path.join(__dirname, '..', 'public', 'extraFiles'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'public', 'extraFiles'))
        }        
        cb(null ,  path.join(__dirname, '..', 'public', 'extraFiles'))
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

const uploadImage = multer({
    storage : imageStorage,
    limits : {
        fileSize : `${200 * 1024}`
    }
})



router.post('/' ,authMiddleware , roleGardMiddleware([configs.roles.admin]), uploadImage.single('image'),findExtrafileValidator() ,controller.uploadFile);
router.delete('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.admin]),[...findExtrafileValidator(),...deleteExtrafileValidator()] ,controller.deleteFile);
router.get('/' ,authMiddleware , roleGardMiddleware([configs.roles.admin]),findExtrafileValidator() ,controller.getFiles);



module.exports = router;