const { Op, where } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, Role, Level, Course, UserCourses, UserBag, Ban } = require("../../db");
const { successResponse, errorResponse } = require("../../utils/responses");
const { validationResult } = require("express-validator");
const fs = require('fs')
const { findUsersByQuery, findCoursesByQuery, findUserDetailsByUserId } = require("../../utils/finder.util");
const path = require("path");
const configs = require("../../configs");
const { generateAccessToken, generateRefreshToken } = require("../../utils/auth.utils");

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

        if(!Object.keys(user).length){
            return errorResponse(res,404,'کاربر یافت نشد.')
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

const banUser = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const {userId} = req.params;
        const {isBan,description} = req.body;

        if(isBan){
            const user = await User.findOne({where:{id:userId} , attributes:['id' ,'phone', 'refreshToken']})
            if(!user){
                return errorResponse(res,400,'کاربر یافت نشد!')
            }

            const [,isNew] = await Ban.findOrCreate({
                where :{user_id:user.id},
                defaults : { phone :user.phone, description}
            })

            user.refreshToken = '';
            await user.save()

            if(!isNew){
                return errorResponse(res,400,'کاربر از قبلا بن شده است.')
            }
        }

        if(!isBan){
            await Ban.destroy({where : {user_id : userId}})
        }
        
        const {user , error} = await findUserDetailsByUserId(userId);

        
        if(error){
            return next(error)
        }
        
        return successResponse(res,200,`کاربر با موفقیت ${isBan ? 'بن شد.' : 'از حالت بن خارج شد.'}`,{user})
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

        if(!avatar){
            return errorResponse(res,400,"عکسی آپلود نشده است!")
        }
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

const updateProfileAvatarUserside = async (req,res,next)=>{
    try {
        const avatar = req.file;
        const userId = req.user.id;

        if(!avatar){
            return errorResponse(res,400,'عکسی آپلود نشده است!')
        }

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

        return successResponse(res,200,`تصویر پروفایل با موفقیت تغییر پیدا کرد.`,{userAvatar : selectedUser.avatar})
    } catch (error) {
        next(error)
    }
}

const deleteUserProfileImageUserside = async (req,res,next)=>{
    try {
        const userId = req.user.id;

        const selectedUser = await User.findOne({where : {id : userId}})

        if(!selectedUser){
            return errorResponse(res,400,'مشکل در شناسایی کاربر! fdddfd')
        }

        if(!selectedUser.avatar){
            return errorResponse(res,400,'تصویری جهت حذف برای کاربر، یافت نشد.')
        }

        const oldAvatar = selectedUser.avatar;

        selectedUser.avatar = null;
        await selectedUser.save()

        if(fs.existsSync(path.join(__dirname,'..','..','public','avatars',oldAvatar.split('/').pop()))){
            fs.unlinkSync(path.join(__dirname,'..','..','public','avatars',oldAvatar.split('/').pop()))
        }

        return successResponse(res,200,`تصویر پروفایل کاربر، با موفقیت حذف شد.`,{userAvatar : selectedUser.avatar})
    } catch (error) {
        next(error)
    }
}

const getUsersideCourses = async (req,res,next)=>{
    try {        
        const userId = req.user.id;

        const user = await User.findOne({
            where:{id:userId},
            attributes : [],
            include:[{
                model: Course, 
                as:'userCourses',
                attributes:['id','name','cover','price','score','slug'],
                order : [['id', 'DESC']],
                include:[
                    {model: User , attributes:['id','name'], paranoid:false},
                    {model: Level , attributes:['id','name'], as:'level'},
                ]
            }]
        })

        const coursesIdArray = user.userCourses.map(course=>course.id)

        const formedCourses = user.userCourses.map(item =>({
            id: item.id,
            name: item.name,
            cover: item.cover,
            price: item.price,
            score: item.score,
            slug: item.slug,
            teacherName: item.user?.name,
            teacherId: item.user?.id,
            levelName: item.level?.name,
            levelId: item.level?.id,
            offPercent: item.offs?.length ? item.offs[0].percent : null,
          }))

        return successResponse(res,200,'',{courses:formedCourses , coursesId:coursesIdArray})
    } catch (error) {
        next(error)
    }
}

const editInfoFromUserside = async(req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const userId = req.user.id;
        const {name,username , password} = req.body;

        
        const user = await User.findOne({where:{id:userId}})
        
        if(!user){
            return errorResponse(res,400,'کاربر یافت نشد!')
        }
        
        const isDoublicateUsername = await User.findOne({where:{username , id:{[Op.ne] : userId}}})
        
        if(isDoublicateUsername){
            return errorResponse(res,400,'این نام کاربری از قبل موجود است.')
        }
        user.name = name;
        user.username = username;
        
        if(!!password){
            const hashedPassword = bcrypt.hashSync(password, 12)   
            user.password = hashedPassword;
        }

        const accessToken = generateAccessToken(user.username)
        const refreshToken = generateRefreshToken(user.username)

        user.refreshToken = refreshToken;
        await user.save()

        res.cookie('accessToken', accessToken, {
          origin: configs.originDomain.frontUserDomain,
          secure: true,
          sameSite : 'none',
          path: '/',
          maxAge: configs.auth.accessTokenExpiresInSeconds * 1000
        })
        
        const accessTokenExpireTime = Date.now() + configs.auth.accessTokenExpiresInSeconds * 1000
        res.cookie('expireTime', accessTokenExpireTime, {
          origin: configs.originDomain.frontUserDomain,
          secure: true,
          sameSite : 'none',
          path: '/',
        })
        
        res.cookie('refreshToken', refreshToken, {
            origin: configs.originDomain.frontUserDomain,
            secure: true,
            httpOnly: true,
            path: '/api/v1/auth/',
            sameSite : 'none',
            maxAge: configs.auth.refreshTokenExpiresInSeconds * 1000
        })

        return successResponse(res,200,'اطلاعات کاربر با موفقیت ویرایش شد.', {user : {name:user.name,username:user.username}})
    } catch (error) {
        next(error)
    }
}

const addToBag = async(req,res,next)=>{
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const courseId = req.body.courseId;
        const userId = req.user.id;

        const userCourse = await UserCourses.findOne({
            where:{
                user_id:userId,
                course_id : courseId,
            }
        })


        if(userCourse){
            return errorResponse(res,400,"شما دانشجوی این دوره هستید.")
        }

        const userbagCourse = await UserBag.findOne({
            where :{
                user_id:userId,
                course_id : courseId
            }
        })

        if(userbagCourse){
            return errorResponse(res,400,"این دوره از قبل به سبد خرید شما اضافه شده است.")
        }

        await UserBag.create({
            user_id:userId,
            course_id:courseId
        })

        const bagCount = await UserBag.count({
            where :{user_id:userId}
        })

        return successResponse(res,200,'دوره با موفقیت به سبد خرید شما اضافه شد.',{bagCount})
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
    updateProfileAvatar,
    updateProfileAvatarUserside,
    deleteUserProfileImageUserside,
    getUsersideCourses,
    editInfoFromUserside,
    addToBag,
    banUser
}