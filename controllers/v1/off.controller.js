const { validationResult } = require("express-validator")
const { errorResponse, successResponse } = require("../../utils/responses")
const { Off, Course, UserBag } = require("../../db")
const { NUMBER, Op } = require("sequelize")
const { findOffsByQuery } = require("../../utils/finder.util")

const createOff = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)
    
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }
        
        const {percent, expire, times, public, courses, code ,isForAllCourses} = req.body;


        let allCoursesId =[];

        let freeCourses =await Course.findAll({where : {price : 0},attributes:['id'] , raw : true});
        freeCourses = freeCourses.map(course=>course.id)
        let coursesIdWithOff =await Off.findAll({attributes:['course_id'] , raw : true})
        coursesIdWithOff = [...coursesIdWithOff.map(off=>off.course_id) , ...freeCourses]


        if(isForAllCourses){
            allCoursesId = await Course.findAll({where : {id : {[Op.notIn]:coursesIdWithOff}},attributes : ['id'] , raw : true})
        }
        
        const newCoursesId = courses?.filter(id=> !coursesIdWithOff.includes(id))


        const mainCoursesId = isForAllCourses ? allCoursesId.map(course=>course.id) : newCoursesId;

        if(!mainCoursesId.length){
            return errorResponse(res,400,'دوره ای جهت اعمال تخفیف یافت نشد.')
        }

        let newOffsArray = mainCoursesId.map(id=>{return {percent ,expire, public : Boolean(Number(public)) , course_id : id , creator_id : req.user.id}});
        if(Number(times) >=1){
            newOffsArray = newOffsArray.map(obj=>{return {...obj , times : Number(times) , remainingTimes : Number(times)}})
        }
        if(Number(public)===0){
            newOffsArray = newOffsArray.map(obj=>{return {...obj , code}})
        } 

        const newOffs = await Off.bulkCreate(newOffsArray)


        successResponse(res,201,'تخفیف ها با موفقیت اضافه شدند.')

    } catch (error) {
        next(error)
    }
}

const getOffs = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)
    
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const {items,count,error} = await findOffsByQuery(req);

        if(error){
            return next(error)
          }
      
        return successResponse(res, 200, '', { offs : items, count });

    } catch (error) {
        next(error)
    }
}

const deleteOff = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)
    
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const {id} = req.params;

        const deletedOff = await Off.findOne({where : {id}})

        if(!deletedOff){
            return errorResponse(res,400,"موردی جهت حذف یافت نشد.")
        }

        await deletedOff.destroy()

        const {items,count,error} = await findOffsByQuery(req);

        if(error){
            return next(error)
          }
      
        return successResponse(res, 200, '', { offs : items, count });

    } catch (error) {
        next(error)
    }
}

const applyOffForUserBag = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)
    
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const code = req.body.code;
        const userId = req.user.id;

        const userBagOff = await UserBag.findOne({
            where : {user_id: userId},
            attributes : ['course_id'],
            include:[
              {model:Course,attributes:['price'],include:[
                {model: Off , attributes:['id','percent','remainingTimes','expire'] ,where:{public : 0,code}, required:true},
              ]}
            ],
        })
        if(!userBagOff){
            return errorResponse(res,400,"کد تخفیف معتبر نمی باشد!")
        }
        if(userBagOff.course.offs[0].expire < new Date().toISOString().split('T')[0]){
            return errorResponse(res,400,'کد تخفیف، منقضی شده است.')
        }
        if(userBagOff.course.offs[0].remainingTimes < 1){
            return errorResponse(res,400,'تعداد دفعات مجاز برای استفاده از این کد، به پایان رسیده است.')
        }

        const userBag = await UserBag.findAll({
            where : {user_id: userId , course_id : {[Op.ne] : userBagOff.course_id}},
            attributes : [],
            include:[
              {model:Course,attributes:['id','price'],include:[
                {model: Off , attributes:['id','percent'] ,where:{public : 1}, required:false},
              ]}
            ],
        })

        let totalMainPrice = 0;
        let totalPrice = 0;
        let totalOff = 0;
        userBag.forEach(item=>{
          totalMainPrice += Number(item.course.price)
          if(item.course.offs.length && item.course.offs[0].percent){
            totalPrice += (Number(item.course.price) - Math.round((Number(item.course.price) * Number(item.course.offs[0].percent)) / 100));
            totalOff += Math.round((Number(item.course.price) * Number(item.course.offs[0].percent)) / 100)
          }else{
            totalPrice += Number(item.course.price)
          }
        })

        totalMainPrice += Number(userBagOff.course.price);
        totalPrice += (Number(userBagOff.course.price) - Math.round((Number(userBagOff.course.price) * Number(userBagOff.course.offs[0].percent)) / 100));
        totalOff += Math.round((Number(userBagOff.course.price) * Number(userBagOff.course.offs[0].percent)) / 100)
      
        return successResponse(res, 200, '', {totalMainPrice,totalPrice,totalOff});

    } catch (error) {
        next(error)
    }
}

module.exports = {
    createOff,
    getOffs,
    deleteOff,
    applyOffForUserBag
}