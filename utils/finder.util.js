const { Op } = require("sequelize");
const { Course, User, Book, Level, Off } = require("../db");

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
          { model: Level, attributes: ['name'], as: 'level' },
          { model: Off, attributes: ['id','percent'] },
        ],
        raw: true
      });

      return {items : courses, count}
    } catch (error) {
        return {error}
    }
}

async function findOffsByQuery(req){
  try {
      const {limit, offset, search, orderStatus, publicStatus} = req.query

      console.log('values=============>',limit, offset, search, orderStatus, publicStatus)


  const finderObject = {};
    
  publicStatus === 'public'  && (finderObject.public = 1);
  publicStatus === 'private' && (finderObject.public = 0);
  orderStatus  === 'expired' && (finderObject.expire = { [Op.lt]: new Date() })
  orderStatus  === 'infinity'&& (finderObject.times = {[Op.is]: null });
  orderStatus  === 'finishRemaining' && (finderObject.remainingTimes = 0);

  const orderArray = [['id', 'DESC']]
  orderStatus === 'maxPercent'   && orderArray.unshift(['percent','DESC']);
  orderStatus === 'minPercent'   && orderArray.unshift(['percent']);
  orderStatus === 'maxExpire'    && orderArray.unshift(['expire','DESC']) && (finderObject.expire = { [Op.gte]: new Date() })
  orderStatus === 'minExpire'    && orderArray.unshift(['expire']) && (finderObject.expire = { [Op.gte]: new Date() })
  orderStatus === 'maxTimes'     && orderArray.unshift(['times','DESC'])  && (finderObject.times = {[Op.not]: null });
  orderStatus === 'minTimes'     && orderArray.unshift(['times']) && (finderObject.times = {[Op.not]: null });
  orderStatus === 'maxRemaining' && orderArray.unshift(['remainingTimes','DESC']) && (finderObject.times = {[Op.not]: null });
  orderStatus === 'minRemaining' && orderArray.unshift(['remainingTimes']) && (finderObject.times = {[Op.not]: null });

  const { rows: offs, count } = await Off.findAndCountAll(
    {
      where: finderObject,
      limit: Number(limit),
      offset: Number(offset),
      order: orderArray,
      attributes: { exclude: ['course_id'] },
      include: [
        { model: User, attributes: ['id','name'], as:'creator'},
        { model: Course, attributes: ['id','name'], as: 'course',where : {name: { [Op.like]: `%${search}%` }} },
      ],
      raw: true
    });



    return {items : offs, count}
  } catch (error) {
      return {error}
  }
}

module.exports = {
    findCoursesByQuery,
    findOffsByQuery,
}