const {Router} = require("express")
const controller = require("../controllers/v1/auth.controller")
const { sendOtpValidator, registerValidator, loginValidator, verifyOtpValidator, resetPasswordValidator, getCaptchaValidator, resendOtpValidator } = require("../validators/auth.validator")
const { authMiddleware } = require("../middlewares/auth.middleware")

const router = Router()

router.post("/send-otp" ,sendOtpValidator(), controller.sendOtp)
router.post("/resend-otp" ,resendOtpValidator(), controller.resendOtp)
router.post("/verify-code" ,verifyOtpValidator(), controller.verifyCode)
router.post("/register" ,registerValidator(), controller.register)
router.post("/login" ,loginValidator(), controller.login)
router.post("/forget-password",sendOtpValidator(),controller.forgetPassword)
router.post("/verify-forget-code",verifyOtpValidator(),controller.verifyForgetPasswordOtp)
router.post("/reset-Password",resetPasswordValidator() ,controller.resetPassword)
router.post("/get-captcha",getCaptchaValidator(),controller.getCaptcha)
router.post("/resend-forgetpass-otp" , resendOtpValidator() , controller.resendForgetpassOtp)
router.post("/login-admins" , loginValidator() , controller.loginAdmins)
router.get("/get-me",authMiddleware , controller.getMe)
router.get("/get-me/user-side",authMiddleware , controller.userSideGetMe)
router.post("/refresh-token", controller.refreshToken)
router.post("/logout", controller.logout)

module.exports = router