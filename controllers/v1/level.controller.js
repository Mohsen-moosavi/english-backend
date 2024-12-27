const { validationResult } = require("express-validator");
const { Level } = require("../../db");
const { successResponse, errorResponse } = require("../../utils/responses");

const createLevel = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
          return errorResponse(res, 400, validationError.errors[0].msg)
        }
    
        const { name } = req.body;

        await Level.create({name});

        const levels = await Level.findAll();

        return successResponse(res,201,'سطح جدید با موفقیت ایجاد شد.' ,{levels})
    } catch (error) {
        next(error)
    }
}

const getLevels = async (req,res,next)=>{
    try {
        const levels = await Level.findAll();

        return successResponse(res,200 ,'', {levels})
    } catch (error) {
        next(error)
    }
}

const deleteLevel = async (req,res,next)=>{
    try {

        const {id} = req.params 
        if(!id){
            return errorResponse(res,400 ,'آی دی سطح اجباری است')
        }
        const deletedLevel = await Level.findOne({
            where : {id}
        })

        if(!deletedLevel){
            return errorResponse(res,400 ,'موردی جهت حذف یافت نشد!')
        }

        await deletedLevel.destroy()

        const levels = await Level.findAll();

        return successResponse(res,200 ,'سطح با موفقیت حذف شد.',{levels})
    } catch (error) {
        next(error)
    }
}

const updateLevel = async (req,res,next)=>{
    try {
        const {id} = req.params 
        if(!id){
            return errorResponse(res,400 ,'آی دی سطح اجباری است')
        }

        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
          return errorResponse(res, 400, validationError.errors[0].msg)
        }
    
        const { name } = req.body;

        const updatedLevel = await Level.findOne({where : {id}})

        if(!updatedLevel){
            return errorResponse(res,400 ,'موردی جهت ویرایش یافت نشد!')
        }

        updatedLevel.name = name
        await updatedLevel.save()

        const levels = await Level.findAll();
        return successResponse(res,200 ,'سطح با موفقیت ویرایش شد.',{levels})
    } catch (error) {
        next(error)
    }
}

module.exports={
    createLevel,
    getLevels,
    deleteLevel,
    updateLevel
}