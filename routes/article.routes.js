const {Router} = require("express");
const path = require("path");
const fs = require("fs");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/article.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const { createArticleValidator, getArticlesValidator } = require("../validators/article.validator");
const multer = require("multer");

const router = Router();

const storage = multer.diskStorage({
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

const uploadFile = multer({
    storage,
    limits : {
        fileSize : '200000'
    }
})

router.post('/' ,authMiddleware , roleGardMiddleware([configs.roles.admin]),uploadFile.single('cover') ,createArticleValidator(),controller.createArticle);
router.get('/' ,getArticlesValidator() , controller.getArticles);
router.get('/user-side/get-info/:slug', controller.getArticleInfo);
router.get('/user-side/related-to-course/:slug', controller.getRelatedArticlesToCourse)
router.get('/user-side/related-to-article/:slug', controller.getRelatedArticlesToArticle)
router.get('/user-side/related-to-book', controller.getRelatedArticlesToBook)
router.get('/last-artilce', controller.getLastArticles);
router.get('/:id' , controller.getArticle);
router.delete('/:id' ,authMiddleware , roleGardMiddleware([]) , getArticlesValidator() ,controller.deleteArticle);
router.put('/:id' ,authMiddleware , roleGardMiddleware([]),uploadFile.single('cover'), createArticleValidator() ,controller.updateArticle);

module.exports = router;