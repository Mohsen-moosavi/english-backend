const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { Book, User, Role, Level, Course, Tag, TagCourses } = require("../../db");
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

    const { limit, offset, search, status, teacherId, bookId, levelId, priceStatus, scoreStatus } = req.query

    const deletedCourse = await Course.findOne({
      where: { id }
    })

    if (!deletedCourse) {
      return errorResponse(res, 400, 'موردی جهت حذف یافت نشد!')
    }

    removeImage(deletedCourse.cover?.split('/')?.reverse()[0])
    removeIntroductionVideo(deletedCourse.introductionVideo?.split('/')?.reverse()[0])

    await deletedCourse.destroy()


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
      })

    return successResponse(res, 200, 'دوره با موفقیت حذف شد.', { courses, count })
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
        { model: User, attributes: ["id", 'name'] },
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
      errorResponse(res, 404, "موردی یافت نشد!")
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
    const {id} = req.params;

    console.log('items======================================>')
    const course = await Course.findOne({where : {id}})

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
  updateStatus
}