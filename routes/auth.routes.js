const {Router} = require("express")
const controller = require("../controllers/v1/auth.controller")
const { sendOtpValidator, registerValidator } = require("../validators/auth.validator")

const router = Router()

router.post("/send-otp" ,sendOtpValidator(), controller.sendOtp)
router.post("/verify-code" ,sendOtpValidator(), controller.verifyCode)
router.post("/register" ,registerValidator(), controller.register)

module.exports = router