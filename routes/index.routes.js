const {Router} = require("express")
const authRoutes = require("./auth.routes")
const userRoutes = require("./user.routes")
const levelRoutes = require("./level.routes")
const tagRoutes = require("./tag.routes")
const articleRoutes = require("./article.routes")

const router = Router()

router.use("/auth" , authRoutes)
router.use("/user" , userRoutes)
router.use("/level" , levelRoutes)
router.use("/tag" , tagRoutes)
router.use("/article" , articleRoutes)

module.exports = router