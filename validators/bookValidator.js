const { body, param, query } = require("express-validator")

function createBookValidator() {
    return [
        body('name').isString().withMessage("عنوان وارد شده معتبر نمی باشد.").isLength({ min: 3 }).withMessage("عنوان وارد شده باید حداقل 3 کاراکتر باشد."),
        body('shortDescription').isString().withMessage("توضیحات کوتاه وارد شده معتبر نمی باشد.").isLength({ min: 50 }).withMessage("توضیحات کوتاه حداقل باید 50 کاراکتر باشد."),
        body('longDescription').isString().withMessage('متن وارد شده معتبر نمی باشد.').isLength({ min: 30 }).withMessage("متن مقاله حداقل باید 300 کاراکتر باشد."),
        body('slug').isString().withMessage('slug وارد شده معتبر نمی باشد.').isLength({ min: 8 }).withMessage("slug مقاله حداقل باید 8 کاراکتر باشد."),
        body('ageGrate').isString().withMessage('رده سنی وارد شده معتبر نمی باشد.').isLength({ min: 3 }).withMessage("رده سنی مجموعه حداقل باید 3 کاراکتر باشد."),
        body('grate').isString().withMessage('سطح وارد شده معتبر نمی باشد.').isLength({ min: 3 }).withMessage("سطح مجموعه حداقل باید 3 کاراکتر باشد."),
        body('tags').isArray().withMessage('مقدار فرستاده شده به عنوان تگ ها، معتبر نمی باشد.').custom((value, { req }) => {
            if (value?.length < 1) {
                throw new Error('مقاله باید حداقل یک تگ داشته باشد.')
            } else {
                return true
            }
        }),
        body('links').isString().withMessage("لینک وارد شده معتبر نمی باشد.").isLength({ min: 1 }).withMessage("حداقل یک لینک وارد کنید.")
    ]
}

function deleteBookWhitoutGettingAllValidator(){
    return [
        param('id').isNumeric().withMessage("آی دی وارد شده معتبر نیست.")
    ]
}

function getAllBooksValidator(){
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
    ]
}


module.exports = {
    createBookValidator,
    deleteBookWhitoutGettingAllValidator,
    getAllBooksValidator,
}