const { Op, Sequelize, QueryTypes, where } = require("sequelize");
const { Course, Book, db, Level, User, Off, Article } = require("../../db");
const { validationResult } = require("express-validator");
const { errorResponse, successResponse } = require("../../utils/responses");
const moment = require('moment-jalaali');


const searchAllCourses = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { limit, offset, searchWord = '', category = '' } = req.query;

    const replacements = {
      searchWord,
      category,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    // کوئری دریافت لیست دوره‌ها
    const sqlDataQuery =
      `SELECT 
    c.id,
    c.name,
    c.cover,
    c.price,
    c.score,
    c.slug,
    u.id AS teacherId,
    u.name AS teacherName,
    l.id AS levelId,
    l.name AS levelName,
    MAX(o.percent) AS offPercent
  FROM courses c
  LEFT JOIN users u ON u.id = c.teacher
  LEFT JOIN levels l ON l.id = c.level_id
  LEFT JOIN offs o ON o.course_id = c.id AND o.public = 1
  LEFT JOIN books b ON b.id = c.book_collection_id
  WHERE
    c.name LIKE CONCAT('%', :searchWord, '%')
    AND (
      (:category = 'free' AND c.price = 0) OR
      (:category = 'notFree' AND c.price != 0) OR
      (:category = 'ease' AND l.name IN ('A1', 'A2')) OR
      (:category = 'medum' AND l.name IN ('B1', 'B2')) OR
      (:category = 'high' AND l.name IN ('C1', 'C2')) OR
      (:category = 'children' AND b.forChildren = 1) OR
      (LENGTH(:category) > 0 AND :category NOT IN ('free','notFree','ease','medum','high','children') AND l.name = :category) OR
      (:category IS NULL OR LENGTH(:category) = 0)
    )
  GROUP BY c.id
  ORDER BY c.id DESC
  LIMIT :limit OFFSET :offset`
      ;

    // کوئری شمارش کل نتایج
    const sqlCountQuery =
      `SELECT COUNT(*) AS totalCount
  FROM (
    SELECT c.id
    FROM courses c
    LEFT JOIN users u ON u.id = c.teacher
    LEFT JOIN levels l ON l.id = c.level_id
    LEFT JOIN offs o ON o.course_id = c.id AND o.public = 1
    LEFT JOIN books b ON b.id = c.book_collection_id
    WHERE
      c.name LIKE CONCAT('%', :searchWord, '%')
      AND (
        (:category = 'free' AND c.price = 0) OR
        (:category = 'notFree' AND c.price != 0) OR
        (:category = 'ease' AND l.name IN ('A1', 'A2')) OR
        (:category = 'medum' AND l.name IN ('B1', 'B2')) OR
        (:category = 'high' AND l.name IN ('C1', 'C2')) OR
        (:category = 'children' AND b.forChildren = 1) OR
        (LENGTH(:category) > 0 AND :category NOT IN ('free','notFree','ease','medum','high','children') AND l.name = :category) OR
        (:category IS NULL OR LENGTH(:category) = 0)
      )
    GROUP BY c.id
  ) AS subquery`
      ;

    // اجرای همزمان دو کوئری
    const [courses, totalResult] = await Promise.all([
      db.query(sqlDataQuery, { replacements, type: QueryTypes.SELECT }),
      db.query(sqlCountQuery, { replacements, type: QueryTypes.SELECT }),
    ]);

    const totalCount = totalResult[0].totalCount;

    return successResponse(res, 200, '', { courses, totalCount })
  } catch (error) {
    next(error)
  }
}

const searchAllBooks = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { limit, offset, searchWord = '', category } = req.query;

    console.log("search=========================>", category)

    const whereConditions = [];
    const replacements = {
      searchWord: searchWord,
      limit: limit,
      offset: offset
    };

    if (category) {
      if (category === 'forChildren') {
        whereConditions.push(`b.forChildren = true`);
      } else {
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

    return successResponse(res, 200, '', { books, totalCount })
  } catch (error) {
    next(error)
  }
}

const searchAllArticle = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { limit, offset, searchWord = ''} = req.query;

    const {rows : articles , count} = await Article.findAndCountAll({
      limit:Number(limit),
      offset:Number(offset),
      where : {title : {[Op.like] : `%${searchWord}%`}},
      attributes : ['id','title','cover','shortDescription','slug','created_at'],
      include:[
        {model:User , attributes:['id' , 'name']}
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

    return successResponse(res, 200, '', { articles:lastArticles, totalCount : count })
  } catch (error) {
    next(error)
  }
}

const allBookCategory = async (req, res, next) => {
  try {

    const categories = await Book.findAll({
      attributes: [Sequelize.fn('DISTINCT', Sequelize.col('grate')), 'grate'],
      raw: true
    })

    const categoryArray = categories.map(item => item.grate)

    return successResponse(res, 200, '', { categories: categoryArray })
  } catch (error) {
    next(error)
  }
}

const allCourseCategory = async (req, res, next) => {
  try {

    const categories = await Level.findAll({
      attributes: ['name'],
      where: { name: { [Op.notIn]: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] } }
    })

    const categoryArray = categories.map(item => item.name)

    return successResponse(res, 200, '', { categories: categoryArray })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  searchAllCourses,
  searchAllBooks,
  searchAllArticle,
  allBookCategory,
  allCourseCategory
}