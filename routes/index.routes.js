const {Router} = require("express")
const authRoutes = require("./auth.routes")
const userRoutes = require("./user.routes")
const levelRoutes = require("./level.routes")
const tagRoutes = require("./tag.routes")
const articleRoutes = require("./article.routes")
const bookRoutes = require("./book.routes")
const courseRoutes = require("./course.routes")
const offRoutes = require("./off.routes")

const router = Router()

router.use("/auth" , authRoutes)
router.use("/user" , userRoutes)
router.use("/level" , levelRoutes)
router.use("/tag" , tagRoutes)
router.use("/article" , articleRoutes)
router.use("/book" , bookRoutes)
router.use("/course" , courseRoutes)
router.use("/off" , offRoutes)

module.exports = router