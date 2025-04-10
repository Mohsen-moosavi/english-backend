const { Sequelize, Op } = require("sequelize");
const { Sale, User, Course, Level, Off } = require("../../db");
const moment = require('moment-jalaali');
const { successResponse } = require("../../utils/responses");
const { nameOfMount } = require("../../utils/mount.utils");

const getData = async (req, res, next) => {

  try {
    const startMonth = moment().startOf('jMonth').subtract(11, 'jMonth');
    const monthsList = [];

    for (let i = 0; i < 12; i++) {
      monthsList.push(startMonth.clone().add(i, 'jMonth').format('jYYYY-jMM'));
    }

    const sales = await Sale.findAll({
      attributes: ['shamsi_month', [Sequelize.fn('SUM', Sequelize.col('price')), 'totalSales']],
      where: {
        shamsi_month: { [Op.in]: monthsList }
      },
      group: ['shamsi_month'],
      raw: true
    });

    const users = await User.findAll({
      attributes: ['shamsi_month', [Sequelize.fn('COUNT', '*'), 'userCount']],
      where: {
        shamsi_month: { [Op.in]: monthsList }
      },
      group: ['shamsi_month'],
      raw: true
    });

    const saleMap = {};
    sales.forEach(s => {
      saleMap[s.shamsi_month] = parseFloat(s.totalSales);
    });

    const userMap = {};
    users.forEach(u => {
      userMap[u.shamsi_month] = parseInt(u.userCount);
    });

    const result = monthsList.map(month => ({
      monthName : nameOfMount[`${month.split('-').pop()}`],
      month,
      totalSales: saleMap[month] || 0,
      userCount: userMap[month] || 0
    }));

    // پاسخ نهایی
    successResponse(res, 200, '', { chartData: result });

  } catch (error) {
    next(error)
  }
}

const getCourseData = async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      where:{isCompleted : 0},
      // attributes:{exclude :['shortDescription','longDescription','introductionVideo','slug','book_file_group','created_at','updated_at','deleted_at','bookCollection_id' , 'teacher']},
      attributes:['name','id','cover','price','score'],
      include:[
        { model: User, attributes: ['name','id'] , paranoid : false},
        { model: Level, attributes: ['name'], as: 'level' },
        { model: Off, attributes: ['id', 'percent','public'] }
      ]
    })

    successResponse(res,200,'',{unCompletedCourses : courses})
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getData,
  getCourseData
}