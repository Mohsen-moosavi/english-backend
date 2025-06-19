const { query, body, param } = require("express-validator")

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
        query("banStatus").isString().withMessage('پارامتر banStatus معتبر نمی باشد.').isIn(['ban','notBan']).optional(),
    ]
}


function changeRoleValidator(){
    return [
        body("userId").isNumeric().withMessage('آی دی کاربر معتبر نمی باشد.'),
        body("roleId").isNumeric().withMessage('نقش انتخاب شده معتبر نمی باشد.'),
    ]
}

function banUserValidator(){
    return [
        param("userId").isNumeric().withMessage('آی دی کاربر معتبر نمی باشد.'),
        body("isBan").isBoolean().withMessage('حالت وارد شده معتبر نمی باشد.'),
        body("description").isString().withMessage('توضیحات وارد شده معتبر نمی باشد.').optional(),
    ]
}

function editInfoFromUsersideValidator(){
    return[
        body('name').isString().isLength({min:3 , max:20}).withMessage("نام باید بین 3 تا 20 کاراکتر باشد."),
        body('username').isString().isLength({min : 3 , max:20}).withMessage("نام کاربری باید بین 3 تا 20 کاراکتر باشد."),
        body('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/).withMessage("رمز عبور باید حداقل 8 کاراکتر و دارای حرف بزرگ و کوچک و عدد باشد.").optional(),
        body('confirmPassword').custom((value , {req})=>{
            if(req.body.password){
                if(value !== req.body.password){
                    throw new Error('گذرواژه و تکرار گذرواژه، با هم یکسان نیستند.')
                } else{
                    return true
                }
            }else{
                return true
            }
        })
    ]
}

function userBagValidator(){
    return [
        body("courseId").isNumeric().withMessage('آی دی دوره معتبر نمی باشد.'),
    ]
}


module.exports = {
    getUsersValidator,
    changeRoleValidator,
    editInfoFromUsersideValidator,
    userBagValidator,
    banUserValidator
}