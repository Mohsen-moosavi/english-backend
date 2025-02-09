const {Router} = require("express");
const path = require("path");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/book.controlle");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const multer = require("multer");
const { createBookValidator , deleteBookWhitoutGettingAllValidator , getAllBooksValidator} = require("../validators/bookValidator");

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

// const fileStorage = multer.diskStorage({
//     filename  : function(req,file,cb){
//         const extName = path.extname(file.originalname)
//         const whiteTypes = ['.zip' , '.pdf']
//         if(whiteTypes.includes(extName)){
//             const filename = `${Date.now()}${extName}`
//             cb(null , filename)
//         }else{
//             cb(new Error('فقط فرمت zip و pdf مجاز است.'))
//         }
//     }
// })

const uploadCoverFile = multer({
    storage : coverStorage,
    limits : {
        fileSize : '200000'
    }
})

const uploadFile = multer({ storage: multer.memoryStorage() , limits : {fileSize : 200000000}});

router.post('/' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),uploadCoverFile.single('cover'),createBookValidator() ,controller.createBook);
router.post('/upload-file' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),uploadFile.single("file") ,controller.uploadFile);
router.post('/delete-file' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]) ,controller.deleteFile);
router.delete('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),deleteBookWhitoutGettingAllValidator(),controller.deleteBookWhitoutGettingAll);
router.delete('/:id/get-all' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),getAllBooksValidator(),controller.deleteBookWithGettingAll);
router.get('/' ,getAllBooksValidator() , controller.getAllBooks);
router.get('/:id' , controller.getBook);
router.put('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),uploadCoverFile.single('cover'), createBookValidator() ,controller.updateBook);

module.exports = router;