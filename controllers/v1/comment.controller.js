const { validationResult } = require("express-validator");
const { Comment, db, Course } = require("../../db");
const { successResponse, errorResponse } = require("../../utils/responses");
const { findCommentsByQuery, findCommentReplies, setCourseAverageScore } = require("../../utils/finder.util");
const { QueryTypes, Op } = require("sequelize");

const createComment = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { content, score, courseId, parentId } = req.body;
        const user = req.user;

        await Comment.create({
            content,
            score,
            course_id: courseId,
            parent_id: parentId,
            user_id: user.id
        })

        successResponse(res, 201, "کامنت، با موفقیت ثبت شد.");

    } catch (error) {
        next(error)
    }
}


const getComments = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }
        const { items, count } = await findCommentsByQuery(req);

        successResponse(res, 200, '', { comments: items, count });

    } catch (error) {
        next(error)
    }
}

const changeStatus = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { id } = req.params;
        const { accept } = req.body;

        const mainComment = await Comment.findOne({
            where: { id }
        })

        if (!mainComment) {
            return errorResponse(res, 400, "موردی یافت نشد.")
        }

        mainComment.isAccept = accept ? 1 : 0;
        await mainComment.save()

        await setCourseAverageScore(mainComment.course_id)

        const { items, count } = await findCommentsByQuery(req);

        successResponse(res, 200, `کامنت با موفقیت ${accept ? 'تایید' : 'رد'} شد.`, { comments: items, count });

    } catch (error) {
        next(error)
    }
}

const deleteComment = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { id } = req.params;

        const deletedComment = await Comment.findOne({ where: { id } })

        if (!deletedComment) {
            return errorResponse(res, 400, "موردی یافت نشد.")
        }

        await deletedComment.destroy()

        await setCourseAverageScore(deletedComment.course_id)

        const { items, count, error } = await findCommentsByQuery(req);
        if (error) {
            return next(error)
        }

        successResponse(res, 200, `کامنت با موفقیت حذف شد.`, { comments: items, count });

    } catch (error) {
        next(error)
    }
}

const getCommentLoop = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { tree, notFound, error } = await findCommentReplies(id)

        if (error) {
            return next(error)
        }

        if (notFound) {
            return errorResponse(res, 400, 'هیچ کامنت مرتبطی یافت نشد')
        }

        successResponse(res, 200, '', { commentTree: tree });

    } catch (error) {
        next(error)
    }
}

const changeAcceptWithGettingLoop = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { id } = req.params;
        const { accept } = req.body;

        const mainComment = await Comment.findOne({
            where: { id }
        })

        if (!mainComment) {
            return errorResponse(res, 400, "موردی یافت نشد.")
        }

        mainComment.isAccept = accept ? 1 : 0;
        await mainComment.save()

        await setCourseAverageScore(mainComment.course_id)

        const { tree, notFound, error } = await findCommentReplies(id)

        if (error) {
            return next(error)
        }

        if (notFound) {
            return errorResponse(res, 400, 'هیچ کامنت مرتبطی یافت نشد')
        }

        successResponse(res, 200, `کامنت با موفقیت ${accept ? 'تایید' : 'رد'} شد.`, { commentTree: tree });

    } catch (error) {
        next(error)
    }
}

const deleteCommentWithGettingLoop = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { mainCommentId } = req.query;

        const deletedComment = await Comment.findOne({ where: { id } })

        if (!deletedComment) {
            return errorResponse(res, 400, "موردی یافت نشد.")
        }

        await deletedComment.destroy()

        await setCourseAverageScore(deletedComment.course_id)

        const { tree, notFound, error } = await findCommentReplies(mainCommentId)

        if (error) {
            return next(error)
        }

        if (notFound) {
            return errorResponse(res, 400, 'هیچ کامنت مرتبطی یافت نشد')
        }

        successResponse(res, 200, `کامنت با موفقیت حذف شد.`, { commentTree: tree });

    } catch (error) {
        next(error)
    }
}

const answer = async (req, res, next) => {
    try {

        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { content, courseId, parentId } = req.body;
        const user = req.user;

        await Comment.create({
            content,
            course_id: courseId,
            parent_id: parentId,
            isAccept: true,
            user_id: user.id
        })

        const { items, count } = await findCommentsByQuery(req);

        successResponse(res, 201, "کامنت، با موفقیت ثبت شد.", { comments: items, count });

    } catch (error) {
        next(error)
    }
}

const commentLoopAnswer = async (req, res, next) => {
    try {

        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { content, courseId, parentId } = req.body;
        const user = req.user;

        await Comment.create({
            content,
            course_id: courseId,
            parent_id: parentId,
            isAccept: true,
            user_id: user.id
        })

        const { id } = req.params;

        const { tree, notFound, error } = await findCommentReplies(id)

        if (error) {
            return next(error)
        }

        if (notFound) {
            return errorResponse(res, 400, 'هیچ کامنت مرتبطی یافت نشد')
        }
        
        successResponse(res, 201, "کامنت، با موفقیت ثبت شد.", { commentTree: tree });

    } catch (error) {
        next(error)
    }
}



module.exports = {
    createComment,
    getComments,
    changeStatus,
    deleteComment,
    getCommentLoop,
    changeAcceptWithGettingLoop,
    deleteCommentWithGettingLoop,
    answer,
    commentLoopAnswer
}