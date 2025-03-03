const { body, param, query } = require("express-validator")

function createCommentValidator() {
    return [
        body('content').isString().withMessage("نظر وارد شده معتبر نمی باشد.").isLength({ min: 3 }).withMessage("متن کامنت باید حداقل 3 کاراکتر باشد."),
        body('score').isNumeric().withMessage("توضیحات کوتاه وارد شده معتبر نمی باشد.").isIn([1,2,3,4,5]).withMessage("امتیاز باید مقداری بین 1 تا 5 باشد."),
        body('courseId').isNumeric({min : 1}).withMessage("مشخصه دوره، برای ثبت کامنت، معتبر نمی باشد."),
        body('parentId').isNumeric({min : 1}).withMessage("مشخصه کامنت، برای ثبت پاسخ، معتبر نمی باشد.").optional()
    ]
}

function getCommentsValidator(){
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query("search").isString().withMessage('پارامتر search معتبر نمی باشد.'),
        query("status").isString().withMessage('پارامتر status معتبر نمی باشد.').isIn(['accept','notAccept','none']).optional(),
        query("parentStatus").isString().withMessage('پارامتر parentStatus معتبر نمی باشد.').isIn(['main','answer']).optional(),
        query("score").isNumeric().withMessage('پارامتر score معتبر نمی باشد.').isIn([0,1,2,3,4,5]).optional(),
    ]
}

function changeAcceptValidator(){
    return [
        body('accept').isBoolean().withMessage("وضعیت وارد شده معتبر نمی باشد."),
    ]
}

function answerValidator() {
    return [
        body('content').isString().withMessage("نظر وارد شده معتبر نمی باشد.").isLength({ min: 3 }).withMessage("متن کامنت باید حداقل 3 کاراکتر باشد."),
        body('courseId').isNumeric({min : 1}).withMessage("مشخصه دوره، برای ثبت کامنت، معتبر نمی باشد."),
        body('parentId').isNumeric({min : 1}).withMessage("مشخصه کامنت، برای ثبت پاسخ، معتبر نمی باشد.").optional(),
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query("search").isString().withMessage('پارامتر search معتبر نمی باشد.'),
        query("status").isString().withMessage('پارامتر status معتبر نمی باشد.').isIn(['accept','notAccept','none']).optional(),
        query("parentStatus").isString().withMessage('پارامتر parentStatus معتبر نمی باشد.').isIn(['main','answer']).optional(),
        query("score").isNumeric().withMessage('پارامتر score معتبر نمی باشد.').isIn([0,1,2,3,4,5]).optional(),
    ]
}

function commentLoopAnswerValidator() {
    return [
        body('content').isString().withMessage("نظر وارد شده معتبر نمی باشد.").isLength({ min: 3 }).withMessage("متن کامنت باید حداقل 3 کاراکتر باشد."),
        body('courseId').isNumeric({min : 1}).withMessage("مشخصه دوره، برای ثبت کامنت، معتبر نمی باشد."),
        body('parentId').isNumeric({min : 1}).withMessage("مشخصه کامنت، برای ثبت پاسخ، معتبر نمی باشد.").optional(),
    ]
}

module.exports = {
    createCommentValidator,
    getCommentsValidator,
    changeAcceptValidator,
    answerValidator,
    commentLoopAnswerValidator
}