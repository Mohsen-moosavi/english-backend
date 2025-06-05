const { body, param, query } = require("express-validator")

function createContactValidator(){
    return [
        body('message').isString().withMessage("پیغام وارد شده معتبر نمی باشد.").isLength({min:10, max:1000}).withMessage("پیغام وارد شده باید بین 10 تا 1000 کاراکتر باشد."),
        body('email').isEmail().withMessage("ایمیل وارد شده معتبر نمی باشد."),
    ]
}


function getContactValidator(){
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query("status").isString().withMessage('پارامتر status معتبر نمی باشد.').isIn(['seen','notSeen']).optional(),
        query("answering").isString().withMessage('پارامتر status معتبر نمی باشد.').isIn(['answered','notAnswered']).optional(),
    ]
}

function changeStatusOfContactValidator(){
    return [
        param('id').isNumeric().withMessage("آی دی وارد شده معتبر نمی باشد.").isInt({min:1}).withMessage("آی دی وارد شده معتبر نمی باشد."),
        query('newStatus').isString().isIn(['seen','notSeen']).withMessage("وضعیت وارد شده معتبر نمی باشد."),
    ]
}

function answerToContactValidator(){
    return [
        param('id').isNumeric().withMessage("آی دی وارد شده معتبر نمی باشد.").isInt({min:1}).withMessage("آی دی وارد شده معتبر نمی باشد."),
        body('email').isEmail().withMessage("ایمیل وارد شده معتبر نمی باشد."),
        body('message').isString().withMessage("پیغام وارد شده معتبر نمی باشد.").isLength({min:10,max:1000}).withMessage("پیغام وارد شده باید بین 10 تا 1000 کاراکتر باشد."),
    ]
}


function deleteContactValidator(){
    return [
        param('id').isNumeric().withMessage("آی دی وارد شده معتبر نمی باشد.").isInt({min:1}).withMessage("آی دی وارد شده معتبر نمی باشد."),
    ]
}

module.exports = {
    createContactValidator,
    getContactValidator,
    changeStatusOfContactValidator,
    answerToContactValidator,
    deleteContactValidator
}