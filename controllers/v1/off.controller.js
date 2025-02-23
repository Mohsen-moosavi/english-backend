const { validationResult } = require("express-validator")
const { errorResponse, successResponse } = require("../../utils/responses")
const { Off, Course } = require("../../db")
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

module.exports = {
    createOff,
    getOffs,
    deleteOff
}