const { body, query } = require("express-validator")

function createTicketValidator(){
    return [
        body('subject').isString().withMessage("موضوع وارد شده معتبر نمی باشد.").isLength({min : 3 ,max:30}).withMessage("موضوع وارد شده باید بین 3 تا 50 کاراکتر باشد."),
        body('message').isString().withMessage("پیغام وارد شده معتبر نمی باشد.").isLength({max : 2000}).withMessage("طول پیام وارد شده نباید بیشتر از 2000 کاراکتر باشد."),
    ]
}

function getTicketsValidator(){
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query('subject').isString().withMessage("موضوع وارد شده معتبر نمی باشد.").isIn(["fiscal", "scholastic", "counseling",'offer','support','other']).withMessage("موضوع وارد شده خارج از چارچوب است.").optional(),
        query('status').isString().withMessage("وضعیت وارد شده معتبر نمی باشد.").isIn(["open", "pending","answered", "closed"]).withMessage("وضعیت وارد شده خارج از چارچوب است.").optional(),
        query('userId').isNumeric().withMessage('آی دی کابر معتبر نمی باشد.').optional(),
    ]
}

function sendMessageValidator(){
    return [
        body('message').isString().withMessage("پیغام وارد شده معتبر نمی باشد.").isLength({max : 2000}).withMessage("طول پیام وارد شده نباید بیشتر از 2000 کاراکتر باشد."),
    ]
}

module.exports = {
    createTicketValidator,
    getTicketsValidator,
    sendMessageValidator
}