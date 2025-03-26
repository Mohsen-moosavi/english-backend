const { Op, Sequelize } = require("sequelize");
const { User, Role, Level, Course, Sale, Ticket, Comment, Article } = require("../../db");
const { successResponse, errorResponse } = require("../../utils/responses");
const { validationResult } = require("express-validator");
const { findUsersByQuery } = require("../../utils/finder.util");

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
        // const {id} = req.params;
        
        // const user = await User.findOne({
        //     where : {id},
        //     attributes: [
        //       'id',
        //       'name',
        //       'username',
        //       'phone',
        //       'avatar',
        //       'score',
        //       'created_at',
        //       'updated_at',
        //       [Sequelize.fn('COALESCE' , Sequelize.fn('COUNT', Sequelize.col('comments.id')), 0),'commentCount'],
        //       [Sequelize.fn('COALESCE' , Sequelize.fn('AVG', Sequelize.col('comments.score')) , 0),'avgScore'],
        //       [Sequelize.fn('COALESCE' , Sequelize.fn('COUNT', Sequelize.col('userCourses.id')) , 0),'courseCount'],
        //       [Sequelize.fn('COALESCE' , Sequelize.fn('COUNT', Sequelize.col('sales.id')) , 0),'saleCount'],
        //       [Sequelize.fn('COALESCE' , Sequelize.fn('SUM', Sequelize.col('sales.price')) , 0),'sumSales'],
        //       [Sequelize.fn('COALESCE' , Sequelize.fn('COUNT', Sequelize.col('tickets.id')) , 0),'ticketCount'],
        //       [Sequelize.fn('COALESCE' , Sequelize.fn('COUNT', Sequelize.col('articles.id')) , 0),'articleCount'],
        //     ],
        //     include: [
        //       {model: Comment,attributes: [], required:false},
        //       {model: Role,as: 'role',attributes: ['name'], required:false},
        //       {model: Level,as: 'level',attributes: ['name'], required:false},
        //       {model: Course , as:'userCourses',attributes: [], required:false},
        //       {model: Sale,as: 'sales',attributes: [], required:false},
        //       {model: Ticket,attributes: [], required:false},
        //       {model: Article,attributes: [], required:false},
        //     ],
        //     subQuery : false,
        //     group: ['User.id'],
        //     // raw: true
        //   })

        const {id} = req.params;
        
const user = await User.findOne({
  where: { id },
  attributes: [
    'id',
    'name',
    'username',
    'phone',
    'avatar',
    'score',
    'created_at',
    'updated_at',
    [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('comments.id'))),0), 'commentCount'],

    [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('userCourses.id'))), 0), 'courseCount'],
    [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('lessons.id'))),0), 'lessonCount'],
    [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('sales.id'))),0), 'saleCount'],
    [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('tickets.id'))),0), 'ticketCount'],
    [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('articles.id'))),0), 'articleCount'],



    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('comments.score')), 0), 'avgScore'],
    // [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.col('lessons.id')), 0), 'lessonCount'],
    // [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.col('sales.id')), 0), 'saleCount'],
    [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('sales.price')), 0), 'sumSales'],
    // [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.col('tickets.id')), 0), 'ticketCount'],
    // [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.col('articles.id')), 0), 'articleCount'],
  ],
  include: [
    { model: Comment, attributes: [], required: false },
    { model: Role, as: 'role', attributes: ['name'], required: false },
    { model: Level, as: 'level', attributes: ['name'], required: false },
    { model: Course, as: 'userCourses', attributes: [], required: false },
    { model: Course, as: 'lessons', attributes: [], required: false },
    { model: Ticket, attributes: [], required: false },
    { model: Article, attributes: [], required: false },
    { model: Sale, as: 'sales', attributes: [], required: false },
  ],
  subQuery: false,
  group: ['User.id', 'role.id', 'level.id','userCourses.id','comments.id','tickets.id','articles.id','lessons.id'],
  raw: false,
});

        return successResponse(res,200,'',{user})
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getUsers,
    getAdmins,
    getFinderParams,
    getUserDetails
}



            //   [Sequelize.fn('COUNT', Sequelize.col('comments.id')), 'commentCount'],
            //   [Sequelize.fn('AVG', Sequelize.col('comments.score')), 'avgScore'],
            //   [Sequelize.fn('COUNT', Sequelize.col('courses.id')), 'courseCount'],
            //   [Sequelize.fn('COUNT', Sequelize.col('sales.id')), 'saleCount'],
            //   [Sequelize.fn('SUM', Sequelize.col('sales.price')), 'sumSales'],
            //   [Sequelize.fn('COUNT', Sequelize.col('tickets.id')), 'ticketCount'],
            //   [Sequelize.fn('COUNT', Sequelize.col('articles.id')), 'articleCount'],