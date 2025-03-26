const { validationResult } = require("express-validator")
const { errorResponse, successResponse } = require("../../utils/responses")
const { findSalesByQuery } = require("../../utils/finder.util")
const { Course, User, Sale, UserCourses } = require("../../db")

const createSaleByAdmin = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { courseId, userId, price } = req.body;

        const course = await Course.findOne({ where: { id: courseId } })

        if (!course) {
            return errorResponse(res, 400, 'دوره مربوطه یافت نشد!')
        }

        const user = await User.findOne({ where: { id: userId } })

        if (!user) {
            return errorResponse(res, 400, 'کاربر مربوطه یافت نشد!')
        }

        const [,isNewItem] = await UserCourses.findOrCreate({
            where :{
                course_id : course.id,
                user_id : user.id
            }
        })

        if(!isNewItem){
            return errorResponse(res, 400, 'این دوره از قبل برای کاربر موجود است.')
        }

        const mainPrice = course.price;

        await Sale.create({
            price,
            mainPrice,
            off: ((mainPrice - price) > 0) ? (mainPrice - price) : 0,
            offPercent: (((mainPrice - price) > 0) && (mainPrice > 0)) ? (Math.round(((mainPrice - price) / mainPrice) * 100)) : 0,
            course_id: course.id,
            user_id: user.id,
            adminSaler: req.user.id
        })

        return successResponse(res, 200, 'دوره با موفقیت برای کاربر، خریداری شد!')

    } catch (error) {
        next(error)
    }
}

const getSales = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { items, count, totalPrice, error } = await findSalesByQuery(req)

        if (error) {
            return next(error)
        }

        return successResponse(res, 200, '', { sales: items, count, totalPrice })

    } catch (error) {
        next(error)
    }
}

const deleteSale = async (req, res, next) => {
    try {
        const { id } = req.params;

        const sale = await Sale.findOne({ where: { id } })

        if (!sale) {
            return errorResponse(res, 400, 'موردی جهت حذف کردن یافت نشد!')
        }

        if (sale.adminSaler) {
            return errorResponse(res, 400, 'نمی توانید این داده را حذف کنید!')
        }

        await sale.destroy();

        const { items, count, totalPrice, error } = await findSalesByQuery(req)

        if (error) {
            return next(error)
        }

        return successResponse(res,200,"اطلاعات خرید، با موفقیت حذف شد.",{ sales: items, count, totalPrice })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createSaleByAdmin,
    getSales,
    deleteSale
}