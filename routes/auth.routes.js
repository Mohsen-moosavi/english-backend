const {Router} = require("express")
const controller = require("../controllers/v1/auth.controller")
const { sendOtpValidator, registerValidator, loginValidator, forgetPasswordValidator, verifyOtpValidator, resetPasswordValidator, getCaptchaValidator } = require("../validators/auth.validator")

const router = Router()

router.post("/send-otp" ,sendOtpValidator(), controller.sendOtp)
router.post("/verify-code" ,verifyOtpValidator(), controller.verifyCode)
router.post("/register" ,registerValidator(), controller.register)
router.post("/login" ,loginValidator(), controller.login)
router.post("/forget-password",forgetPasswordValidator(),controller.forgetPassword)
router.post("/verify-forget-code",verifyOtpValidator(),controller.verifyForgetPasswordOtp)
router.post("/reset-Password",resetPasswordValidator() ,controller.resetPassword)
router.post("/get-captcha",getCaptchaValidator(),controller.getCaptcha)

module.exports = router