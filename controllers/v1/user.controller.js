const { Op, Sequelize, QueryTypes } = require("sequelize");
const { User, Role, Level, Course, Sale, Ticket, Comment, Article, UserCourses, db } = require("../../db");
const { successResponse, errorResponse } = require("../../utils/responses");
const { validationResult } = require("express-validator");
const fs = require('fs')
const { findUsersByQuery, findCoursesByQuery, findUserDetailsByUserId } = require("../../utils/finder.util");
const path = require("path");
const configs = require("../../configs");

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

        const {user , error} = await findUserDetailsByUserId(id);

        if(error){
            return next(error)
        }

        return successResponse(res,200,'',{user})
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

const changeRole = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const {userId , roleId} = req.body;

        const selectedRole = await Role.findOne({where : {id : roleId}})

        if(!selectedRole){
            return errorResponse(res,400,'نقش وارد شده، معتبر نمی باشد')
        }

        const selectedUser = await User.findOne({where : {id : userId}})

        if(!selectedUser){
            return errorResponse(res,400,'مشکل در شناسایی کاربر!')
        }

        selectedUser.role_id = roleId;
        await selectedUser.save()

        
        const {user , error} = await findUserDetailsByUserId(userId);

        if(error){
            return next(error)
        }

        return successResponse(res,200,`نقش کاربر با موفقیت به ${selectedRole.name} تغییر پیدا کرد.`,{user})
    } catch (error) {
        next(error)
    }
}

const deleteUserProfileImage = async (req,res,next)=>{
    try {
        const {userId} = req.params;

        const selectedUser = await User.findOne({where : {id : userId}})

        if(!selectedUser){
            return errorResponse(res,400,'مشکل در شناسایی کاربر!')
        }

        if(!selectedUser.avatar){
            return errorResponse(res,400,'تصویری جهت حذف برای کاربر، یافت نشد.')
        }

        const oldAvatar = selectedUser.avatar;

        selectedUser.avatar = null;
        await selectedUser.save()

        // console.log('exist==================================================>',fs.existsSync(path.join(__dirname,'..','..','public','avatars',oldAvatar.split('/').pop())))
        if(fs.existsSync(path.join(__dirname,'..','..','public','avatars',oldAvatar.split('/').pop()))){
            fs.unlinkSync(path.join(__dirname,'..','..','public','avatars',oldAvatar.split('/').pop()))
        }

        const {user , error} = await findUserDetailsByUserId(userId);

        if(error){
            return next(error)
        }

        return successResponse(res,200,`تصویر پروفایل کاربر، با موفقیت حذف شد.`,{user})
    } catch (error) {
        next(error)
    }
}

const updateProfileAvatar = async (req,res,next)=>{
    try {
        const {userId} = req.params;
        const avatar = req.file;

        const selectedUser = await User.findOne({where : {id : userId}})

        if(!selectedUser){
            return errorResponse(res,400,'مشکل در شناسایی کاربر!')
        }

        const oldAvatar = selectedUser.avatar
        if(oldAvatar && fs.existsSync(path.join(__dirname,'..','..','public','avatars',oldAvatar.split('/').pop()))){
            fs.unlinkSync(path.join(__dirname,'..','..','public','avatars',oldAvatar.split('/').pop()))
        }

        selectedUser.avatar = `${configs.domain}/public/avatars/${avatar.filename}`;
        await selectedUser.save()

        const {user , error} = await findUserDetailsByUserId(userId);

        if(error){
            return next(error)
        }

        return successResponse(res,200,`تصویر پروفایل با موفقیت تغییر پیدا کرد.`,{user})
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getUsers,
    getAdmins,
    getFinderParams,
    getUserDetails,
    deleteCourseOfUser,
    changeRole,
    deleteUserProfileImage,
    updateProfileAvatar
}