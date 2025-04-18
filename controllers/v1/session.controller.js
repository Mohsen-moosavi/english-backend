const path = require("path");
const fs = require("fs");
const { mergeChunks } = require("../../services/uploadFile");
const { Session, Course } = require("../../db");
const { successResponse, errorResponse } = require("../../utils/responses");
const { validationResult } = require("express-validator");
const { findSessionsByQuery } = require("../../utils/finder.util");

const uploadVideo = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            if(fs.existsSync(path.join(__dirname, '..', '..', 'public', 'videos', 'chunks'))){
                fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'videos', 'chunks'), { recursive: true, force: true })
            }
            return errorResponse(res, 400, validationError.errors[0].msg)
        }
        
        const chunk = req.file.buffer;
        const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
        const totalChunks = Number(req.body.totalChunks); // Sent from the client
        const { fileName, courseId, time } = req.body;

        if (chunkNumber === 0) {
            const course = await Course.findOne({ where: { id: courseId } })
            if (!course) {
                if(fs.existsSync(path.join(__dirname, '..', '..', 'public', 'videos', 'chunks'))){
                    fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'videos', 'chunks'), { recursive: true, force: true })
                }
                return errorResponse(res, 404, 'دوره مربوطه، یافت نشد.')
            }
        }

        const chunkDir = path.join(__dirname, '..', '..', 'public', 'videos', 'chunks') // Directory to save chunks

        if (!fs.existsSync(chunkDir)) {
            fs.mkdirSync(chunkDir);
        }

        const chunkFilePath = path.join(chunkDir, `${fileName}.part_${chunkNumber}`)

        // if (canceling) {
        //     fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'introductionVideo', 'chunks'), { recursive: true, force: true })
        //     return errorResponse(res, 400, 'عملیات لغو شد.')
        // }



        await fs.promises.writeFile(chunkFilePath, chunk);

        if (chunkNumber === totalChunks) {
            // If this is the last chunk, merge all chunks into a single file
            const fileLink = await mergeChunks(fileName, totalChunks, 'videos');
            const course = await Course.findOne({ where: { id: courseId } })
            if (!course && fs.existsSync(path.join(__dirname, '..', '..', 'public', 'videos', fileName))) {
                fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'videos', fileName), { recursive: true, force: true })
                return errorResponse(res, 404, 'دوره مربوطه، یافت نشد.')
            }
            const newSession = await Session.create({
                time,
                name: 'جلسه درس',
                isFree: false,
                video: fileLink,
                course_id: courseId
            })
            return successResponse(res, 200, "آپلود ویدئو با موفقت انجام شد.", { session: newSession })
        }

        successResponse(res, 200, '', { chunkNumber, totalChunks })

    } catch (error) {
        fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'videos', 'chunks'), { recursive: true, force: true })
        next(error)
    }
}

const updateVideo = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            if(fs.existsSync(path.join(__dirname, '..', '..', 'public', 'videos', 'chunks'))){
                fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'videos', 'chunks'), { recursive: true, force: true })
            }
            return errorResponse(res, 400, validationError.errors[0].msg)
        }


        const chunk = req.file.buffer;
        const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
        const totalChunks = Number(req.body.totalChunks); // Sent from the client
        const { fileName, sessionId, time } = req.body;

        if (chunkNumber === 0) {
            const session = await Session.findOne({ where: { id: sessionId } })
            if (!session) {
                if(fs.existsSync(path.join(__dirname, '..', '..', 'public', 'videos', 'chunks'))){
                    fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'videos', 'chunks'), { recursive: true, force: true })
                }
                return errorResponse(res, 404, 'جلسه مربوطه، یافت نشد.')
            }
        }

        const chunkDir = path.join(__dirname, '..', '..', 'public', 'videos', 'chunks') // Directory to save chunks

        if (!fs.existsSync(chunkDir)) {
            fs.mkdirSync(chunkDir);
        }

        const chunkFilePath = path.join(chunkDir, `${fileName}.part_${chunkNumber}`)

        // if (canceling) {
        //     fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'introductionVideo', 'chunks'), { recursive: true, force: true })
        //     return errorResponse(res, 400, 'عملیات لغو شد.')
        // }



        await fs.promises.writeFile(chunkFilePath, chunk);

        if (chunkNumber === totalChunks) {
            // If this is the last chunk, merge all chunks into a single file
            const fileLink = await mergeChunks(fileName, totalChunks, 'videos');
            const session = await Session.findOne({ where: { id: sessionId } })
            if (!session && fs.existsSync(path.join(__dirname, '..', '..', 'public', 'videos', fileName))) {
                fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'videos', fileName), { recursive: true, force: true })
                return errorResponse(res, 404, 'جلسه مربوطه، یافت نشد.')
            }

            const prevVideoLink = session.video;

            session.video = fileLink;
            await session.save();

            if (fs.existsSync(path.join(__dirname, '..', '..', 'public', 'videos', prevVideoLink.split('/').reverse()[0]))) {
                fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'videos', prevVideoLink.split('/').reverse()[0]))
            }

            return successResponse(res, 200, "آپلود ویدئو با موفقت انجام شد.", { session })
        }

        successResponse(res, 200, '', { chunkNumber, totalChunks })

    } catch (error) {
        fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'videos', 'chunks'), { recursive: true, force: true })
        next(error)
    }
}

const uploadSessionDetails = async (req, res, next) => {
    try {
        const chunk = req.file.buffer;
        const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
        const totalChunks = Number(req.body.totalChunks); // Sent from the client
        const { fileName, sessionId, name, isFree } = req.body;

        console.log('isFree======================>', isFree, typeof isFree)

        if (chunkNumber === 0) {
            const session = await Session.findOne({ where: { id: sessionId } })
            if (!session) {
                return errorResponse(res, 404, 'جلسه مربوطه، یافت نشد.')
            }

            if (typeof name !== 'string') {
                return errorResponse(res, 400, "نام وارد شده، معتبر نمی باشد.")
            }
            if (name?.length < 3) {
                return errorResponse(res, 400, "نام وارد شده، حداقل باید 3 کاراکتر باشد.")
            }
            if (Number(isFree) !== 1 && Number(isFree) !== 0) {
                return errorResponse(res, 400, "وضعیت مشخص شده، معتبر نمی باشد.")
            }
        }

        const chunkDir = path.join(__dirname, '..', '..', 'public', 'files', 'chunks') // Directory to save chunks

        if (!fs.existsSync(chunkDir)) {
            fs.mkdirSync(chunkDir);
        }

        const chunkFilePath = path.join(chunkDir, `${fileName}.part_${chunkNumber}`)

        // if (canceling) {
        //     fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'introductionVideo', 'chunks'), { recursive: true, force: true })
        //     return errorResponse(res, 400, 'عملیات لغو شد.')
        // }



        await fs.promises.writeFile(chunkFilePath, chunk);

        if (chunkNumber === totalChunks) {
            // If this is the last chunk, merge all chunks into a single file
            const fileLink = await mergeChunks(fileName, totalChunks, 'files');
            const session = await Session.findOne({ where: { id: sessionId } })
            if (!session && fs.existsSync(path.join(__dirname, '..', '..', 'public', 'files', fileName))) {
                fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'files', fileName), { recursive: true, force: true })
                return errorResponse(res, 404, 'جلسه مربوطه، یافت نشد.')
            }
            if (typeof name !== 'string') {
                if (fs.existsSync(path.join(__dirname, '..', '..', 'public', 'files', fileName))) {
                    fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'files', fileName), { recursive: true, force: true })
                }
                return errorResponse(res, 400, "نام وارد شده، معتبر نمی باشد.")
            }
            if (name?.length < 3) {
                if (fs.existsSync(path.join(__dirname, '..', '..', 'public', 'files', fileName))) {
                    fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'files', fileName), { recursive: true, force: true })
                }
                return errorResponse(res, 400, "نام وارد شده، حداقل باید 3 کاراکتر باشد.")
            }
            if (Number(isFree) !== 1 && Number(isFree) !== 0) {
                if (fs.existsSync(path.join(__dirname, '..', '..', 'public', 'files', fileName))) {
                    fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'files', fileName), { recursive: true, force: true })
                }
                return errorResponse(res, 400, "وضعیت مشخص شده، معتبر نمی باشد.")
            }

            if (session.file) {
                const prevFileName = session.file.split('/').pop()
                if (fs.existsSync(path.join(__dirname, '..', '..', 'public', 'files', prevFileName))) {
                    fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'files', prevFileName))
                }
            }

            session.name = name;
            session.isFree = isFree;
            session.file = fileLink;
            await session.save()

            return successResponse(res, 200, "ویرایش اطلاعات با موفقت انجام شد.", { session: session })
        }

        successResponse(res, 200, '')

    } catch (error) {
        fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'files', 'chunks'), { recursive: true, force: true })
        next(error)
    }
}

const uploadSessionDetailsWithoutFile = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { sessionId, name, isFree } = req.body;

        const session = await Session.findOne({ where: { id: sessionId } })
        if (!session) {
            return errorResponse(res, 404, 'جلسه مربوطه، یافت نشد.')
        }

        session.name = name;
        session.isFree = isFree;
        await session.save()

        return successResponse(res, 200, "ویرایش اطلاعات با موفقت انجام شد.", { session: session })

    } catch (error) {
        fs.rmdirSync(path.join(__dirname, '..', '..', 'public', 'files', 'chunks'), { recursive: true, force: true })
        next(error)
    }
}

const getSessions = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { items, count, error } = await findSessionsByQuery(req);
        if (error) {
            return next(error)
        }

        successResponse(res, 200, "", { sessions: items, count });

    } catch (error) {
        next(error)
    }
}

const getSingleSessionforAdmin = async (req, res, next) => {
    try {

        const { id } = req.params;

        const session = await Session.findOne({
            where: { id },
            attributes: { exclude: ['q4game_id', 'mediagame_id', 'phrasegame_id'] },
        })

        if (!session) {
            return errorResponse(res, 400, 'جلسه مربوطه یافت نشد.')
        }

        return successResponse(res, 200, "", { session });

    } catch (error) {
        next(error)
    }
}

const deleteSession = async (req,res,next)=>{
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }


        const {id} = req.params;

        const session = await Session.findOne({where : {id}})

        if(!session){
            return errorResponse(res,400,'جلسه مورد نظر یافت نشد.')
        }

        console.log("session======================================>" , session)

        const videoFileName = session.video.split('/').pop();
        const fileName = session.file?.split('/').pop();

        if (fs.existsSync(path.join(__dirname, '..', '..', 'public', 'videos', videoFileName))) {
            fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'videos', videoFileName), { recursive: true, force: true })
        }
        if (fileName && fs.existsSync(path.join(__dirname, '..', '..', 'public', 'files', fileName))) {
            fs.unlinkSync(path.join(__dirname, '..', '..', 'public', 'files', fileName), { recursive: true, force: true })
        }

        await session.destroy();

        const { items, count, error } = await findSessionsByQuery(req);
        if (error) {
            return next(error)
        }

        return successResponse(res,200,"جلسه با موفقیت حذف شد.",{ sessions: items, count })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    uploadVideo,
    uploadSessionDetails,
    uploadSessionDetailsWithoutFile,
    getSessions,
    getSingleSessionforAdmin,
    updateVideo,
    deleteSession
}