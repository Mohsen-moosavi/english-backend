const { query } = require("express-validator")

function getAllCourseValidator(){
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query("searchWord").isString().withMessage('پارامتر جستوجو، معتبر نمی باشد.').optional(),
        query("category").isString().withMessage('پارامتر دسته بندی، معتبر نمی باشد.').isIn(['free','notFree','ease','medum','high','populare']).optional(),
    ]
}

function getAllBookValidator(){
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query("searchWord").isString().withMessage('پارامتر جستوجو، معتبر نمی باشد.').optional(),
        query("category").isString().withMessage('پارامتر دسته بندی، معتبر نمی باشد.').optional(),
    ]
}

module.exports = {
    getAllCourseValidator,
    getAllBookValidator
}