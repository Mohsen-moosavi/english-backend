const {Router} = require("express");
const path = require("path");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/article.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const { createArticleValidator, getArticlesValidator } = require("../validators/article.validator");
const multer = require("multer");

const router = Router();

const storage = multer.diskStorage({
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

const uploadFile = multer({
    storage,
    limits : {
        fileSize : '200000'
    }
})

router.post('/' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),uploadFile.single('cover') ,createArticleValidator(),controller.createArticle);
router.get('/' ,getArticlesValidator() , controller.getArticles);
router.get('/:id' , controller.getArticle);
router.delete('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.admin , configs.roles.writter]) , getArticlesValidator() ,controller.deleteArticle);
router.put('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.teacher]),uploadFile.single('cover'), createArticleValidator() ,controller.updateArticle);

module.exports = router;