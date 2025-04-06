const { validationResult } = require("express-validator");
const { Tag, Book, Article, Course } = require("../../db");
const { errorResponse, successResponse } = require("../../utils/responses");
const { Op, Sequelize } = require("sequelize");
const { findTagsByQuery } = require("../../utils/finder.util");

const createTag = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
          return errorResponse(res, 400, validationError.errors[0].msg)
        }

    
        const { name } = req.body;

        const newTag = await Tag.findOrCreate({where : {name}});

        
        const {items , count , error} = await findTagsByQuery(req)
        if(error){
            return next(error)
        }
        if(newTag[1]){
            return successResponse(res,201,'تگ جدید با موفقیت ایجاد شد.' ,{tags : items , count})
        }else{
            return successResponse(res,200,'تگ از قبل وجود دارد!' ,{tags:items , count})
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
        
        const {items , count , error} = await findTagsByQuery(req)
        if(error){
            return next(error)
        }
        return successResponse(res,200 ,'', {tags : items , count})
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

        const deletedTag = await Tag.findOne({
            where : {id},
            attributes: [
              'id',
              'name',
              [Sequelize.fn('COALESCE',Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('books.id'))) , 0), 'bookCount'],
              [Sequelize.fn('COALESCE',Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('articles.id'))),0), 'articleCount'],
              [Sequelize.fn('COALESCE',Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('courses.id'))),0), 'courseCount'],
            ],
            include: [
                { model: Book, attributes: [], through: { attributes: [] }, required: false },
                { model: Article, attributes: [], through: { attributes: [] }, required: false },
                { model: Course, attributes: [], through: { attributes: [] }, required: false },
              ],
        })

        if(!deletedTag){
            return errorResponse(res,400 ,'موردی جهت حذف یافت نشد!')
        }

        console.log("tags==========================================>" , deletedTag.dataValues.bookCount, deletedTag.dataValues.articleCount, deletedTag.dataValues.courseCount)

        if(deletedTag.dataValues.bookCount > 0){
            return errorResponse(res,400,'این تگ، برای چند مجموعه کتاب به کار رفته و امکان حذف آن وجود ندارد!')
        }

        if(deletedTag.dataValues.articleCount > 0){
            return errorResponse(res,400,'این تگ، برای چند مقاله به کار رفته و امکان حذف آن وجود ندارد!')
        }

        if(deletedTag.dataValues.courseCount > 0){
            return errorResponse(res,400,'این تگ، برای چند دوره به کار رفته و امکان حذف آن وجود ندارد!')
        }

        await deletedTag.destroy()

        const {items , count , error} = await findTagsByQuery(req)
        if(error){
            return next(error)
        }
        return successResponse(res,200 ,'تگ با موفقیت حذف شد.',{tags: items , count})
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
    
        const {name} = req.body

        const updatedTag = await Tag.findOne({where : {id}})

        if(!updatedTag){
            return errorResponse(res,400 ,'موردی جهت ویرایش یافت نشد!')
        }

        updatedTag.name = name
        await updatedTag.save()

        const {items , count , error} = await findTagsByQuery(req)
        if(error){
            return next(error)
        }
        return successResponse(res,200 ,'تگ با موفقیت ویرایش شد.',{tags : items, count})
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

