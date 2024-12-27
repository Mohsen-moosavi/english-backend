const { body , param } = require("express-validator")

function createLevelValidator(){
    return [
        body('name').isString().withMessage("نام وارد شده معتبر نمی باشد.").isLength({max:20}).withMessage("نام وارد شده باید حداکثر 20 کاراکتر باشد.")
    ]
}


module.exports={
    createLevelValidator,
}