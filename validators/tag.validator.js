const { body, query } = require("express-validator")

function createTagValidator(){
    return [
        body('name').isString().withMessage("نام وارد شده معتبر نمی باشد.").isLength({min : 2 ,max:50}).withMessage("نام وارد شده باید بین 2 تا 50 کاراکتر باشد."),
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد.")
    
    ]
}


function getTagValidator(){
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
    ]
}


module.exports={
    createTagValidator,
    getTagValidator
}