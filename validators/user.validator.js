const { query, body } = require("express-validator")

function getUsersValidator(){
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query("searchName").isString().withMessage('پارامتر name معتبر نمی باشد.').optional(),
        query("searchPhone").isString().withMessage('پارامتر phone معتبر نمی باشد.').optional(),
        query("roleStatus").isNumeric().withMessage('پارامتر role معتبر نمی باشد.').optional(),
        query("purchaseStatus").isString().withMessage('پارامتر purchase معتبر نمی باشد.').isIn(['max','min']).optional(),
        query("scoreStatus").isString().withMessage('پارامتر score معتبر نمی باشد.').isIn(['max','min']).optional(),
        query("levelStatus").isNumeric().withMessage('پارامتر level معتبر نمی باشد.').optional(),
        query("deletedUser").isNumeric().withMessage('پارامتر deletedUser معتبر نمی باشد.').optional(),
        query("scorePriority").isNumeric().withMessage('پارامتر scorePriority معتبر نمی باشد.').optional(),
    ]
}


function changeRoleValidator(){
    return [
        body("userId").isNumeric().withMessage('آی دی کاربر معتبر نمی باشد.'),
        body("roleId").isNumeric().withMessage('نقش انتخاب شده معتبر نمی باشد.'),
    ]
}

module.exports = {
    getUsersValidator,
    changeRoleValidator
}