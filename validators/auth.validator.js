const { body } = require("express-validator");

function sendOtpValidator(){
    return [
        body('phone').isMobilePhone("fa-IR" , {strictMode : true}).withMessage("شماره وارد شده معتبر نمی باشد."),
        body('captcha').isString().isLength({min:5,max:5}).withMessage("کد نامعتبر است."),
        body('uuid').isString().withMessage("کد نامعتبر است.")
    ]
}

function verifyOtpValidator(){
    return [
        body('phone').isMobilePhone("fa-IR" , {strictMode : true}).withMessage("شماره وارد شده معتبر نمی باشد."),
        body('code').isString().isLength({max:5 , min:5}).withMessage("تعداد ارقام کد، صحیح نیست.").matches(
            /^[0-9]+$/).withMessage("کد فرستاده شده، معتبر نیست")
    ]
}

function registerValidator(){
    return [
        body('verifiedPhoneCode').isString().isLength({max:4 , min:4}).withMessage("تعداد ارقام کد، صحیح نیست.").matches(
            /^[0-9]+$/).withMessage("کد فرستاده شده، معتبر نیست"),
        body('phone').isMobilePhone("fa-IR" , {strictMode : true}).withMessage("شماره وارد شده معتبر نمی باشد."),
        body('name').isString().isLength({min:3 , max:20}).withMessage("نام باید بین 3 تا 20 کاراکتر باشد."),
        body('username').isString().isLength({min : 3 , max:20}).withMessage("نام کاربری باید بین 3 تا 20 کاراکتر باشد."),
        body('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/).withMessage("رمز عبور باید حداقل 8 کاراکتر و دارای حرف بزرگ و کوچک و عدد باشد."),
        body('confirmPassword').custom((value , {req})=>{
            if(value !== req.body.password){
                throw new Error('گذرواژه و تکرار گذرواژه با هم، یکسان نیستند.')
            } else{
                return true
            }
        })
    ]
}

function loginValidator(){
    return [
        body('phone').isMobilePhone("fa-IR" , {strictMode : true}).withMessage("شماره وارد شده معتبر نمی باشد."),
        body('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/).withMessage("رمز عبور باید حداقل 8 کاراکتر و دارای حرف بزرگ و کوچک و عدد باشد.")
    ]
}

function forgetPasswordValidator(){
    return [
        body('phone').isMobilePhone("fa-IR" , {strictMode : true}).withMessage("شماره وارد شده معتبر نمی باشد."),
    ]
}

function resetPasswordValidator(){
    return [
        body('phone').isMobilePhone("fa-IR" , {strictMode : true}).withMessage("شماره وارد شده معتبر نمی باشد."),
        body('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/).withMessage("رمز عبور باید حداقل 8 کاراکتر و دارای حرف بزرگ و کوچک و عدد باشد."),
        body('confirmPassword').custom((value , {req})=>{
            if(value !== req.body.password){
                throw new Error('گذرواژه و تکرار گذرواژه با هم، یکسان نیستند.')
            } else{
                return true
            }
        }),
        body('verifiedPhoneCode').isString().isLength({max:4 , min:4}).withMessage("تعداد ارقام کد، صحیح نیست.").matches(
            /^[0-9]+$/).withMessage("کد فرستاده شده، معتبر نیست")
    ]
}

function getCaptchaValidator(){
    return [
        body('uuid').optional().isString().withMessage("کد نامعتبر است.")
    ]
}

module.exports = {
    sendOtpValidator,
    verifyOtpValidator,
    registerValidator,
    loginValidator,
    forgetPasswordValidator,
    resetPasswordValidator,
    getCaptchaValidator
}