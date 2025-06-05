const { validationResult } = require("express-validator");
const { errorResponse, successResponse } = require("../../utils/responses");
const { Contact, User } = require("../../db");
const { sendEmailService } = require("../../services/email");

const createContact = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { email, message } = req.body;
        const userId = req.user.id;

        await Contact.create({
            email,
            message,
            answered:false,
            seen:false,
            user_id: userId,
        })

        successResponse(res, 201, "نظر شما، با موفقیت ثبت و پس از بررسی، در صورت نیاز، پاسخ به ایمیل شما ارسال خواهد شد.");

    } catch (error) {
        next(error)
    }
}

const getContacts = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { items, count, error } = await findContactsByQuery(req)

        if (error) {
            return next(error)
        }

        return successResponse(res, 200,'',{contacts : items, count});
    } catch (error) {
        next(error)
    }
}

const changeStatusOfContact = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const status = req.query.newStatus;
        const contactId = req.params.id;

        const contact = await Contact.findOne({where:{
            id:contactId
        }})

        if(!contact){
            return errorResponse(res,404,'پیغام مورد نظر یافت نشد!')
        }

        contact.seen = status === "seen" ? true : false;
        await contact.save()

        const { items, count, error } = await findContactsByQuery(req)

        if (error) {
            return next(error)
        }

        return successResponse(res, 200,`وضعیت پیغام با موفقیت به حالت ${status === 'seen' ? 'خوانده شده':'خوانده نشده'} تغییر پیدا کرد.`,{contacts : items, count});
    } catch (error) {
        next(error)
    }
}

const answerToContact = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const {message , email} = req.body;
        const contactId = req.params.id;

        const contact = await Contact.findOne({where:{
            id:contactId
        }})

        if(!contact){
            return errorResponse(res,404,'پیغام مورد نظر یافت نشد!')
        }

        const sendEmailError = await sendEmailService(email,message)

        if(sendEmailError){
            return errorResponse(res,400,'ارسال ایمیل با خطا مواجه شد!')
        }

        contact.answered = true
        await contact.save()

        const { items, count, error } = await findContactsByQuery(req)

        if (error) {
            return next(error)
        }

        return successResponse(res, 200,'پاسخ شما با موفقیت برای کاربر، ارسال شد.',{contacts : items, count});
    } catch (error) {
        next(error)
    }
}

const deleteContact = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const {id} = req.params

        const contact = await Contact.findOne({
            where : {id}
        })

        if(!contact){
            return errorResponse(res,404,'پیغام مورد نظر یافت نشد!')
        }

        await contact.destroy()

        const { items, count, error } = await findContactsByQuery(req)

        if (error) {
            return next(error)
        }

        return successResponse(res, 200,'پیغام مورد نظر، با موفقیت حذف شد.',{contacts : items, count});
    } catch (error) {
        next(error)
    }
}


module.exports = {
    createContact,
    getContacts,
    changeStatusOfContact,
    answerToContact,
    deleteContact
}





async function findContactsByQuery(req) {
    try {
        const { limit, offset, status, answering } = req.query;

        const finderObject = {};

        status === 'seen' && (finderObject.seen = true);
        status === 'notSeen' && (finderObject.seen = false);

        answering === 'answered' && (finderObject.answered = true);
        answering === 'notAnswered' && (finderObject.answered = false);

        const { rows: contacts, count } = await Contact.findAndCountAll(
            {
                where: finderObject,
                limit: Number(limit),
                offset: Number(offset),
                order: [['id', 'DESC']],
                include : [
                    {model:User,attributes:['name']}
                ]
            });

        return { items: contacts, count }
    } catch (error) {
        return { error }
    }
}