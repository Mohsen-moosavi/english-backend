const { body } = require("express-validator");

function sendOtpValidator(){
    return [
        body('phone').isMobilePhone("fa-IR" , {strictMode : true}).withMessage("شماره وارد شده معتبر نمی باشد.")
    ]
}

function verifyOtpValidator(){
    return [
        body('phone').isMobilePhone("fa-IR" , {strictMode : true}).withMessage("شماره وارد شده معتبر نمی باشد."),
        body('code').isString().isLength({max:5 , min:5}).withMessage("تعداد ارقام کد، صحیح نیست.").matches(
            /^[0-9]+$/).withMessage("کد فرستاده شده، معتبر نیست")
    ]
}

module.exports = {
    sendOtpValidator,
    verifyOtpValidator
}