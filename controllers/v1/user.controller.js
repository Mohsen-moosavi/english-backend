const { Op, Sequelize, QueryTypes } = require("sequelize");
const { User, Role, Level, Course, Sale, Ticket, Comment, Article, UserCourses, db } = require("../../db");
const { successResponse, errorResponse } = require("../../utils/responses");
const { validationResult } = require("express-validator");
const { findUsersByQuery, findCoursesByQuery } = require("../../utils/finder.util");

const getUsers = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        
        const {items , count, error} = await findUsersByQuery(req)

        if(error){
            return next(error)
        }

        return successResponse(res,200,'',{users : items , count})
    } catch (error) {
        next(error)
    }
}

const getAdmins = async (req,res,next)=>{
    try {
        const {offset , name , phone } = req.query;
        const userRoleId = await Role.findOne({where : {name : 'USER'} , attributes : ['id'] , raw : true})
        const adminsCount = await User.count({where : {role_id : {[Op.ne] : userRoleId.id}}})

        const searchObject = {role_id : {[Op.ne] : userRoleId.id}};
        name && (searchObject.name = {[Op.like] : `%${name}%`});
        phone && (searchObject.phone = {[Op.like] : `%${phone}%`});

        const admins = await User.findAll({
            where : searchObject,
            order : [['id' , 'desc']],
            limit : 3,
            offset : 3 * (offset ? (Number(offset) - 1) : 0),
        })
        return successResponse(res,200,'',{adminsCount , admins})
    } catch (error) {
        next(error)
    }
}

const getFinderParams = async (req,res,next)=>{
    try {
        const levels = await Level.findAll({raw:true})
        const roles = await Role.findAll({raw:true})
        return successResponse(res,200,'',{levels , roles})
    } catch (error) {
        next(error)
    }
}

const getUserDetails = async (req,res,next)=>{
    try {
        const {id} = req.params;
        
        const query = `
          SELECT 
            u.id,
            u.name,
            u.username,
            u.phone,
            u.avatar,
            u.score,
            u.created_at,
            u.updated_at,
            COALESCE(COUNT(DISTINCT c.id), 0) AS commentCount,
            COALESCE(COUNT(DISTINCT uc.course_id), 0) AS courseCount,
            COALESCE(COUNT(DISTINCT l.id), 0) AS lessonCount,
            COALESCE(COUNT(DISTINCT s.id), 0) AS saleCount,
            COALESCE(COUNT(DISTINCT t.id), 0) AS ticketCount,
            COALESCE(COUNT(DISTINCT a.id), 0) AS articleCount,
            COALESCE(AVG(c.score), 0) AS avgScore,
            COALESCE(SUM(s.price), 0) AS sumSales,
            r.name AS roleName,
            lvl.name AS levelName
          FROM 
            users u
          LEFT JOIN comments c ON u.id = c.user_id
          LEFT JOIN users_courses uc ON u.id = uc.user_id
          LEFT JOIN courses l ON u.id = l.teacher
          LEFT JOIN sales s ON u.id = s.user_id
          LEFT JOIN tickets t ON u.id = t.user_id
          LEFT JOIN articles a ON u.id = a.author
          LEFT JOIN roles r ON u.role_id = r.id
          LEFT JOIN levels lvl ON u.level_id = lvl.id
          WHERE 
            u.id = :id
          GROUP BY 
            u.id, r.id, lvl.id`;

        const user = await db.query(query, {
            replacements: { id },
            type: QueryTypes.SELECT,
        });

        return successResponse(res,200,'',{user : user[0] ? user[0] : {}})
    } catch (error) {
        next(error)
    }
}

const deleteCourseOfUser = async ( req,res,next)=>{
    try {
        const { userId,courseId } = req.params
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const deletedCourseOfUser = await UserCourses.findOne({
      where: { user_id : userId , course_id : courseId }
    })

    if (!deletedCourseOfUser) {
      return errorResponse(res, 400, 'موردی جهت حذف یافت نشد!')
    }

    await deletedCourseOfUser.destroy()


    const {items , count , error} = await findCoursesByQuery(req)

    if(error){
      return next(error)
    }

    return successResponse(res, 200, 'دوره با موفقیت برای کاربر حذف شد.', { courses : items, count })

    } catch (error) {
        next(error)
    }
}

module.exports = {
    getUsers,
    getAdmins,
    getFinderParams,
    getUserDetails,
    deleteCourseOfUser
}