const { Router } = require("express");
const { getAllCourseValidator, getAllBookValidator } = require("../validators/userSearch.validator");
const  controller  = require("../controllers/v1/userSearch.controller");

const router = Router();
router.get('/curse-only' ,getAllCourseValidator(),controller.searchAllCourses);
router.get('/book-only' ,getAllBookValidator(),controller.searchAllBooks);
router.get('/book-only/category',controller.allBooksategory);

module.exports = router;
