const { Op, Sequelize, QueryTypes } = require("sequelize");
const { Course, Book, db } = require("../../db");
const { validationResult } = require("express-validator");
const { errorResponse, successResponse } = require("../../utils/responses");

const searchAllCourses = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
          return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const {limit, offset, searchWord='', category} = req.query;
        
        const finderObj = {name : {[Op.like]: `%${searchWord}%`}}
        const orderArray = [['id','DESC']]

        (category === 'free') && (finderObj.price = 0);
        (category === 'notFree') && (finderObj.price = {[Op.ne] : 0});
        (category === 'populare') && (orderArray.unshift([Sequelize.literal('CAST(score AS DECIMAL(10,2))'),'DESC']));

        if(Number(category) && Number(category) > 0){
            finderObj.level_id = Number(category)
        }

        const courses = await Course.findAll({
            where:{}
        })
    } catch (error) {
        next(error)
    }
}

const searchAllBooks = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
          return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const {limit, offset, searchWord='', category} = req.query;

        console.log("search=========================>" , category)
        
        const whereConditions = [];
        const replacements = {
          searchWord: searchWord,
          limit: limit,
          offset: offset
        };
        
        if (category) {
          if(category === 'forChildren'){
            whereConditions.push(`b.forChildren = true`);
          }else{
            whereConditions.push(`b.grate = :category`);
            replacements.category = category;
          }
        }
        whereConditions.push(`b.name LIKE CONCAT('%', :searchWord, '%')`);
        
        const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';

        
        // کوئری گرفتن داده‌ها با شمارش course ها
        const sqlDataQuery = 
          `SELECT 
            b.id,
            b.name,
            b.slug,
            b.cover,
            COALESCE(COUNT(DISTINCT c.id), 0) AS courseCount
          FROM books b
          LEFT JOIN courses c ON c.book_collection_id = b.id
          ${whereClause}
          GROUP BY b.id
          ORDER BY b.id DESC
          LIMIT ${limit} OFFSET ${offset}`
        ;
        
        // کوئری شمارش کل نتایج (بدون limit و offset)
        const sqlCountQuery = 
          `SELECT COUNT(*) AS totalCount FROM (
            SELECT b.id
            FROM books b
            LEFT JOIN courses c ON c.book_collection_id = b.id
            ${whereClause}
            GROUP BY b.id
          ) AS subquery`
        ;
        
        // اجرا
        const [books, totalResult] = await Promise.all([
          db.query(sqlDataQuery, {
            replacements,
            type: QueryTypes.SELECT
          }),
          db.query(sqlCountQuery, {
            replacements,
            type: QueryTypes.SELECT
          })
        ]);
        
        const totalCount = totalResult[0].totalCount;

        return successResponse(res,200,'',{books,totalCount})
    } catch (error) {
        next(error)
    }
}

const allBooksategory = async (req,res,next)=>{
  try {

    const categories = await Book.findAll({
      attributes : [Sequelize.fn('DISTINCT',Sequelize.col('grate')),'grate'],
      raw:true
    })

    const categoryArray = categories.map(item=>item.grate)

      return successResponse(res,200,'',{categories:categoryArray})
  } catch (error) {
      next(error)
  }
}

module.exports = {
    searchAllCourses,
    searchAllBooks,
    allBooksategory
}