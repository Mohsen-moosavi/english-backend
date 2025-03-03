const { Op, QueryTypes } = require("sequelize");
const { Course, User, Book, Level, Off, Comment, db } = require("../db");

async function findCoursesByQuery(req) {
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
          { model: Off, attributes: ['id', 'percent'] },
        ],
        raw: true
      });

    return { items: courses, count }
  } catch (error) {
    return { error }
  }
}

async function findOffsByQuery(req) {
  try {
    const { limit, offset, search, orderStatus, publicStatus } = req.query

    console.log('values=============>', limit, offset, search, orderStatus, publicStatus)


    const finderObject = {};

    publicStatus === 'public' && (finderObject.public = 1);
    publicStatus === 'private' && (finderObject.public = 0);
    orderStatus === 'expired' && (finderObject.expire = { [Op.lt]: new Date() })
    orderStatus === 'infinity' && (finderObject.times = { [Op.is]: null });
    orderStatus === 'finishRemaining' && (finderObject.remainingTimes = 0);

    const orderArray = [['id', 'DESC']]
    orderStatus === 'maxPercent' && orderArray.unshift(['percent', 'DESC']);
    orderStatus === 'minPercent' && orderArray.unshift(['percent']);
    orderStatus === 'maxExpire' && orderArray.unshift(['expire', 'DESC']) && (finderObject.expire = { [Op.gte]: new Date() })
    orderStatus === 'minExpire' && orderArray.unshift(['expire']) && (finderObject.expire = { [Op.gte]: new Date() })
    orderStatus === 'maxTimes' && orderArray.unshift(['times', 'DESC']) && (finderObject.times = { [Op.not]: null });
    orderStatus === 'minTimes' && orderArray.unshift(['times']) && (finderObject.times = { [Op.not]: null });
    orderStatus === 'maxRemaining' && orderArray.unshift(['remainingTimes', 'DESC']) && (finderObject.times = { [Op.not]: null });
    orderStatus === 'minRemaining' && orderArray.unshift(['remainingTimes']) && (finderObject.times = { [Op.not]: null });

    const { rows: offs, count } = await Off.findAndCountAll(
      {
        where: finderObject,
        limit: Number(limit),
        offset: Number(offset),
        order: orderArray,
        attributes: { exclude: ['course_id'] },
        include: [
          { model: User, attributes: ['id', 'name'], as: 'creator' },
          { model: Course, attributes: ['id', 'name'], as: 'course', where: { name: { [Op.like]: `%${search}%` } } },
        ],
        raw: true
      });



    return { items: offs, count }
  } catch (error) {
    return { error }
  }
}

async function findCommentsByQuery(req) {
  try {
    const { limit, offset, status, score, search, parentStatus } = req.query

    const finderObject = {};
    Number(score) && Number(score) > 0 && (finderObject.score = score);
    Number(score)=== 0 && (finderObject.score = {[Op.is] : null});
    status === 'accept' && (finderObject.isAccept = 1);
    status === 'notAccept' && (finderObject.isAccept = 0);
    status === 'none' && (finderObject.isAccept = { [Op.is]: null });

    parentStatus === 'answer' && (finderObject.parent_id = { [Op.not]: null });
    parentStatus === 'main' && (finderObject.parent_id = { [Op.is]: null });

    const { rows: comments, count } = await Comment.findAndCountAll(
      {
        where: finderObject,
        limit: Number(limit),
        offset: Number(offset),
        attributes: { exclude: ['course_id', 'user_id'] },
        order: [['id', 'DESC']],
        include: [
          { model: User, attributes: ['id', 'name'] },
          { model: Course, attributes: ['id','name'], where: { name: { [Op.like]: `%${search}%` } } },
        ],
        raw: true
      });

    return { items: comments, count }
  } catch (error) {
    return { error }
  }
}

async function findCommentReplies(commentId) {
  try {
    const query = `
    WITH RECURSIVE parent_tree AS (
        SELECT c.id, c.parent_id, c.user_id, c.content, c.score, c.isAccept, c.created_at, u.name, u.avatar  
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = :commentId
        UNION ALL
        SELECT c.id, c.parent_id, c.user_id, c.content, c.score, c.isAccept, c.created_at, u.name, u.avatar  
        FROM comments c
        JOIN users u ON c.user_id = u.id
        INNER JOIN parent_tree pt ON c.id = pt.parent_id
    ),
    child_tree AS (
        SELECT c.id, c.parent_id, c.user_id, c.content, c.score, c.isAccept, c.created_at, u.name, u.avatar  
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = :commentId
        UNION ALL
        SELECT c.id, c.parent_id, c.user_id, c.content, c.score, c.isAccept, c.created_at, u.name, u.avatar  
        FROM comments c
        JOIN users u ON c.user_id = u.id
        INNER JOIN child_tree ct ON c.parent_id = ct.id
    ),
    siblings AS (
        SELECT c.id, c.parent_id, c.user_id, c.content, c.score, c.isAccept, c.created_at, u.name, u.avatar 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = (SELECT parent_id FROM comments WHERE id = :commentId) 
        AND c.id != :commentId
    ),
    cousins AS (
        SELECT c.id, c.parent_id, c.user_id, c.content, c.score, c.isAccept, c.created_at, u.name, u.avatar 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.parent_id IN (SELECT parent_id FROM parent_tree WHERE parent_id IS NOT NULL)
        UNION ALL
        SELECT c.id, c.parent_id, c.user_id, c.content, c.score, c.isAccept, c.created_at, u.name, u.avatar 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        INNER JOIN cousins cs ON c.parent_id = cs.id
    )
    SELECT * FROM parent_tree
    UNION 
    SELECT * FROM child_tree
    UNION 
    SELECT * FROM siblings
    UNION 
    SELECT * FROM cousins;
        `;

    const comments = await db.query(query, {
      replacements: { commentId },
      type: QueryTypes.SELECT
    });


    if (!comments.length) {
      return { notFound: true }
    }

    // تبدیل داده‌ها به ساختار درختی
    const buildTree = (comments, parentId = null) => {
      return comments
        .filter(comment => comment.parent_id === parentId)
        .map(comment => ({
          id: comment.id,
          parent_id: comment.parent_id,
          content: comment.content,
          score: comment.score,
          isAccept: comment.isAccept,
          created_at: comment.created_at,
          user: {
            id: comment.user_id,
            name: comment.name,
            avatar: comment.avatar
          },
          children: buildTree(comments, comment.id) // بازگشتی برای فرزندان
        }));
    };

    const tree = buildTree(comments);

    return { tree };
  } catch (error) {
    return { error }
  }
}

async function setCourseAverageScore(courseId) {
  const scoreAverage = await Comment.findOne({
    attributes: [[db.fn('AVG', db.col('score')), 'averageScore']],
    where: { course_id: courseId, isAccept: true , score : {[Op.not] : null} },
    raw: true
  })

  const mainCourse = await Course.findOne({ where: { id: courseId } })

  console.log()

  mainCourse.score = Number(scoreAverage.averageScore) ? String(scoreAverage.averageScore) : '5';
  await mainCourse.save()
}

module.exports = {
  findCoursesByQuery,
  findOffsByQuery,
  findCommentsByQuery,
  findCommentReplies,
  setCourseAverageScore
}