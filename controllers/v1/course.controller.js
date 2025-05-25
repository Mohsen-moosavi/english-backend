const { Op, QueryTypes, Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { Book, User, Role, Level, Course, Tag, TagCourses, UserCourses, Session, Off, db, Comment, Article, UserBag } = require("../../db");
const configs = require("../../configs");
const { successResponse, errorResponse } = require("../../utils/responses");
const { mergeChunks } = require("../../services/uploadFile");
const { validationResult } = require("express-validator");
const { removeImage, removeIntroductionVideo } = require("../../utils/fs.utils");
const { default: slugify } = require("slugify");
const { isNumber } = require("util");
const { findCoursesByQuery } = require("../../utils/finder.util");

const getCreatingData = async (req, res, next) => {
  try {
    const books = await Book.findAll(
      {
        attributes: ['id', 'name'],
        raw: true
      });

    const levels = await Level.findAll(
      { raw: true });

    const teachers = await User.findAll({
      include: {
        model: Role,
        as: 'role',
        where: { name: { [Op.notIn]: [configs.roles.user, configs.roles.writter] } }
      },
      paranoid:false,
      raw: true,
      attributes: ['name', 'id']
    })


    return successResponse(res, 200, '', { books, teachers, levels })
  } catch (error) {
    next(error)
  }
}

const uploadVideo = async (req, res, next) => {
  const chunk = req.file.buffer;
  const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
  const totalChunks = Number(req.body.totalChunks); // Sent from the client
  const { fileName, canceling } = req.body;

  const chunkDir = path.join(__dirname, '..', '..', 'public', 'introductionVideo', 'chunks') // Directory to save chunks

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = path.join(chunkDir, `${fileName}.part_${chunkNumber}`)

  console.log('canceling===>', canceling)
  if (canceling) {
    fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'introductionVideo', 'chunks'), { recursive: true, force: true })
    return errorResponse(res, 400, 'عملیات لغو شد.')
  }



  try {
    await fs.promises.writeFile(chunkFilePath, chunk);
    let fileLink = '';

    if (chunkNumber === totalChunks) {
      // If this is the last chunk, merge all chunks into a single file
      fileLink = await mergeChunks(fileName, totalChunks, 'introductionVideo');
    }

    successResponse(res, 200, "آپلود فایل با موفقت انجام شد.", { link: fileLink, chunkNumber, totalChunks })
  } catch (error) {
    console.error("Error saving chunk:", error);
    fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'introductionVideo', 'chunks'), { recursive: true, force: true })
    next(error)
  }
}

const createCourse = async (req, res, next) => {
  try {
    const validationError = validationResult(req)
    const cover = req.file;

    if (validationError?.errors && validationError?.errors[0]) {
      removeImage(cover.filename)
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { name, shortDescription, longDescription, price, slug, bookFileGroup, bookCollectionId, teacher, levelId, tags, videoLink } = req.body;

    const slugifyedSlug = slugify(slug, {
      trim: true
    })

    const copyOfTags = tags[0].split(',')


    const [newCourse, isNewCourse] = await Course.findOrCreate({
      where: { [Op.or]: [{ name }, { slug: slugifyedSlug }] },
      defaults: { name, slug: slugifyedSlug, shortDescription, longDescription, introductionVideo: videoLink, price, book_file_group: bookFileGroup, book_collection_id: bookCollectionId, teacher, level_id: levelId, cover: `${configs.domain}/public/images/${cover.filename}` },
      raw: true
    })

    if (!isNewCourse) {
      removeImage(cover.filename)
      if (newCourse.name === name) {
        return errorResponse(res, 409, 'دوره ای با این عنوان، از قبل وجود دارد!')
      } else {
        return errorResponse(res, 409, 'دوره ای با این slug، از قبل وجود دارد!')
      }
    }

    let createdTags = copyOfTags.map((tag) =>
      Tag.findOrCreate({ where: { name: tag.trim() } })
    );
    createdTags = await Promise.all(createdTags);


    await newCourse.addTags(createdTags.map((tag) => tag[0]));

    return successResponse(res, 201, 'دوره با موفقیت ایجاد شد.')

  } catch (error) {
    removeImage(req?.file?.filename)
    next(error)
  }
}

const deleteFile = async (req, res, next) => {
  try {
    const { fileName } = req.body;
    const dirPath = path.join(__dirname, '..', '..', 'public', 'introductionVideo')

    if (fs.existsSync(path.join(dirPath, fileName))) {
      fs.unlinkSync(path.join(dirPath, fileName));
    }

    successResponse(res, 200, "فایل با موفقیت حذف شد.")
  } catch (error) {
    next(error)
  }
}

const getCourses = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    
    const {items , count , error} = await findCoursesByQuery(req)

    if(error){
      return next(error)
    }

    return successResponse(res, 200, '', { courses : items, count })
  } catch (error) {
    next(error)
  }
}


const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const deletedCourse = await Course.findOne({
      where: { id },
      paranoid : false
    })

    if (!deletedCourse) {
      return errorResponse(res, 400, 'موردی جهت تغییر فعال سازی یافت نشد!')
    }

    if(deletedCourse.deleted_at){
      await deletedCourse.restore()
    }else{  
      await deletedCourse.destroy()
    }

    const {items , count , error} = await findCoursesByQuery(req)

    if(error){
      return next(error)
    }

    return successResponse(res, 200, 'دوره با موفقیت تغییر وضعیت داد.', { courses : items, count })
  } catch (error) {
    next(error)
  }
}

const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params

    const course = await Course.findOne({
      where: { id },
      include: [
        { model: User, attributes: ["id", 'name'] , paranoid:false},
        { model: Book, attributes: ["id", 'name'], as: 'book_collection' },
        { model: Level, attributes: ['id', 'name'], as: 'level' },
        {
          model: Tag, attributes: ['name'], through: { attributes: [] }
        }
      ],
      attributes: {
        exclude: ['teacherId', 'levelId', 'book_collection_id']
      }
    });

    if (!course) {
      return errorResponse(res, 404, "موردی یافت نشد!")
    }

    return successResponse(res, 200, '', { course })
  } catch (error) {
    next(error)
  }
}

const updateCourse = async (req, res, next) => {
  try {
    const validationError = validationResult(req)
    const cover = req.file;
    const { id } = req.params;

    if (validationError?.errors && validationError?.errors[0]) {
      cover && removeImage(cover.filename)
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { name, shortDescription, longDescription, price, slug, bookFileGroup, bookCollectionId, teacher, levelId, tags, videoLink } = req.body;


    const slugifyedSlug = slugify(slug, {
      trim: true
    })

    const copyOfTags = tags[0].split(',')


    const course = await Course.findOne({
      where: { id }
    })

    if (!course) {
      cover && removeImage(cover.filename)
      return errorResponse(res, 409, 'موردی جهت ویرایش یافت نشد!')
    }

    if (course.name !== name || course.slug !== slugifyedSlug) {
      const oldCourse = await Course.findOne({ where: { id: { [Op.ne]: id }, [Op.or]: { name, slug: slugifyedSlug } } })
      if (oldCourse) {
        cover && removeImage(cover.filename)
        if (oldCourse.name === name) {
          return errorResponse(res, 409, 'دوره ای با این عنوان، از قبل وجود دارد!')
        }
        return errorResponse(res, 409, 'دوره ای با این slug، از قبل وجود دارد!')
      }
    }

    cover && removeImage(course.cover?.split('/')?.reverse()[0])


    course.name = name
    course.shortDescription = shortDescription
    course.longDescription = longDescription
    course.price = price
    course.book_file_Group = bookFileGroup
    course.book_collection_id = bookCollectionId
    course.teacher = teacher
    course.level_id = levelId
    course.slug = slugifyedSlug
    course.introductionVideo = videoLink
    cover && (course.cover = `${configs.domain}/public/images/${cover.filename}`)
    await course.save()


    await TagCourses.destroy({ where: { course_id: id } })

    let createdTags = copyOfTags.map((tag) =>
      Tag.findOrCreate({ where: { name: tag.trim() } })
    );
    createdTags = await Promise.all(createdTags);

    await course.addTags(createdTags.map((tag) => tag[0]));

    return successResponse(res, 200, 'دوره با موفقیت ویرایش شد.')
  } catch (error) {
    next(error)
  }
}

const updateVideo = async (req, res, next) => {
  const {id} = req.params;
  const chunk = req.file.buffer;
  const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
  const totalChunks = Number(req.body.totalChunks); // Sent from the client
  const { fileName , prevLink } = req.body;

  const chunkDir = path.join(__dirname, '..', '..', 'public', 'introductionVideo', 'chunks') // Directory to save chunks

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = path.join(chunkDir, `${fileName}.part_${chunkNumber}`)

  try {
    await fs.promises.writeFile(chunkFilePath, chunk);
    let fileLink = '';

    if (chunkNumber === totalChunks) {
      // If this is the last chunk, merge all chunks into a single file
      fileLink = await mergeChunks(fileName, totalChunks, 'introductionVideo');

      const course =  await Course.findOne({where :{id}})
      if(!course){
        if(fs.existsSync(path.join(__dirname, '..' ,'..' ,'public', 'introductionVideo', fileLink.split('/').reverse()[0]))){
          fs.unlinkSync(path.join(__dirname, '..' ,'..' ,'public', 'introductionVideo', fileLink.split('/').reverse()[0]))
        }
        throw new Error("دوره یافت نشد.")
      }

      course.introductionVideo = fileLink;
      await course.save()

      const prevFileName = prevLink.split('/').reverse()[0]
      if(fs.existsSync(path.join(__dirname, '..' ,'..' ,'public', 'introductionVideo', prevFileName))){
        fs.unlinkSync(path.join(__dirname, '..' ,'..' ,'public', 'introductionVideo', prevFileName))
      }
    }

    successResponse(res, 200, "آپلود فایل با موفقت انجام شد.", { link: fileLink })
  } catch (error) {
    console.error("Error saving chunk:", error);
    if(fs.existsSync(path.join(__dirname, '..', '..', 'public', 'introductionVideo', 'chunks'))){
      fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'introductionVideo', 'chunks'), { recursive: true, force: true })
    }
    next(error)
  }
}

const updateStatus = async (req,res,next)=>{
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const {id} = req.params;

    const course = await Course.findOne({where : {id} , paranoid : false})

    if(!course){
      return errorResponse(res,400,'دوره مورد نظر یافت نشد.')
    }

    course.isCompleted = !course.isCompleted;
    await course.save()

    
    const {items , count , error} = await findCoursesByQuery(req)
    
    if(error){
      return next(error)
    }


    return successResponse(res,200,'وضعیت دوره با موفقیت تغیر یافت.', {courses : items , count})
  } catch (error) {
    next(error)
  }
}

const getShortCourseData = async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      attributes : ['id' , 'name'],
      paranoid : true,
    })

    return successResponse(res, 200, '', { courses })
  } catch (error) {
    next(error)
  }
}

const getLastCourses = async (req,res,next)=>{
  try {
    const courses = await Course.findAll({
      limit:6,
      attributes : ['id','name','cover','price','score','slug'],
      order : [['id', 'DESC']],
      include:[
        {model: User , attributes:['id','name'], paranoid:false},
        {model: Level , attributes:['id','name'], as:'level'},
        {model: Off , attributes:['percent'] ,where:{public : 1}, required:false},
      ]
    })

    const lastCourses = courses.map(item =>({
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
      offPercent: item.offs.length ? item.offs[0].percent : null,
    }))

    return successResponse(res,200,'',{courses : lastCourses})
  } catch (error) {
    next(error)
  }
}

const getUserSideCourse = async (req, res, next) => {
  try {
    const { slug } = req.params

    const course = await Course.findOne({
      where: { slug },
      include: [
        { model: User, attributes: ["id", 'name'] , paranoid:false},
        { model: Book, attributes: ["id", 'name', 'ageGrate'], as: 'book_collection' },
        { model: Level, attributes: ['id', 'name'], as: 'level' },
        {model: Tag, attributes: ['name'], through: { attributes: [] }},
        {model: Off , attributes:['percent','id'] ,where:{public : 1}, required:false},
        {model: Session , attributes:['id','name','time','isFree'], order:[['id']], limit: 3, required:false},
        {model: Comment ,
          attributes:['id','content','score','created_at'],
          where:{isAccept:1,parent_id : null},
          order:[['id' , 'DESC']], 
          limit: 3,
          required:false,
          include: [
            {model : Comment, as:'replies', attributes:['id','content','score','created_at'],where:{isAccept:1},required:false,
              include:[{model : User, attributes:['name','avatar'],paranoid:false,include:[{model:Role,as:'role',attributes:['name']}]}]},
            {model : User, attributes:['name','avatar'],paranoid:false,include:[{model:Role,as:'role',attributes:['name']}]},
          ]
        },
      ],
      attributes: {
        exclude: ['teacherId', 'levelId', 'book_collection_id']
      }
    });

    
    if (!course) {
      return errorResponse(res, 404, "موردی یافت نشد!")
    }

    const [result] = await db.query(
      `SELECT 
        COUNT(sessions.id) AS total_sessions,
        FLOOR(SUM(CAST(SUBSTRING_INDEX(sessions.time, ':', 1) AS UNSIGNED) * 60 + 
                  CAST(SUBSTRING_INDEX(sessions.time, ':', -1) AS UNSIGNED)) / 60) AS total_minutes,
        MOD(SUM(CAST(SUBSTRING_INDEX(sessions.time, ':', 1) AS UNSIGNED) * 60 + 
                CAST(SUBSTRING_INDEX(sessions.time, ':', -1) AS UNSIGNED)), 60) AS remaining_seconds,
        (
          SELECT COUNT(*) 
          FROM comments 
          WHERE comments.course_id = :courseId AND comments.parent_id IS NULL AND comments.isAccept = 1
        ) AS total_comments
      FROM sessions
      WHERE sessions.course_id = :courseId`
    , {
      replacements: { courseId: course.id },
      type: QueryTypes.SELECT,
    });

    const courseTime = (result.total_minutes === null) ? 'منتشر نشده' : `${result.total_minutes}:${result.remaining_seconds}`


    return successResponse(res, 200, '', { course , sessionCount:result.total_sessions, commentCount:result.total_comments , time:courseTime })
  } catch (error) {
    next(error)
  }
}

const getRelatedCourse = async (req, res, next) => {
  try {
    const { slug } = req.params

    const mainCourse = await Course.findOne({
      where:{slug},
      include:[{model:Tag , attributes:['id']}]
    })
    
    const relatedType1 = await Course.findAll({
      where:{book_collection_id:mainCourse.book_collection_id , id:{[Op.ne] : mainCourse.id}},
      limit:5,
      attributes:['id','name','slug','cover']
    })
    let relatedType2 = [];
    let relatedType3 = [];

    
    if(relatedType1.length < 5){
      const tagIds = mainCourse.tags.map(tag=>tag.id)
      const type1Ids = relatedType1.map(course=>course.id)

      if(tagIds.length){
        const results = await db.query(
          `SELECT 
            c.id,
            c.name,
            c.slug,
            c.cover,
            COUNT(t.id) AS matchCount
          FROM courses c
          JOIN tags_courses tc ON c.id = tc.course_id
          JOIN tags t ON t.id = tc.tag_id
          WHERE t.id IN (:tagIds) AND c.id != :mainCourseId ${type1Ids.length ? 'And c.id NOT IN (:type1Ids)':''}
          GROUP BY c.id
          ORDER BY matchCount DESC
          LIMIT 3`
        , {
          replacements: { tagIds, mainCourseId:mainCourse.id,type1Ids },
          type: QueryTypes.SELECT
        });
        relatedType2 = [...results]
      }

      const type2Ids = relatedType2.map(course=>course.id)

      if(relatedType1.length + relatedType2.length < 5){
        relatedType3 = await Course.findAll({
          where:{id:{[Op.notIn]:[mainCourse.id,...type2Ids,...type1Ids]}},
          attributes:['id','name','slug','cover'],
          order: [['id','DESC']],
          limit: (5 - (relatedType1.length + relatedType2.length))
        })
      }
    }
    return successResponse(res,200,'',{courses:[...relatedType1,...relatedType2,...relatedType3]})

  } catch (error) {
    next(error)
  }
}

const getRelatedCourseToArticle = async (req, res, next) => {
  try {
    const { slug } = req.params

    const mainArticle = await Article.findOne({
      where:{slug},
      include:[{model:Tag , attributes:['id']}]
    })
    
    let relatedType1 = [];
    let relatedType2 = [];

    
      const tagIds = mainArticle.tags.map(tag=>tag.id)

      if(tagIds.length){
        const results = await db.query(
          `SELECT 
            c.id,
            c.name,
            c.slug,
            c.cover,
            COUNT(t.id) AS matchCount
          FROM courses c
          JOIN tags_courses tc ON c.id = tc.course_id
          JOIN tags t ON t.id = tc.tag_id
          WHERE t.id IN (:tagIds)
          GROUP BY c.id
          ORDER BY matchCount DESC
          LIMIT 3`
        , {
          replacements: { tagIds },
          type: QueryTypes.SELECT
        });
        relatedType1 = [...results]
      }

      const type1Ids = relatedType1.map(course=>course.id)


      if(relatedType1.length < 5){
        relatedType2 = await Course.findAll({
          where:{id:{[Op.notIn]:type1Ids}},
          attributes:['id','name','slug','cover'],
          order: [['id','DESC']],
          limit: (5 - (relatedType1.length))
        })
      }
    
    return successResponse(res,200,'',{courses:[...relatedType1,...relatedType2]})

  } catch (error) {
    next(error)
  }
}

const getUserBagCourses = async (req,res,next)=>{
  try {
      const userId = req.user.id;

      const userBag = await UserBag.findAll({
        where : {user_id: userId},
        attributes : [],
        include:[
          {model:Course,attributes:['id','name','cover','price','slug'],include:[
            {model: Off , attributes:['id','percent'] ,where:{public : 1}, required:false},
          ]}
        ],
      })
      
      if(!userBag){
        return errorResponse(res,400,'موردی یافت نشد!')
      }

      const reformationCourses = userBag.map(item =>({
      id: item.course.id,
      name: item.course.name,
      cover: item.course.cover,
      price: item.course.price,
      slug: item.course.slug,
      // offPercent: item.offs.length ? item.offs[0].percent : null,
      offPrice: (item.course.offs.length && item.course.offs[0].percent) ? (Number(item.course.price) - Math.round((Number(item.course.price) * Number(item.course.offs[0].percent)) / 100)) : null,
    }))

    let totalMainPrice = 0;
    let totalPrice = 0;
    let totalOff = 0;
    reformationCourses.forEach(course=>{
      totalMainPrice += Number(course.price)
      if(course.offPrice){
        totalPrice += course.offPrice;
        totalOff += course.offPrice
      }else{
        totalPrice += Number(course.price)
      }
    })
      
      return successResponse(res,200,'',{courses:reformationCourses, totalPrice,totalOff, totalMainPrice})
  } catch (error) {
      next(error)
  }
}

const deleteCourseFromUserBag = async (req,res,next)=>{
  try {
      const userId = req.user.id;
      const courseId = req.params.courseId;

      const course = await UserBag.findOne({
        where : {
          user_id: userId,
          course_id: courseId
        }
      });

      if(!course){
        return errorResponse(res,400,'موردی جهت حذف یافت نشد!')
      }

      await course.destroy()

      const userBag = await UserBag.findAll({
        where : {user_id: userId},
        attributes : [],
        include:[
          {model:Course,attributes:['id','name','cover','price','slug'],include:[
            {model: Off , attributes:['id','percent'] ,where:{public : 1}, required:false},
          ]}
        ],
      })
      
      if(!userBag){
        return successResponse(res,200,'موردی یافت نشد!',{courses:[], totalPrice:0,totalOff:0, totalMainPrice:0})
      }

      const reformationCourses = userBag.map(item =>({
      id: item.course.id,
      name: item.course.name,
      cover: item.course.cover,
      price: item.course.price,
      slug: item.course.slug,
      offPrice: (item.course.offs.length && item.course.offs[0].percent) ? (Number(item.course.price) - Math.round((Number(item.course.price) * Number(item.course.offs[0].percent)) / 100)) : null,
    }))

    let totalMainPrice = 0;
    let totalPrice = 0;
    let totalOff = 0;
    reformationCourses.forEach(course=>{
      totalMainPrice += Number(course.price)
      if(course.offPrice){
        totalPrice += course.offPrice;
        totalOff += course.offPrice
      }else{
        totalPrice += Number(course.price)
      }
    })
      
      return successResponse(res,200,'',{courses:reformationCourses, totalPrice,totalOff, totalMainPrice})
  } catch (error) {
      next(error)
  }
}

module.exports = {
  getCreatingData,
  uploadVideo,
  createCourse,
  deleteFile,
  getCourses,
  deleteCourse,
  getCourse,
  updateCourse,
  updateVideo,
  updateStatus,
  getShortCourseData,
  getLastCourses,
  getUserSideCourse,
  getRelatedCourse,
  getRelatedCourseToArticle,
  getUserBagCourses,
  deleteCourseFromUserBag
}