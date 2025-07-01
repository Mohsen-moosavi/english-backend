const { query, param } = require("express-validator")

function findExtrafileValidator() {
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({ min: 1 }).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({ min: 0 }).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query("books").isString().withMessage('پارامتر books معتبر نمی باشد.').isIn(['has', 'not']).optional(),
        query("articles").isString().withMessage('پارامتر articles معتبر نمی باشد.').isIn(['has', 'not']).optional(),
        query("courses").isString().withMessage('پارامتر courses معتبر نمی باشد.').isIn(['has', 'not']).optional(),
        ]
}

function deleteExtrafileValidator(){
    return [
        param("id").isNumeric().withMessage("آی دی وارد شده معتبر نیست.")
    ]
}

module.exports = {
    findExtrafileValidator,
    deleteExtrafileValidator
}