const {Router} = require("express");
const path = require("path");
const fs = require("fs");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/book.controlle");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const multer = require("multer");
const { createBookValidator , deleteBookWhitoutGettingAllValidator , getAllBooksValidator, deleteFileValidator, uploadFileValidator} = require("../validators/bookValidator");

const router = Router();

const coverStorage = multer.diskStorage({
    destination : function (req,file,cb){
        if (!fs.existsSync(path.join(__dirname, '..', 'public', 'images'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'public', 'images'))
        }        
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

const uploadCoverFile = multer({
    storage : coverStorage,
    limits : {
        fileSize : '200000'
    }
})

const uploadFile = multer({ storage: multer.memoryStorage() , limits : {fileSize : 200000000}});

router.post('/' ,authMiddleware , roleGardMiddleware([configs.roles.admin]),uploadCoverFile.single('cover'),createBookValidator() ,controller.createBook);
router.post('/upload-file' ,authMiddleware , roleGardMiddleware([configs.roles.admin]),uploadFile.single("file"),uploadFileValidator() ,controller.uploadFile);
router.post('/delete-file' ,authMiddleware , roleGardMiddleware([configs.roles.admin]),deleteFileValidator() ,controller.deleteFile);
router.delete('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.admin]),deleteBookWhitoutGettingAllValidator(),controller.deleteBookWhitoutGettingAll);
router.delete('/:id/get-all' ,authMiddleware , roleGardMiddleware([configs.roles.admin]),getAllBooksValidator(),controller.deleteBookWithGettingAll);
router.get('/' ,authMiddleware , roleGardMiddleware([configs.roles.admin]),getAllBooksValidator() , controller.getAllBooks);
router.get('/user-side/:slug' ,controller.getUserSideBook );
router.get('/get-group/:id' , controller.getBooksGroup);
router.get('/last-book' , controller.getLastBook);
router.get('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.admin]), controller.getBook);
router.put('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.admin]),uploadCoverFile.single('cover'), createBookValidator() ,controller.updateBook);

module.exports = router;