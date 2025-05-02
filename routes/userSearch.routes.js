const { Router } = require("express");
const { getAllCourseValidator, getAllBookValidator, getAllArticleValidator } = require("../validators/userSearch.validator");
const  controller  = require("../controllers/v1/userSearch.controller");

const router = Router();
router.get('/course-only' ,getAllCourseValidator(),controller.searchAllCourses);
router.get('/book-only' ,getAllBookValidator(),controller.searchAllBooks);
router.get('/article-only' ,getAllArticleValidator(),controller.searchAllArticle);
router.get('/book-only/category',controller.allBookCategory);
router.get('/course-only/category',controller.allCourseCategory);

module.exports = router;
