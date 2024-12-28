const { validationResult } = require("express-validator");
const { Tag } = require("../../db");
const { errorResponse, successResponse } = require("../../utils/responses");
const { Op } = require("sequelize");

const createTag = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
          return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const {limit , offset} = req.query
    
        const { name } = req.body;

        const newTag = await Tag.findOrCreate({where : {name}});

        console.log('newTag=====>',newTag , newTag[1])

        const {rows :tags,count} = await Tag.findAndCountAll({limit:Number(limit)  , offset : Number(offset) ,order: [['id' , 'DESC']] , raw : true});

        if(newTag[1]){
            return successResponse(res,201,'تگ جدید با موفقیت ایجاد شد.' ,{tags , count})
        }else{
            return successResponse(res,200,'تگ از قبل وجود دارد!' ,{tags , count})
        }
    } catch (error) {
        next(error)
    }
}

const getTags = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
          return errorResponse(res, 400, validationError.errors[0].msg)
        }
        const {limit , offset , search} = req.query

        
        const {rows : tags , count} = await Tag.findAndCountAll({where:{name:{[Op.like] : `%${search}%`}},limit:Number(limit)  , offset : Number(offset) ,order: [['id' , 'DESC']] , raw : true});

        return successResponse(res,200 ,'', {tags , count})
    } catch (error) {
        next(error)
    }
}

const deleteTag = async (req,res,next)=>{
    try {
        const {id} = req.params 
        if(!id){
            return errorResponse(res,400 ,'آی دی تگ اجباری است')
        }
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
          return errorResponse(res, 400, validationError.errors[0].msg)
        }
        const {limit , offset , search} = req.query

        const deletedTag = await Tag.findOne({
            where : {id}
        })

        if(!deletedTag){
            return errorResponse(res,400 ,'موردی جهت حذف یافت نشد!')
        }

        await deletedTag.destroy()

        const {rows : tags , count} = await Tag.findAndCountAll({where:{name:{[Op.like] : `%${search}%`}},limit:Number(limit)  , offset : Number(offset) ,order: [['id' , 'DESC']] , raw : true});

        return successResponse(res,200 ,'تگ با موفقیت حذف شد.',{tags , count})
    } catch (error) {
        next(error)
    }
}

const updateTag = async (req,res,next)=>{
    try {
        const {id} = req.params 
        if(!id){
            return errorResponse(res,400 ,'آی دی تگ اجباری است')
        }

        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
          return errorResponse(res, 400, validationError.errors[0].msg)
        }
    
        const {limit , offset , search} = req.query
        const {name} = req.body

        const updatedTag = await Tag.findOne({where : {id}})

        if(!updatedTag){
            return errorResponse(res,400 ,'موردی جهت ویرایش یافت نشد!')
        }

        updatedTag.name = name
        await updatedTag.save()

        const {rows : tags , count} = await Tag.findAndCountAll({where:{name:{[Op.like] : `%${search}%`}},limit:Number(limit)  , offset : Number(offset) ,order: [['id' , 'DESC']] , raw : true});

        return successResponse(res,200 ,'سطح با موفقیت ویرایش شد.',{tags, count})
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createTag,
    getTags,
    deleteTag,
    updateTag
}

