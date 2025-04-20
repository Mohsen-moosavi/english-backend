const { mergeChunks } = require("../../services/uploadFile");
const { successResponse, errorResponse } = require("../../utils/responses");
const path = require("path")
const fs = require("fs");
const { removeImage } = require("../../utils/fs.utils");
const { validationResult } = require("express-validator");
const { default: slugify } = require("slugify");
const { Book, Tag, File, TagBooks, Course } = require("../../db");
const { Op, Sequelize } = require("sequelize");
const configs = require("../../configs");
const { findBooksByQuery } = require("../../utils/finder.util");

const uploadFile = async (req, res, next) => {
  console.log("Hit");
  const chunk = req.file.buffer;
  const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
  const totalChunks = Number(req.body.totalChunks); // Sent from the client
  const { group, type, name, fileName, bookId, canceling } = req.body

  const chunkDir = path.join(__dirname, '..', '..', 'public', 'files', 'chunks') // Directory to save chunks

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

  if (canceling) {
    fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'files', 'chunks'), { recursive: true, force: true })
    return errorResponse(res, 400, "عملیات لغو شد.")
  }

  try {
    await fs.promises.writeFile(chunkFilePath, chunk);
    let fileLink = '';

    if (chunkNumber === totalChunks) {
      // If this is the last chunk, merge all chunks into a single file
      fileLink = await mergeChunks(fileName, totalChunks, 'files');
      await File.create({ name, link: fileLink, group, type, book_id: bookId })
    }

    return successResponse(res, 200, "آپلود فایل با موفقت انجام شد.", { link: fileLink })
  } catch (error) {
    console.error("Error saving chunk:", error);
    fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'files', 'chunks'), { recursive: true, force: true })
    next(error)
  }
}

const createBook = async (req, res, next) => {
  try {
    const validationError = validationResult(req)
    const cover = req.file;

    if (validationError?.errors && validationError?.errors[0]) {
      removeImage(cover.filename)
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { name, shortDescription, longDescription, slug, links, tags, ageGrate, grate } = req.body;

    const slugifyedSlug = slugify(slug, {
      trim: true
    })

    const copyOfTags = tags[0].split(',')


    const [newBook, isNewBook] = await Book.findOrCreate({
      where: { [Op.or]: [{ name }, { slug: slugifyedSlug }] },
      defaults: { name, slug: slugifyedSlug, shortDescription, longDescription, links, ageGrate, grate, cover: `${configs.domain}/public/images/${cover.filename}` },
      raw: true
    })

    if (!isNewBook) {
      removeImage(cover.filename)
      if (newBook.name === name) {
        return errorResponse(res, 409, 'مجموعه ای با این عنوان، از قبل وجود دارد!')
      } else {
        return errorResponse(res, 409, 'مجموعه ای با این slug، از قبل وجود دارد!')
      }
    }

    let createdTags = copyOfTags.map((tag) =>
      Tag.findOrCreate({ where: { name: tag.trim() } })
    );
    createdTags = await Promise.all(createdTags);


    await newBook.addTags(createdTags.map((tag) => tag[0]));
    console.log('tags =====>', createdTags)

    return successResponse(res, 201, 'مجموعه با موفقیت ایجاد شد.', { bookId: newBook.id })

  } catch (error) {
    next(error)
  }
}

const deleteBookWhitoutGettingAll = async (req, res, next) => {
  try {
    const { id } = req.params
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const deletedBook = await Book.findOne({
      where: { id }
    })

    if (deletedBook) {
      removeImage(deletedBook.cover?.split('/')?.reverse()[0])
      await deletedBook.destroy()
    }

    successResponse(res, 200, "مجموعه با موفقیت حذف شد.")
  } catch (error) {
    next(error)
  }
}

const deleteFile = async (req, res, next) => {
  try {
    const { fileNames } = req.body;
    const dirPath = path.join(__dirname, '..', '..', 'public', 'files')

    fileNames.forEach(async (fileName) => {
      await File.destroy(
        { where: { link: { [Op.like]: `%${fileName}%` } } }
      )
    })

    fileNames.forEach(fileName => {
      if (fs.existsSync(path.join(dirPath, fileName))) {
        fs.unlinkSync(path.join(dirPath, fileName));
      }
    })

    successResponse(res, 200, "فایل با موفقیت حذف شد.")
  } catch (error) {
    next(error)
  }
}

const getAllBooks = async (req, res, next) => {
  try {
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { items, count, error } = await findBooksByQuery(req)

    if(error){
      next(error)
    }

    return successResponse(res, 200, '', { books: items, count })
  } catch (error) {
    next(error)
  }
}

const deleteBookWithGettingAll = async (req, res, next) => {
  try {
    const { id } = req.params
    const validationError = validationResult(req)

    if (validationError?.errors && validationError?.errors[0]) {
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { limit, offset, search } = req.query;

    const deletedBook = await Book.findOne({
      where: { id }
    })

    if (!deletedBook) {
      return errorResponse(res, 400, "موردی جهت حذف یافت نشد!")
    }

    const deletedFiles = await File.findAll({
      where: { book_id: id },
      raw: true
    })

    deletedFiles.forEach((file) => {
      const dirPath = path.join(__dirname, '..', '..', 'public', 'files')
      const filePath = file.link?.split('/')?.reverse()[0]
      if (fs.existsSync(path.join(dirPath, filePath))) {
        console.log('deleted================================================>', filePath)
        fs.unlinkSync(path.join(dirPath, filePath));
      }
    })

    await File.destroy({
      where: { book_id: id }
    })

    removeImage(deletedBook.cover?.split('/')?.reverse()[0])
    await deletedBook.destroy()

    const { items, count, error } = await findBooksByQuery(req)

    if(error){
      next(error)
    }

    return successResponse(res, 200, "مجموعه با موفقیت حذف شد.", { books: items, count })
  } catch (error) {
    next(error)
  }
}

const getBook = async (req, res, next) => {
  try {
    const { id } = req.params

    const book = await Book.findOne({
      where: { id },
      include: [
        {
          model: File,
        },
        {
          model: Tag,
          attributes: ['name'],
          through: { attributes: [] }
        }
      ]
    });

    if (!book) {
      errorResponse(res, 404, "موردی یافت نشد!")
    }

    return successResponse(res, 200, '', { book })
  } catch (error) {
    next(error)
  }
}

const updateBook = async (req, res, next) => {
  try {
    const validationError = validationResult(req)
    const cover = req.file;

    if (validationError?.errors && validationError?.errors[0]) {
      cover && removeImage(cover.filename)
      return errorResponse(res, 400, validationError.errors[0].msg)
    }

    const { name, shortDescription, longDescription, slug, links, tags, ageGrate, grate } = req.body;
    const { id } = req.params;

    const slugifyedSlug = slugify(slug, {
      trim: true
    })

    const updatedBook = await Book.findOne({ where: { id } })

    if (!updatedBook) {
      cover && removeImage(cover.filename)
      return errorResponse(res, 400, "موردی جهت ویرایش یافت نشد.")
    }

    if (updatedBook.name !== name || updatedBook?.slug !== slugifyedSlug) {
      const oldBook = await Book.findOne({ where: { id: { [Op.ne]: id }, [Op.or]: { name, slug: slugifyedSlug } } })
      if (oldBook) {
        cover && removeImage(cover.filename)
        if (oldBook.name === name) {
          return errorResponse(res, 409, 'مجموعه ای با این عنوان، از قبل وجود دارد!')
        }
        return errorResponse(res, 409, 'مجموعه ای با این slug، از قبل وجود دارد!')
      }
    }

    const copyOfTags = tags[0].split(',')

    cover && removeImage(updatedBook.cover?.split('/')?.reverse()[0])


    updatedBook.name = name
    updatedBook.slug = slugifyedSlug
    updatedBook.shortDescription = shortDescription
    updatedBook.longDescription = longDescription
    updatedBook.links = links
    updatedBook.ageGrate = ageGrate
    updatedBook.grate = grate
    cover && (updatedBook.cover = `${configs.domain}/public/images/${cover.filename}`)
    await updatedBook.save()

    await TagBooks.destroy({ where: { book_id: id } })

    let createdTags = copyOfTags.map((tag) =>
      Tag.findOrCreate({ where: { name: tag.trim() } })
    );
    createdTags = await Promise.all(createdTags);

    await updatedBook.addTags(createdTags.map((tag) => tag[0]));

    return successResponse(res, 201, 'مجموعه با موفقیت ویرایش شد.', { bookId: updatedBook.id })

  } catch (error) {
    next(error)
  }
}

const getBooksGroup = async (req, res, next) => {
  try {

    const { id } = req.params;
    const fileGroups = await File.findAll({
      where: { book_id: id },
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('group')), 'group']
      ],
      raw: true
    })

    return successResponse(res, 200, '', { groups: fileGroups })
  } catch (error) {
    next(error)
  }
}

const getLastBook = async (req,res,next)=>{
  try {
    const books = await Book.findAll({
      // limit:6,
      attributes : [
        'name',
        'slug',
        'cover',
        [Sequelize.fn('COALESCE',Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('courses.id'))) , 0), 'courseCount'],
      ],
      include:[
        { model: Course, attributes: [], required: false },
      ],
      group:['Book.id']
    })

    successResponse(res,200,'',{books})
  } catch (error) {
    next(error)
  }
}



module.exports = {
  createBook,
  uploadFile,
  deleteFile,
  deleteBookWhitoutGettingAll,
  getAllBooks,
  deleteBookWithGettingAll,
  getBook,
  updateBook,
  getBooksGroup,
  getLastBook
}