const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const configs = require("../../configs");
const { Extrafile } = require("../../db");
const { successResponse, errorResponse } = require("../../utils/responses");

const uploadFile = async (req, res, next) => {
    const image = req.file;
    try {
        const extrafile = await Extrafile.create({
            link: `${configs.domain}/public/extraFiles/${image.filename}`,
            books: 0,
            courses: 0,
            articles: 0,
        })

        return successResponse(res, 201, 'فایل با موفقیت آپلود شد.', { extrafile })
    } catch (error) {
        if (fs.existsSync(path.join(__dirname, '..', 'public', 'extraFiles', image.filename))) {
            fs.unlinkSync(path.join(__dirname, '..', 'public', 'extraFiles', image.filename))
        }
        next(error)
    }
}

const getFiles = async (req, res, next) => {
    try {
        const { items, count, error } = await findExtrafileByQuery(req)

        if (error) {
            return next(error)
        }

        return successResponse(res, 200, '', { extrafiles: items, count })
    } catch (error) {
        next(error)
    }
}

const deleteFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const extraFile = await Extrafile.findOne({
            where: { id }
        })

        if (!extraFile) {
            return errorResponse(res, 400, 'فایل مورد نظر یافت نشد!')
        }

        if (extraFile.books > 0 || extraFile.articles > 0 || extraFile.courses > 0) {
            return errorResponse(res, 400, 'شما نمی توانید فایلی را که از آن در سایت استفاده شده را حذف کنید!')
        }

        const fileName = extraFile.link.split('/').pop()
        if (fs.existsSync(path.join(__dirname, '..', '..', 'public', 'extraFiles', fileName))) {
            fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'extraFiles', fileName))
        }

        const deletedExtraFileId = extraFile.id;

        await extraFile.destroy()

        return successResponse(res, 201, 'فایل با موفقیت حذف شد.', { deletedExtraFileId })
    } catch (error) {
        next(error)
    }
}


module.exports = {
    uploadFile,
    getFiles,
    deleteFile
}


async function findExtrafileByQuery(req) {
    try {
        const { limit, offset, articles, books, courses } = req.query;

        const finderObject = {}

        if (articles === 'has') finderObject.articles = { [Op.gt]: 0 };
        if (articles === 'not') finderObject.articles = 0;

        if (books === 'has') finderObject.books = { [Op.gt]: 0 };
        if (books === 'not') finderObject.books = 0;

        if (courses === 'has') finderObject.courses = { [Op.gt]: 0 };
        if (courses === 'not') finderObject.courses = 0;

        const { rows: files, count } = await Extrafile.findAndCountAll({
            where: finderObject,
            limit: Number(limit),
            offset: Number(offset),
            order : [['id' , 'DESC']]
        })

        return { items: files, count }

    } catch (error) {
        return { error }
    }
}