const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../../utils/responses");
const { Article, Tag, TagArticles, User, db, Course, Comment } = require("../../db");
const { Op, where, QueryTypes } = require("sequelize");
const path = require('path');
const configs = require("../../configs");
const moment = require('moment-jalaali');
const { default: slugify } = require("slugify");
const { removeImage } = require("../../utils/fs.utils");
const { findArticlesByQuery } = require("../../utils/finder.util");
const { useExtraFileHandler, removeExtraFileHandler } = require("../../utils/extrafiles.utils");

const createArticle = async(req,res,next)=>{
    try {

        const validationError = validationResult(req)
        const cover = req.file;

        if (validationError?.errors && validationError?.errors[0]) {
            removeImage(cover.filename)
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
            removeImage(cover.filename)
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
        await useExtraFileHandler(longDescription,'articles')

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
        
        const {items , count , error} = await findArticlesByQuery(req)

        if(error){
            next(error)
        }

        return successResponse(res,200 ,'', {articles : items , count})
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
            cover && removeImage(cover.filename)
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
            cover && removeImage(cover.filename)
            return errorResponse(res,409,'موردی جهت ویرایش یافت نشد!')
        }

        if (article.title !== title || article.slug !== slugifyedSlug) {
            const oldArticle = await Article.findOne({ where:  {id : {[Op.ne] : id} , [Op.or]: {title, slug: slugifyedSlug } }})
            if(oldArticle){
              cover && removeImage(cover.filename)
              if(oldArticle.title === title){
                return errorResponse(res, 409, 'مقاله ای با این عنوان، از قبل وجود دارد!')
              }
              return errorResponse(res, 409, 'مقاله ای با این slug، از قبل وجود دارد!')
            }
        }

        cover && removeImage(article.cover?.split('/')?.reverse()[0])
        await removeExtraFileHandler(article.longDescription,'articles')

        article.title = title
        article.slug = slugifyedSlug
        article.shortDescription = shortDescription
        article.longDescription = longDescription
        article.isPublished = isPublished
        article.links = links
        cover && (article.cover = `${configs.domain}/public/images/${cover.filename}`)
        await article.save()

        await useExtraFileHandler(longDescription,'articles')

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

        const deletedArticle = await Article.findOne({
            where : {id}
        })

        if(!deletedArticle){
            return errorResponse(res,400 ,'موردی جهت حذف یافت نشد!')
        }

        removeImage(deletedArticle.cover?.split('/')?.reverse()[0])
        await removeExtraFileHandler(deletedArticle.longDescription,'articles')

        await deletedArticle.destroy()

        const {items , count , error} = await findArticlesByQuery(req)

        if(error){
            next(error)
        }

        return successResponse(res,200 ,'مقاله با موفقیت حذف شد.',{articles : items , count})
    } catch (error) {
        next(error)
    }
}

const getLastArticles = async (req,res,next)=>{
    try {
        const articles = await Article.findAll({
            limit : 6,
            attributes : ['id','title','shortDescription','cover','slug','created_at'],
            include : [
                {model:User , attributes:['id','name'] , paranoid:false}
            ]
        })

        const lastArticles = articles.map(item =>({
            id: item.id,
            title: item.title,
            cover: item.cover,
            shortDescription: item.shortDescription.slice(0,150),
            slug: item.slug,
            author: item.user?.name,
            created_at : moment(item.created_at).format('jYYYY-jMM-jDD'),
            authorId: item.user?.id
        }))

        successResponse(res,200,'',{articles : lastArticles})
    } catch (error) {
        next(error)
    }
}

const getRelatedArticlesToCourse = async (req, res, next) => {
    try {
        const { slug } = req.params
  
        const mainCourse = await Course.findOne({
          where:{slug},
          include:[{model:Tag , attributes:['id']}]
        })
        const tagIds = mainCourse.tags.map(tag=>tag.id)

        const results = await db.query(
            `SELECT 
              a.id,
              a.title,
              a.slug,
              a.cover,
              COUNT(t.id) AS matchCount
            FROM articles a
            JOIN tags_articles ta ON a.id = ta.article_id
            JOIN tags t ON t.id = ta.tag_id
            WHERE t.id IN (:tagIds)
            GROUP BY a.id
            ORDER BY matchCount DESC
            LIMIT 5`
          , {
            replacements: { tagIds },
            type: QueryTypes.SELECT
          });

          const relatedType1 = [...results]
          let relatedType2 = []

          
          if(relatedType1.length < 5){
            const type1Ids = relatedType1.map(article=>article.id)

            relatedType2 = await Article.findAll({
              attributes:['id','title','slug','cover'],
              order: [['id','DESC']],
              where:{id : {[Op.notIn] : type1Ids}},
              limit: (5 - (relatedType1.length))
            })
          }

        return successResponse(res,200,'',{articles:[...relatedType1,...relatedType2]})
    } catch (error) {
      next(error)
    }
  }

  const getArticleInfo = async (req,res,next) => {
    try {
        const {slug} = req.params;

        const article = await Article.findOne({
            where: {slug},
            attributes:{exclude:['author']},
            include:[
                {model: User, attributes:['id','name'],params:false},
                {model: Tag, attributes:['name'], through: { attributes: [] }},
            ]
        })

        if(!article){
          return errorResponse(res,404,'مقاله یافت نشد!')
        }



        return successResponse(res,200,'',{article})
    } catch (error) {
        next(error)
    }
  }

  const getRelatedArticlesToArticle = async (req, res, next) => {
    try {
        const { slug } = req.params
  
        const mainArticle = await Article.findOne({
          where:{slug},
          include:[{model:Tag , attributes:['id']}]
        })
        const tagIds = mainArticle.tags.map(tag=>tag.id)

        let relatedType1 = []
        let relatedType2 = []

        if(tagIds.length){
          const results = await db.query(
              `SELECT 
                a.id,
                a.title,
                a.slug,
                a.cover,
                COUNT(t.id) AS matchCount
              FROM articles a
              JOIN tags_articles ta ON a.id = ta.article_id
              JOIN tags t ON t.id = ta.tag_id
              WHERE t.id IN (:tagIds) AND a.id != :mainArticleId
              GROUP BY a.id
              ORDER BY matchCount DESC
              LIMIT 5`
            , {
              replacements: { tagIds , mainArticleId : mainArticle.id },
              type: QueryTypes.SELECT
            });
  
            relatedType1 = [...results]
        }
        
          if(relatedType1.length < 5){
            const type1Ids = relatedType1.map(article=>article.id)
            relatedType2 = await Article.findAll({
              attributes:['id','title','slug','cover'],
              order: [['id','DESC']],
              where:{id : {[Op.notIn] : [mainArticle.id,...type1Ids]}},
              limit: (5 - (relatedType1.length))
            })
          }

        return successResponse(res,200,'',{articles:[...relatedType1,...relatedType2]})
    } catch (error) {
      next(error)
    }
  }

  const getRelatedArticlesToBook = async (req, res, next) => {
    try {

      const articles = await Article.findAll({
        limit:5,
        order:[['id','DESC']],
        attributes:['id','title','slug','cover']
      })

        return successResponse(res,200,'',{articles})
    } catch (error) {
      next(error)
    }
  }


module.exports = {
    createArticle,
    getArticles,
    getArticle,
    updateArticle,
    deleteArticle,
    getLastArticles,
    getRelatedArticlesToCourse,
    getArticleInfo,
    getRelatedArticlesToArticle,
    getRelatedArticlesToBook
}