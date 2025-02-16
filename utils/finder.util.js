const { Op } = require("sequelize");
const { Course, User, Book, Level } = require("../db");

async function findCoursesByQuery(req ){
    try {
        const { limit, offset, search, status, teacherId, bookId, levelId, priceStatus, scoreStatus } = req.query

    const finderObject = { name: { [Op.like]: `%${search}%` } };
    Number(teacherId) && (finderObject.teacher = teacherId);
    Number(bookId) && (finderObject.book_collection_id = bookId);
    Number(levelId) && (finderObject.level_id = levelId);
    Number(scoreStatus) && (finderObject.score = { [Op.between]: [scoreStatus - 0.9, scoreStatus] });
    status === 'completed' && (finderObject.isCompleted = 1);
    status === 'notCompleted' && (finderObject.isCompleted = 0);
    priceStatus === 'free' && (finderObject.price = 0);

    const orderArray = [['id', 'DESC']]
    priceStatus === 'max' && orderArray.unshift(['price', 'DESC']) && (finderObject.price = { [Op.ne]: 0 })
    priceStatus === 'min' && orderArray.unshift(['price']) && (finderObject.price = { [Op.ne]: 0 })

    const { rows: courses, count } = await Course.findAndCountAll(
      {
        where: finderObject,
        limit: Number(limit),
        offset: Number(offset),
        order: orderArray,
        attributes: { exclude: ['teacher'] },
        include: [
          { model: User, attributes: ['name'] },
          { model: Book, attributes: ['name'], as: 'book_collection' },
          { model: Level, attributes: ['name'], as: 'level' }
        ],
        raw: true
      });

      return {items : courses, count}
    } catch (error) {
        return {error}
    }
}

module.exports = {
    findCoursesByQuery
}