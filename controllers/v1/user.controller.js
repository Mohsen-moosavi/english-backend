const { Op } = require("sequelize");
const { User, Role } = require("../../db");
const { successResponse } = require("../../utils/responses");

const getUsers = async (req,res,next)=>{
    try {
        const {offset , name , phone , score , levelId} = req.query;
        const userRoleId = await Role.findOne({where : {name : 'USER'} , attributes : ['id'] , raw : true})
        const userCount = await User.count({where : {role_id : userRoleId.id}})

        const searchObject = {role_id : userRoleId.id};
        const orderArray =  [];

        name && (searchObject.name = {[Op.like] : `%${name}%`});
        phone && (searchObject.phone = {[Op.like] : `%${phone}%`});
        levelId && (searchObject.level_id = levelId);
        score === 'desc' && (orderArray.unshift(['score' , 'desc']));
        score === 'asc' && (orderArray.unshift(['score' , 'asc']));

        const users = await User.findAll({
            where : searchObject,
            order : orderArray,
            limit : 3,
            offset : 3 * (offset ? (Number(offset) - 1) : 0),
        })
        return successResponse(res,200,'',{userCount , users})
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

module.exports = {
    getUsers,
    getAdmins
}