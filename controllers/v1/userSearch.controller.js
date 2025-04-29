const { Op, Sequelize } = require("sequelize");
const { Course } = require("../../db");
const { validationResult } = require("express-validator");
const { errorResponse } = require("../../utils/responses");

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

module.exports = {
    searchAllCourses
}