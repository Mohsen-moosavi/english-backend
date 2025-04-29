const { Router } = require("express");
const { getAllCourseValidator } = require("../validators/userSearch.validator");
const  controller  = require("../controllers/v1/userSearch.controller");

const router = Router();
router.get('/curse-only' ,getAllCourseValidator(),controller.searchAllCourses);

module.exports = router;
