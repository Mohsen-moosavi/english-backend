const { body, query, param } = require("express-validator");

function updateDetailsWithoutFileValidator(){
    return [
        body('name').isString().withMessage("عنوان وارد شده معتبر نمی باشد.").isLength({ min: 3 }).withMessage("عنوان وارد شده باید حداقل 3 کاراکتر باشد."),
        body('isFree').isBoolean().withMessage("وضعیت وارد شده معتبر نمی باشد."),
        body('sessionId').isNumeric().withMessage('آی دی وارد شده معتبر نمی باشد.'),
    ]
}

function getSessionValidator(){
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query("search").isString().withMessage('پارامتر search معتبر نمی باشد.'),
        query("status").isString().withMessage('پارامتر وضعیت معتبر نمی باشد.').isIn(['free','notFree']).optional(),
        query("fileStatus").isString().withMessage('پارامتر وضعیت فایل پیوست معتبر نمی باشد.').isIn(['fileExist','fileNotExist']).optional(),
        param('courseId').isNumeric().withMessage('آی دی وارد شده معتبر نمی باشد.'),
    ]
}

function uploadVideoValidator(){
    return [
        body('fileName').isString().withMessage("نام وارد شده معتبر نمی باشد.").matches(/\.(mp4|mkv)$/i).withMessage('فایل باید از نوع mp4 یا mkv باشد.'),
        body('courseId').isNumeric().withMessage("دوره مشخص شده معتبر نمی باشد."),
        body('time').isString().withMessage('زمان وارد شده معتبر نمی باشد.'),
    ]
}

function updateVideoValidator(){
    return [
        body('fileName').isString().withMessage("نام وارد شده معتبر نمی باشد.").matches(/\.(mp4|mkv)$/i).withMessage('فایل باید از نوع mp4 یا mkv باشد.'),
        body('sessionId').isNumeric().withMessage("جلسه مشخص شده معتبر نمی باشد."),
        body('time').isString().withMessage('زمان وارد شده معتبر نمی باشد.'),
    ]
}

module.exports = {
    updateDetailsWithoutFileValidator,
    getSessionValidator,
    updateVideoValidator,
    uploadVideoValidator
}