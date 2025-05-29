const { validationResult } = require("express-validator")
const { errorResponse, successResponse } = require("../../utils/responses")
const { findSalesByQuery } = require("../../utils/finder.util")
const { Course, User, Sale, UserCourses,UserBag, Off } = require("../../db")
const moment = require("moment-jalaali")
const { Op } = require("sequelize")

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
            shamsi_month : moment(Date.now()).format('jYYYY-jMM'),
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

const createSale = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { offCode, price } = req.body;
        const userId = req.user.id;

        let userBagOff;
        if(offCode){
            userBagOff = await UserBag.findOne({
                where : {user_id: userId},
                attributes : ['course_id'],
                include:[
                    {model:Course,attributes:['price'],include:[
                        {model: Off , attributes:['id','percent'] ,where:{public : 0,code:offCode}, required:true},
                    ]}
                ],
            })
            if(!userBagOff){
                return errorResponse(res,400,"کد تخفیف معتبر نمی باشد!")
            }
        }
        
        const userBagWhereCondition = {user_id: userId }
        if(userBagOff){
            userBagWhereCondition.course_id = {[Op.ne] : userBagOff.course_id}
        }
        const userBag = await UserBag.findAll({
            where : userBagWhereCondition,
            attributes : [],
            include:[
              {model:Course,attributes:['id','price'],include:[
                {model: Off , attributes:['id','percent'] ,where:{public : 1}, required:false},
              ]}
            ],
        })


        let totalPrice = 0;
        userBag.forEach(item=>{
          if(item.course.offs.length && item.course.offs[0].percent){
            totalPrice += (Number(item.course.price) - Math.round((Number(item.course.price) * Number(item.course.offs[0].percent)) / 100));
          }else{
            totalPrice += Number(item.course.price)
          }
        })

        if(userBagOff){
            totalPrice += (Number(userBagOff.course.price) - Math.round((Number(userBagOff.course.price) * Number(userBagOff.course.offs[0].percent)) / 100));
        }
      
        if(price !== totalPrice){
            return errorResponse(res,400,"مبلغ پرداخت شده، با مبلغ دوره ها، برابر نیست!")
        }

        let createdUserCourses = userBag.map((item) =>{
            UserCourses.create({
                course_id : item.course.id,
                user_id : userId
        })
        });

        if(userBagOff){
            await UserCourses.create({
                course_id : userBagOff.course.id,
                user_id : userId
            })
        }

        createdUserCourses = await Promise.all(createdUserCourses);

        const salesItem = []
        userBag.forEach((item,i)=>{
            const price = (item.course.offs.length && item.course.offs[0].percent) ? (Number(item.course.price) - Math.round((Number(item.course.price) * Number(item.course.offs[0].percent)) / 100)) : item.course.price;
            const mainPrice = item.course.price
            salesItem.push(
                Sale.create({
                    price,
                    mainPrice,
                    off: ((mainPrice - price) > 0) ? (mainPrice - price) : 0,
                    offPercent: (((mainPrice - price) > 0) && (mainPrice > 0)) ? (Math.round(((mainPrice - price) / mainPrice) * 100)) : 0,
                    course_id: item.course.id,
                    shamsi_month : moment(Date.now()).format('jYYYY-jMM'),
                    user_id: userId
                })
            )
        })

        await Promise.all(salesItem);

        if(userBagOff){
            const saleOffprice = (userBagOff.course.offs.length && userBagOff.course.offs[0].percent) ? (Number(userBagOff.course.price) - Math.round((Number(userBagOff.course.price) * Number(userBagOff.course.offs[0].percent)) / 100)) : userBagOff.course.price;
            const mainSaleOffPrice = userBagOff.course.price
            await Sale.create({
                price : saleOffprice,
                mainPrice: mainSaleOffPrice,
                off: ((mainSaleOffPrice - saleOffprice) > 0) ? (mainSaleOffPrice - saleOffprice) : 0,
                offPercent: (((mainSaleOffPrice - saleOffprice) > 0) && (mainSaleOffPrice > 0)) ? (Math.round(((mainSaleOffPrice - saleOffprice) / mainSaleOffPrice) * 100)) : 0,
                course_id: userBagOff.course.id,
                shamsi_month : moment(Date.now()).format('jYYYY-jMM'),
                user_id: userId
            })
        }

        await UserBag.destroy({
            where:{
                user_id : userId
            }
        })

        if(offCode){
            const off = await Off.findOne({
                where:{
                    code : offCode
                }
            })
            off.remainingTimes = off.remainingTimes - 1;
            await off.save()
        }



        return successResponse(res, 200, 'خرید دوره با موفقیت انجام شد.')

    } catch (error) {
        next(error)
    }
}

module.exports = {
    createSaleByAdmin,
    getSales,
    deleteSale,
    createSale
}