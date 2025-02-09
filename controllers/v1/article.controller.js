const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../../utils/responses");
const { Article, Tag, TagArticles, User } = require("../../db");
const { Op, where } = require("sequelize");
const path = require('path');
const configs = require("../../configs");
const { default: slugify } = require("slugify");
const { removeFile } = require("../../utils/fs.utils");

const createArticle = async(req,res,next)=>{
    try {

        const validationError = validationResult(req)
        const cover = req.file;

        if (validationError?.errors && validationError?.errors[0]) {
            removeFile(cover.filename)
          return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const {title, shortDescription, longDescription, slug, isPublished, links, tags} = req.body;

        const slugifyedSlug = slugify(slug, {
            trim: true
          })

        const copyOfTags = tags[0].split(',')


        const [newArticle,isNewArticle] = await Article.findOrCreate({
            where:{[Op.or ] : [{title} , {slug : slugifyedSlug}]},
            defaults: {author : req.user.id, title , slug : slugifyedSlug , shortDescription , longDescription , isPublished , links  , cover : `${configs.domain}/public/images/${cover.filename}`},
            raw:true
        })



        if(!isNewArticle){
            removeFile(cover.filename)
            if(newArticle.title === title){
                return errorResponse(res,409,'مقاله ای با این عنوان، از قبل وجود دارد!')
            }else{
                return errorResponse(res,409,'مقاله ای با این slug، از قبل وجود دارد!')
            }
        }


        let createdTags = copyOfTags.map((tag) =>
            Tag.findOrCreate({ where: { name: tag.trim() } })
          );
        createdTags = await Promise.all(createdTags);

        await newArticle.addTags(createdTags.map((tag) => tag[0]));

        return successResponse(res,200,'مقاله با موفقیت ایجاد شد.')
    } catch (error) {
        next(error)
    }
}

const getArticles = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
          return errorResponse(res, 400, validationError.errors[0].msg)
        }
        const {limit , offset , search, status , writerId} = req.query

        const finderObject = {title:{[Op.like] : `%${search}%`}}
        writerId && (finderObject.author = writerId)
        status === 'published' && (finderObject.isPublished  = 1)
        status === 'draft' && (finderObject.isPublished  = 0)

        console.log("status=================>" , finderObject)
        
        const {rows : articles , count} = await Article.findAndCountAll(
            {where: finderObject,
            limit:Number(limit),
            offset : Number(offset),
            order: [['id' , 'DESC']],
            attributes : {exclude : ['author']},
            include : {model : User , attributes :['name']},
            raw : true});

        return successResponse(res,200 ,'', {articles , count})
    } catch (error) {
        next(error)
    }
}


const getArticle = async (req,res,next)=>{
    try {
        const {id} = req.params

        
        const article = await Article.findOne({ 
            where : {id},
            attributes : {exclude : ['author']},
            include : [
                {
                    model : User,
                    attributes :['name']
                },
                {
                    model : Tag,
                    attributes : ['name'],
                    through : {attributes : []}
                }
            ]
            ,
            
        });
        if(!article){
            errorResponse(res,404,"موردی یافت نشد!")
        }

        return successResponse(res,200 ,'', {article})
    } catch (error) {
        next(error)
    }
}


const updateArticle = async(req,res,next)=>{
    try {

        const validationError = validationResult(req)
        const cover = req.file;
        const {id} = req.params;

        if (validationError?.errors && validationError?.errors[0]) {
            cover && removeFile(cover.filename)
          return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const {title, shortDescription, longDescription, slug, isPublished, links, tags} = req.body;

        const slugifyedSlug = slugify(slug, {
            trim: true
          })

        const copyOfTags = tags[0].split(',')


        const article = await Article.findOne({
            where:{ id}
        })

        if(!article){
            cover && removeFile(cover.filename)
            return errorResponse(res,409,'موردی جهت ویرایش یافت نشد!')
        }

        if (article.title !== title || article.slug !== slugifyedSlug) {
            const oldArticle = await Article.findOne({ where:  {id : {[Op.ne] : id} , [Op.or]: {title, slug: slugifyedSlug } }})
            if(oldArticle){
              cover && removeFile(cover.filename)
              if(oldArticle.title === title){
                return errorResponse(res, 409, 'مقاله ای با این عنوان، از قبل وجود دارد!')
              }
              return errorResponse(res, 409, 'مقاله ای با این slug، از قبل وجود دارد!')
            }
        }

        cover && removeFile(article.cover?.split('/')?.reverse()[0])

        article.title = title
        article.slug = slugifyedSlug
        article.shortDescription = shortDescription
        article.longDescription = longDescription
        article.isPublished = isPublished
        article.links = links
        cover && (article.cover = `${configs.domain}/public/images/${cover.filename}`)
        await article.save()

        // const article = await Article.findOne({
        //     where:{[Op.or ] : [{title} , {slug : slugifyedSlug}]},
        //     defaults: { title , slug : slugifyedSlug , shortDescription , longDescription , isPublished , links  , cover : `${configs.domain}/public/images/${cover.filename}`},
        //     raw:true
        // })

        await TagArticles.destroy({where : {article_id : id}})

        let createdTags = copyOfTags.map((tag) =>
            Tag.findOrCreate({ where: { name: tag.trim() } })
          );
        createdTags = await Promise.all(createdTags);

        await article.addTags(createdTags.map((tag) => tag[0]));

        return successResponse(res,200,'مقاله با موفقیت ویرایش شد.')
    } catch (error) {
        next(error)
    }
}

const deleteArticle = async (req,res,next)=>{
    try {
        const {id} = req.params 
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
          return errorResponse(res, 400, validationError.errors[0].msg)
        }
        const {limit , offset , search, writerId , status} = req.query

        const deletedArticle = await Article.findOne({
            where : {id}
        })

        if(!deletedArticle){
            return errorResponse(res,400 ,'موردی جهت حذف یافت نشد!')
        }

        removeFile(deletedArticle.cover?.split('/')?.reverse()[0])

        await deletedArticle.destroy()

        
        const finderObject = {title:{[Op.like] : `%${search}%`}}
        writerId && (finderObject.author = writerId)
        status === 'published' && (finderObject.isPublished  = 1)
        status === 'draft' && (finderObject.isPublished  = 0)

        const {rows : articles , count} = await Article.findAndCountAll({
            where:finderObject,
            limit:Number(limit),
            attributes : {exclude : ['author']},
            include : {model : User , attributes :['name']},
            offset : Number(offset),
            order: [['id' , 'DESC']],
            raw : true});

        return successResponse(res,200 ,'مقاله با موفقیت حذف شد.',{articles , count})
    } catch (error) {
        next(error)
    }
}


module.exports = {
    createArticle,
    getArticles,
    getArticle,
    updateArticle,
    deleteArticle
}