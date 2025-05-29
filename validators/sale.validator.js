const { query, body } = require("express-validator")

function getSalesValidator() {
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({ min: 1 }).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({ min: 0 }).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query("search").isString().withMessage('پارامتر search معتبر نمی باشد.'),
        query("status").isString().withMessage('پارامتر وضعیت معتبر نمی باشد.').isIn(['hasOff', 'hasNotOff']).optional(),
        query("saleStatus").isString().withMessage('پارامتر وضعیت خرید معتبر نمی باشد.').isIn(['admin', 'user']).optional(),
        query("priceStatus").isString().withMessage('پارامتر وضعیت مبلغ معتبر نمی باشد.').isIn(['free', 'notFree']).optional(),
        query('userId').isNumeric().withMessage('آی دی کابر معتبر نمی باشد.').optional(),
        body('startDate').isISO8601().withMessage("تاریخ شروع وارد شده معتبر نمی باشد.").optional().custom(value => {
            if(value==='' || value===null){
                return true
            }
            const inputDate = new Date(value);
            const today = new Date();

            today.setHours(0, 0, 0, 0)
            inputDate.setHours(0, 0, 0, 0)

            if (inputDate > today) {
                throw new Error("تاریخ شروع، نمی تواند از امروز به بعد باشد.")
            } else {
                return true;
            }
        }),
        body('endDate').isISO8601().withMessage("تاریخ پایان وارد شده معتبر نمی باشد.").optional().custom((value,{req}) => {
            if(value==='' || value===null || !req.body?.startDate){
                return true
            }

            const inputDate = new Date(value);
            const startDate = new Date(req.body.startDate);

            startDate.setHours(0, 0, 0, 0)
            inputDate.setHours(0, 0, 0, 0)

            if (inputDate < startDate) {
                throw new Error("تاریخ پایان، نمی تواند از تاریخ شروع، عقب تر باشد.")
            } else {
                return true;
            }
        }),
    ]
}

function createSaleByAdminValidator(){
    return [
        body('courseId').isNumeric().withMessage('آی دی دوره معتبر نمی باشد.'),
        body('userId').isNumeric().withMessage('آی دی کابر معتبر نمی باشد.'),
        body('price').isNumeric().withMessage("مبلغ وارد شده معتبر نمی باشد."),
    ]
}

function createSaleByUserValidator(){
    return [
        body('price').isNumeric().withMessage("مبلغ وارد شده معتبر نمی باشد."),
        body('offCode').isNumeric().withMessage("کد تخفیف شده معتبر نمی باشد.").optional()
    ]
}

module.exports = {
    getSalesValidator,
    createSaleByAdminValidator,
    createSaleByUserValidator
}