const { validationResult } = require("express-validator");
const { Comment, db, Course, User, Role } = require("../../db");
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

        successResponse(res, 201, "کامنت، با موفقیت ثبت و پس از بررسی توسط مدیران، نمایش داده خواهد شد.");

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

        const { items, count,error } = await findCommentsByQuery(req);
        if(error){
            return next(error)
        }

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

const getCommentsForUserSide = async (req, res, next) => {
    try {
        const {courseId} = req.params;

        const offset = parseInt(req.query.offset || '0');

        const results = await db.query(
            `SELECT 
              c.id AS comment_id,
              c.content AS comment_content,
              c.score AS comment_score,
              c.created_at AS comment_created_at,
              cu.name AS comment_user_name,
              cu.avatar AS comment_user_avatar,
              cr.name AS comment_user_role,
          
              r.id AS reply_id,
              r.content AS reply_content,
              r.score AS reply_score,
              r.created_at AS reply_created_at,
              ru.name AS reply_user_name,
              ru.avatar AS reply_user_avatar,
              rr.name AS reply_user_role
          
            FROM comments c
            LEFT JOIN users cu ON c.user_id = cu.id
            LEFT JOIN roles cr ON cu.role_id = cr.id
          
            LEFT JOIN comments r ON r.parent_id = c.id AND r.isAccept = 1
            LEFT JOIN users ru ON r.user_id = ru.id
            LEFT JOIN roles rr ON ru.role_id = rr.id
          
            WHERE c.course_id = ${courseId} AND c.parent_id IS NULL AND c.isAccept = 1
            ORDER BY c.id DESC
            LIMIT 10 OFFSET ${offset}`
          , {
            replacements: {},
            type: QueryTypes.SELECT
          });

          const groupedComments = [];

    const commentMap = new Map();

    for (const row of results) {
    const commentId = row.comment_id;

    // اگر این کامنت قبلاً ثبت نشده بود
    if (!commentMap.has(commentId)) {
      const commentObj = {
        id: commentId,
        content: row.comment_content,
        score: row.comment_score,
        created_at: row.comment_created_at,
        user: {
          name: row.comment_user_name,
          avatar: row.comment_user_avatar,
          role: row.comment_user_role,
        },
        replies: []
      };

      commentMap.set(commentId, commentObj);
      groupedComments.push(commentObj);
    }

    // اگر ریپلای‌ای وجود دارد، اضافه‌اش کن
    if (row.reply_id) {
      const replyObj = {
        id: row.reply_id,
        content: row.reply_content,
        score: row.reply_score,
        created_at: row.reply_created_at,
        user: {
          name: row.reply_user_name,
          avatar: row.reply_user_avatar,
          role: row.reply_user_role,
        }
      };

      commentMap.get(commentId).replies.push(replyObj);
    }
    }
        successResponse(res,200,'',{comments:groupedComments,newOffset:(offset + groupedComments.length)})
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
    commentLoopAnswer,
    getCommentsForUserSide
}