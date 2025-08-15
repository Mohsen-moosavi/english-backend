const { body, query } = require("express-validator")

function createOffValidator(){
    return [
        body('percent').isNumeric().withMessage("درصد تخفیف وارد شده معتبر نمی باشد.").isFloat({min : 1 ,max:100}).withMessage("درصد وارد شده باید بین 1 تا 100 باشد."),
        body('expire').isISO8601().withMessage("تاریخ انقضاء وارد شده معتبر نمی باشد.").custom(value=>{
            const inputDate = new Date(value);
            const today = new Date();

            today.setHours(0,0,0,0)
            inputDate.setHours(0,0,0,0)

            if(inputDate < today){
                throw new Error("تاریخ وارد شده، نمی تواند از امروز قبل تر باشد.")
            }else{
                return true;
            }
        }),
        body('times').isNumeric().withMessage("تعداد دفعات مجاز استفاده معتبر نمی باشد.").isFloat({min:1,max:1000}).withMessage("تعداد دفعات مجاز باید بین 1 تا 1000 باشد.").optional(),
        body('public').isNumeric().withMessage("فیلد مشخص کننده عمومی بودن، معتبر نمی باشد.").isIn([0,1]).withMessage("فیلد مشخص کننده عمومی بودن، معتبر نمی باشد."),
        body('courses').isArray().withMessage("دوره های وارد شده جهت اعمال تخفیف، معتبر نمی باشند."),
        body('courses.*').isNumeric().withMessage("مشخصه دوره ها، معتبر نمی باشند.").optional(),
        body('code').isString().withMessage("کد تخفیف، معتبر نمی باشند.").custom((value , {req})=>{
            if(req.body.public){
                return true
            }else{
                if(value===''){
                    throw new Error("وادر کردن کد تخفیف، الزامی است.")
                }
                if(value.length < 8){
                    throw new Error("کد تخفیف، حداقل باید 8 کاراکتر باشد.")
                }
                return true
            }
        }).optional(),
        body('isForAllCourses').isBoolean().withMessage("فیلد مشخص کننده انتخاب تمامی دوره ها، معتبر نمی باشد.")
    ]
}

function getOffValidator(){
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query("search").isString().withMessage('پارامتر search معتبر نمی باشد.'),
        query("orderStatus").isString().withMessage('وضعیت مرتب سازی معتبر نمی باشد.').isIn(['maxPercent','minPercent','maxExpire','minExpire','expired','maxTimes','minTimes','maxRemaining','minRemaining','infinity','finishRemaining']).optional(),
        query("publicStatus").isString().withMessage('پارامتر publicStatus معتبر نمی باشد.').isIn(['public','private']).optional(),
    ]
}

function applyCodeValidator(){
    return [
        body('code').isString().withMessage("کد وارد شده معتبر نمی باشد.").isLength({min:8}).withMessage("کد تخفیف، حداقل باید 8 کاراکتر باشد.")]
}

module.exports={
    createOffValidator,
    getOffValidator,
    applyCodeValidator
}