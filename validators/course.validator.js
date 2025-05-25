const { body, query } = require("express-validator")

function createCourseValidator(){
    return [
        body('name').isString().withMessage("عنوان وارد شده معتبر نمی باشد.").isLength({ min: 3 }).withMessage("عنوان وارد شده باید حداقل 3 کاراکتر باشد."),
        body('shortDescription').isString().withMessage("توضیحات کوتاه وارد شده معتبر نمی باشد.").isLength({ min: 50 }).withMessage("توضیحات کوتاه حداقل باید 50 کاراکتر باشد."),
        body('longDescription').isString().withMessage('متن وارد شده معتبر نمی باشد.').isLength({ min: 300 }).withMessage("متن کامل توضیحات حداقل باید 300 کاراکتر باشد."),
        body('slug').isString().withMessage('slug وارد شده معتبر نمی باشد.').isLength({ min: 8 }).withMessage("slug دوره حداقل باید 8 کاراکتر باشد."),
        body('tags').isArray().withMessage('مقدار فرستاده شده به عنوان تگ ها، معتبر نمی باشد.').custom((value, { req }) => {
            if (value?.length < 1) {
                throw new Error('دوره باید حداقل یک تگ داشته باشد.')
            } else {
                return true
            }
        }),
        body('price').isNumeric().withMessage("مبلغ وارد شده معتبر نمی باشد."),
        body('videoLink').isString().withMessage("لینک ویدئو وارد شده معتبر نیست."),
        body('bookFileGroup').isString().withMessage('گروه کتاب وارد شده معتبر نمی باشد.'),
        body('bookCollectionId').isNumeric().withMessage('مجموعه کتاب وارد شده معتبر نمی باشد.'),
        body('teacher').isNumeric().withMessage('آی دی مدرس وارد شده معتبر نمی باشد.'),
        body('levelId').isNumeric().withMessage('آی دی سطح وارد شده معتبر نمی باشد.')
    ]
}

function getCoursesValidator(){
    return [
        query('limit').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 1}).withMessage("تعداد وارد شده باید بیشتر از 1 باشد."),
        query('offset').isNumeric().withMessage("تعداد وارد شده معتبر نمی باشد.").isFloat({min : 0}).withMessage("تعداد وارد شده باید بیشتر از 0 باشد."),
        query("search").isString().withMessage('پارامتر search معتبر نمی باشد.'),
        query("status").isString().withMessage('پارامتر status معتبر نمی باشد.').isIn(['completed','notCompleted']).optional(),
        query("teacherId").isNumeric().withMessage('پارامتر teacherId معتبر نمی باشد.').optional(),
        query("bookId").isNumeric().withMessage('پارامتر bookId معتبر نمی باشد.').optional(),
        query("levelId").isNumeric().withMessage('پارامتر levelId معتبر نمی باشد.').optional(),
        query("priceStatus").isString().withMessage('پارامتر priceStatus معتبر نمی باشد.').isIn(['free','max','min']).optional(),
        query("scoreStatus").isInt().withMessage('پارامتر scoreStatus معتبر نمی باشد.').isIn([1,2,3,4,5]).optional(),
        query("userId").isInt().withMessage('پارامتر userId معتبر نمی باشد.').optional(),
        query("tagId").isInt().withMessage('پارامتر tagId معتبر نمی باشد.').optional(),
    ]
}


module.exports = {
    createCourseValidator,
    getCoursesValidator,
}