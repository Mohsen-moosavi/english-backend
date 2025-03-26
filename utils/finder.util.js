const { Op, QueryTypes, Sequelize } = require("sequelize");
const { Course, User, Book, Level, Off, Comment, db, Session, Sale, Ticket, Role } = require("../db");

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

async function findSessionsByQuery(req) {
  try {
    const { limit, offset, status, search, fileStatus } = req.query

    const finderObject = { name: { [Op.like]: `%${search}%` } , course_id : req.params.courseId };
    status === 'free' && (finderObject.isFree = 1);
    status === 'notFree' && (finderObject.isFree = 0);

    fileStatus === 'fileExist' && (finderObject.file = { [Op.not]: null });
    fileStatus === 'fileNotExist' && (finderObject.file = { [Op.is]: null });

    const { rows: sessions, count } = await Session.findAndCountAll(
      {
        where: finderObject,
        limit: Number(limit),
        offset: Number(offset),
        attributes: { exclude: ['video','q4game_id', 'mediagame_id','phrasegame_id']},
        order: [['id', 'DESC']],
        raw: true
      });

      for (let index = 0; index < sessions.length; index++) {
        sessions[index].file = sessions[index].file ? true : false; 
      }

    return { items: sessions, count }
  } catch (error) {
    return { error }
  }
}

async function findSalesByQuery(req) {
  try {
    const { limit, offset, status, search, userId, priceStatus, saleStatus } = req.query;
    const { startDate, endDate } = req.body;
    
    const replacements = { limit: Number(limit), offset: Number(offset) };
    let whereClause = "1=1"; // شرط پایه برای WHERE
    
    // فیلتر بر اساس وضعیت تخفیف
    if (status === 'hasOff') whereClause += " AND s.off > 0";
    if (status === 'hasNotOff') whereClause += " AND s.off = 0";
    
    // فیلتر بر اساس قیمت
    if (priceStatus === 'free') whereClause += " AND s.mainPrice = 0";
    if (priceStatus === 'notFree') whereClause += " AND s.mainPrice > 0";
    
    // فیلتر بر اساس فروشنده
    if (saleStatus === 'admin') whereClause += " AND s.adminSaler IS NOT NULL";
    if (saleStatus === 'user') whereClause += " AND s.adminSaler IS NULL";
    
    // فیلتر بر اساس تاریخ
    if (startDate && endDate) {
        whereClause += " AND s.created_at BETWEEN :startDate AND :endDate";
        replacements.startDate = new Date(startDate);
        replacements.endDate = new Date(endDate);
    } else if (startDate) {
        whereClause += " AND s.created_at >= :startDate";
        replacements.startDate = new Date(startDate);
    } else if (endDate) {
        whereClause += " AND s.created_at <= :endDate";
        replacements.endDate = new Date(endDate);
    }
    
    // فیلتر بر اساس userId
    if (Number(userId)) {
        whereClause += " AND s.user_id = :userId";
        replacements.userId = userId;
    }
    
    // فیلتر بر اساس search روی نام دوره (course.name)
    if (search) {
        whereClause += " AND c.name LIKE :search";
        replacements.search = `%${search}%`;
    }
    
    // کوئری نهایی که همه چیز را باهم دارد
    const query = `
        SELECT s.*, 
               u.id AS user_id, 
               u.name AS user_name, 
               a.id AS admin_id, 
               a.name AS admin_name, 
               c.id AS course_id, 
               c.name AS course_name,
               COUNT(*) OVER() AS total_count, 
               SUM(s.price) OVER() AS total_price
        FROM sales s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN users a ON s.adminSaler = a.id
        JOIN courses c ON s.course_id = c.id
        WHERE ${whereClause}
        ORDER BY s.id DESC
        LIMIT :limit OFFSET :offset;`
    ;
    
    const sales = await db.query(query, {
        replacements,
        type: QueryTypes.SELECT
    });
    
    // خروجی نهایی
    const total_count = sales.length > 0 ? sales[0].total_count : 0;
    const total_price = sales.length > 0 ? sales[0].total_price : 0;
return {items : sales , count :total_count, totalPrice : total_price}
  } catch (error) {
    return {error}
  }
}

async function findTicketsByQuery(req) {
  try {
    const { limit, offset, status, subject,userId } = req.query;
    
    const finderObject = {};

    Number(userId) && (finderObject.user_id = userId)

    status === 'open' && (finderObject.status = 'open');
    status === 'answered' && (finderObject.status = 'answered');
    status === 'pending' && (finderObject.status = 'pending');
    status === 'closed' && (finderObject.status = 'closed');
   
    subject === 'fiscal' && (finderObject.subject = 'fiscal');
    subject === 'scholastic' && (finderObject.subject = 'scholastic');
    subject === 'counseling' && (finderObject.subject = 'counseling');
    subject === 'offer' && (finderObject.subject ='offer' );
    subject === 'support' && (finderObject.subject = 'support');
    subject === 'other' && (finderObject.subject = {[Op.notIn] :['fiscal', 'scholastic', 'counseling', 'offer', 'support']});

    const { rows: tickets, count } = await Ticket.findAndCountAll(
      {
        where: finderObject,
        limit: Number(limit),
        offset: Number(offset),
        order:  [['id', 'DESC']],
        include: [
          { model: User, attributes: ['name']},
        ],
        raw: true
      });

    return {items : tickets , count}
  } catch (error) {
    return {error}
  }
}

// async function findUsersByQuery(req) {
//   try {
//     const { searchName='' , searchPhone='', roleStatus, purchaseStatus , scoreStatus , levelStatus, deletedUser=false,scorePriority=false, limit , offset} = req.query;

//     console.log('values===================>',searchName , searchPhone, roleStatus, purchaseStatus , scoreStatus , levelStatus, deletedUser,scorePriority, limit , offset)

//     const finderObject = {};
//     // const finderObject = { name: { [Op.like]: `%${searchName}%`}, phone :{ [Op.like]: `%${searchPhone}%` }};
//     Boolean(deletedUser) && (finderObject.deleted_at = {[Op.not] : null})

//     const orderArray = [['id', 'DESC']]

//     if(Boolean(scorePriority)){
//       purchaseStatus === 'max' && orderArray.unshift([Sequelize.literal('totalSpent'), 'DESC']);
//       purchaseStatus === 'min' && orderArray.unshift([Sequelize.literal('totalSpent')]);

//       scoreStatus === 'max' && orderArray.unshift(['score', 'DESC']);
//       scoreStatus === 'min' && orderArray.unshift(['score']);
//     }else{
//       scoreStatus === 'max' && orderArray.unshift(['score', 'DESC']);
//       scoreStatus === 'min' && orderArray.unshift(['score']);

//       purchaseStatus === 'max' && orderArray.unshift([Sequelize.literal('totalSpent'), 'DESC']);
//       purchaseStatus === 'min' && orderArray.unshift([Sequelize.literal('totalSpent')]);
//     }

//     const roleFinderObject = {}
//     Number(roleStatus) && (roleFinderObject.id = roleStatus)

//     const levelFinderObject = {}
//     Number(levelStatus) && (levelFinderObject.id = levelStatus)

//     // const { rows: users, count } = await User.findAndCountAll({
//     //   where: finderObject,
//     //   limit: Number(limit),
//     //   offset: Number(offset),
//     //   attributes: ['id', 'name','username', 'phone', 'score', 'created_at', 'updated_at', [Sequelize.fn('SUM', Sequelize.col('sales.price')), 'totalSpent']],
//     //   include: [
//     //     { model: Role, attributes: ['id', 'name'], as : 'role', where: roleFinderObject },
//     //     { model: Level, attributes: ['id','name'], as : 'level', where: levelFinderObject, required:false },
//     //     {
//     //       model: Sale,
//     //       attributes: [
//     //         [Sequelize.fn('SUM', Sequelize.col('sales.price')), 'totalSpent'], // جمع price ها
//     //       ],
//     //       required: false,
//     //     },
//     //   ],
//     //   group: ['User.id', 'Role.id', 'Level.id'],
//     //   order: orderArray,
//     //   paranoid: !Boolean(deletedUser),
//     //   raw: true,
//     // });

//     const { rows: users, count } = await User.findAndCountAll({
//       where: finderObject,
//       limit: Number(limit),
//       offset: Number(offset),
//       attributes: ['id', 'name','username', 'phone', 'score', 'created_at', 'updated_at',  [Sequelize.fn('COALESCE', Sequelize.col('level.name'), 'No Level'), 'levelName'],[Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('sales.price')), 0), 'totalSpent']],
//       include: [
//         { model: Role, attributes: ['id', 'name'], as : 'role', where: roleFinderObject },
//         { model: Level, attributes: ['id','name'], as : 'level', where: levelFinderObject},
//         {
//           model: Sale,
//           attributes:[
//             [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('sales.price')), 0), 'totalSpent'], // 👈 اصلاح شده
//           ],
//           as: 'sales',
//           required: false,
//         },
//       ],
//       // group: ['User.id', 'Role.id', 'Level.id'],
//       group: ['User.id'],
//       order: orderArray,
//       // paranoid: !Boolean(deletedUser),
//       raw: false,
//     });

//     console.log("here=========================================>",finderObject,levelFinderObject , roleFinderObject,users)


//     return { items: users, count }
//   } catch (error) {
//     return { error }
//   }
// }

// async function findUsersByQuery(req) {
//   const { searchName = '', searchPhone = '', roleStatus, purchaseStatus, scoreStatus, levelStatus, deletedUser = false, scorePriority = false, limit, offset } = req.query;

// // ایجاد بخش WHERE
// let whereClause = `WHERE u.name LIKE '%${searchName}%' AND u.phone LIKE '%${searchPhone}%'`;

// if (Boolean(deletedUser)) {
//   whereClause +=  `AND u.deleted_at IS NOT NULL`;
// }

// let orderClause = 'ORDER BY u.id DESC';

// if (Boolean(scorePriority)) {
//   if (purchaseStatus === 'max') {
//     orderClause = 'ORDER BY totalSpent DESC';
//   } else if (purchaseStatus === 'min') {
//     orderClause = 'ORDER BY totalSpent ASC';
//   }

//   if (scoreStatus === 'max') {
//     orderClause = 'ORDER BY u.score DESC';
//   } else if (scoreStatus === 'min') {
//     orderClause = 'ORDER BY u.score ASC';
//   }
// } else {
//   if (scoreStatus === 'max') {
//     orderClause = 'ORDER BY u.score DESC';
//   } else if (scoreStatus === 'min') {
//     orderClause = 'ORDER BY u.score ASC';
//   }

//   if (purchaseStatus === 'max') {
//     orderClause = 'ORDER BY totalSpent DESC';
//   } else if (purchaseStatus === 'min') {
//     orderClause = 'ORDER BY totalSpent ASC';
//   }
// }

// let roleCondition = '';
// if (roleStatus) {
//   roleCondition = `AND r.name = '${roleStatus}'`;
// }

// let levelCondition = '';
// if (levelStatus) {
//   levelCondition = `AND l.name = '${levelStatus}'`;
// }

// // کوئری برای دریافت داده‌ها
// const query = `
//   SELECT u.id, u.name, u.username, u.phone, u.score, 
//          COALESCE(SUM(s.price), 0) AS totalSpent,
//          COALESCE(l.name, 'No Level') AS levelName
//   FROM users u
//   LEFT JOIN sales s ON u.id = s.user_id
//   LEFT JOIN roles r ON u.role_id = r.id
//   LEFT JOIN levels l ON u.level_id = l.id
//   ${whereClause}
//   ${roleCondition}
//   ${levelCondition}
//   GROUP BY u.id
//   ${orderClause}
//   LIMIT ${offset}, ${limit};`
// ;

// // اجرای کوئری
// const result = await db.query(query, {
//   type: QueryTypes.SELECT
// });

// console.log("result===============>" , result)

// return result;
// }

async function findUsersByQuery(req) {
  try {
    const { searchName = '', searchPhone = '', roleStatus, scoreStatus, levelStatus, deletedUser = 0,purchaseStatus, scorePriority, limit, offset } = req.query;

    const finderObject = [];
    if (Number(deletedUser)){
      finderObject.push('u.deleted_at IS NOT NULL');
    }else{
      finderObject.push('u.deleted_at IS NULL');
    }
    
    if (searchName) finderObject.push(`u.name LIKE '%${searchName}%'`);
    if (searchPhone) finderObject.push(`u.phone LIKE '%${searchPhone}%'`);
    
    // فیلتر بر اساس role و level اگر لازم باشد
    if (roleStatus) finderObject.push(`r.id = ${roleStatus}`);
    if (levelStatus) finderObject.push(`l.id = ${levelStatus}`);
    
    // ترتیب‌دهی برای score و purchase
    // let orderClause = 'u.id DESC'; // پیش‌فرض
    
    // if (Number(scorePriority)) {
    //   if (scoreStatus === 'max') orderClause = 'u.score DESC';
    //   if (scoreStatus === 'min') orderClause = 'u.score ASC';
    //   if (purchaseStatus === 'max') orderClause = 'totalSpent DESC';
    //   if (purchaseStatus === 'min') orderClause = 'totalSpent ASC';
    // } else {
    //   if (scoreStatus === 'max') orderClause = 'u.score DESC';
    //   if (scoreStatus === 'min') orderClause = 'u.score ASC';
    //   if (purchaseStatus === 'max') orderClause = 'totalSpent DESC';
    //   if (purchaseStatus === 'min') orderClause = 'totalSpent ASC';
    // }


    let orderClause = ''; // پیش‌فرض
    
    if (Number(scorePriority)) {
      if (scoreStatus === 'max') orderClause += 'u.score DESC ,';
      if (scoreStatus === 'min') orderClause += 'u.score ASC ,';
      if (purchaseStatus === 'max') orderClause += 'totalSpent DESC ,';
      if (purchaseStatus === 'min') orderClause += 'totalSpent ASC ,';
    } else {
      if (purchaseStatus === 'max') orderClause += 'totalSpent DESC ,';
      if (purchaseStatus === 'min') orderClause += 'totalSpent ASC ,';
      if (scoreStatus === 'max') orderClause += 'u.score DESC ,';
      if (scoreStatus === 'min') orderClause += 'u.score ASC ,';
    }

    orderClause += 'u.id DESC'

    // console.log("order=======================>" , !!Number(scorePriority))
    
    // ساخت کوئری SQL برای دریافت داده‌ها و تعداد کل رکوردها
    const sqlQuery = `
      SELECT 
        u.id, u.name, u.username, u.phone, u.score ,r.id as roleId , r.name as roleName, u.created_at, u.updated_at, 
        COALESCE(l.name, 'No Level') AS levelName, 
        COALESCE(SUM(s.price), 0) AS totalSpent,
        COUNT(*) OVER() AS totalCount
      FROM users u
      LEFT JOIN sales s ON u.id = s.user_id
      LEFT JOIN levels l ON u.level_id = l.id
      LEFT JOIN roles r ON u.role_id = r.id  
      ${finderObject.length > 0 ? `WHERE ${finderObject.join(' AND ')}` : ''}
      GROUP BY u.id, l.name
      ORDER BY ${orderClause}
      LIMIT ${limit} OFFSET ${offset};`
    ;
    
    const users = await db.query(sqlQuery, {
      type: QueryTypes.SELECT,
      raw: true
    });
    
    const totalCount = users.length ? users[0].totalCount : 0; // تعداد کل رکوردها از totalCount

    return {items : users , count : totalCount}
  } catch (error) {
    return error
  }

}


module.exports = {
  findCoursesByQuery,
  findOffsByQuery,
  findCommentsByQuery,
  findCommentReplies,
  setCourseAverageScore,
  findSessionsByQuery,
  findSalesByQuery,
  findTicketsByQuery,
  findUsersByQuery
}