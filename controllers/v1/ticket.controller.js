const { validationResult } = require("express-validator")
const { errorResponse, successResponse } = require("../../utils/responses")
const { Ticket, TicketMessage, User } = require("../../db")
const { findTicketsByQuery } = require("../../utils/finder.util")
const { where } = require("sequelize")

const createTicket = async (req, res, next) => {
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { subject, message,title } = req.body;
        const { user } = req;

        const count = await Ticket.count({ where: { user_id: user.id, status: 'open' } })

        if (Number(count) > 9) {
            return errorResponse(res, 400, 'شما نمی توانید همزمان بیش از ده تیکت باز داشته باشید')
        }

        const ticket = await Ticket.create({
            user_id: user.id,
            title,
            subject,
        })

        await TicketMessage.create({
            ticket_id: ticket.id,
            sender_id: user.id,
            message
        })

        return successResponse(res, 201, "تیکت شما با موفقیت ثبت گردید و پس از بررسی، به آن پاسخ داده خواهد شد.")
    } catch (error) {
        next(error)
    }
}

const getTickets = async (req, res, next) => {
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { items, count, error } = await findTicketsByQuery(req);

        if (error) {
            return next(error)
        }

        return successResponse(res, 200, '', { tickets: items, count })
    } catch (error) {
        next(error)
    }
}

const sendMessage = async (req, res, next) => {
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { message } = req.body;
        const { id } = req.params;
        const { user } = req;

        const ticket = await Ticket.findOne({ where: { id, user_id: user.id } })

        if (!ticket) {
            return errorResponse(res, 400, 'ثبت پیغام، با خطا مواجه شد. لطفا بعدا تلاش کنید.')
        }

        await TicketMessage.create({
            ticket_id: ticket.id,
            sender_id: user.id,
            message,
        })

        ticket.status = 'pending'
        await ticket.save()

        return successResponse(res, 201, "تیکت شما با موفقیت ثبت گردید و پس از بررسی، به آن پاسخ داده خواهد شد.")
    } catch (error) {
        next(error)
    }
}

const answerToTicket = async (req, res, next) => {
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { message } = req.body;
        const { id } = req.params;
        const { user } = req;

        const ticket = await Ticket.findOne({ where: { id } })

        if (!ticket) {
            return errorResponse(res, 400, 'ثبت پیغام، با خطا مواجه شد. لطفا بعدا تلاش کنید.')
        }

        await TicketMessage.create({
            ticket_id: ticket.id,
            sender_id: user.id,
            message,
        })

        ticket.status = 'answered'
        await ticket.save()

        const updatedTicket = await Ticket.findOne(
            {
                where: { id },
                include: [
                    {
                        model: TicketMessage, as: 'messages', include: [
                            { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] }
                        ]
                    },
                ],
            }
        );

        return successResponse(res, 201, "پاسخ شما برای کابر، ثبت شد.", { ticket: updatedTicket })
    } catch (error) {
        next(error)
    }
}

const deleteTicket = async (req, res, next) => {
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { id } = req.params;

        const ticket = await Ticket.findOne({ where: { id } })

        if (!ticket) {
            return errorResponse(res, 400, 'تیکت مورد نظر یافت نشد!')
        }

        await ticket.destroy();

        const { items, count, error } = await findTicketsByQuery(req);

        if (error) {
            return next(error)
        }

        return successResponse(res, 200, 'تیکت با موفقیت حذف شد.', { tickets: items, count })
    } catch (error) {
        next(error)
    }
}

const getTicketDetails = async (req, res, next) => {
    try {

        const { id } = req.params;

        const ticket = await Ticket.findOne(
            {
                where: { id },
                include: [
                    {
                        model: TicketMessage, as: 'messages', include: [
                            { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] }
                        ]
                    },
                ],
            }
        );

        if (!ticket) {
            return errorResponse(res,404,'تیکت مورد نظر یافت نشد!')
        }

        return successResponse(res, 200, '', { ticket })
    } catch (error) {
        next(error)
    }
}

const deleteMessage = async (req, res, next) => {
    try {
        const { ticketId, messageId } = req.params;

        const message = await TicketMessage.findOne({ where: { id: messageId, ticket_id: ticketId } })

        if (!message) {
            return errorResponse(res, 400, 'اطلاعات تیکت مورد نظر یافت نشد!')
        }

        await message.destroy();

        const count = await TicketMessage.count({ where: { ticket_id: ticketId } })

        console.log('count============>', count)

        if (Number(count) > 0) {
            const ticket = await Ticket.findOne(
                {
                    where: { id: ticketId },
                    include: [
                        {
                            model: TicketMessage, as: 'messages', include: [
                                { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] }
                            ]
                        },
                    ],
                }
            );
            return successResponse(res, 200, 'پیام با موفقیت حذف شد.', { ticket, isTicketDeleted: false })
        }

        await Ticket.destroy({ where: { id: ticketId } })

        return successResponse(res, 200, 'پیام با موفقیت حذف شد.', { ticket: {}, isTicketDeleted: true })

    } catch (error) {
        next(error)
    }
}

const changeStatusOfTicket = async (req, res, next) => {
    try {
        const { id } = req.params;

        const ticket = await Ticket.findOne(
            {
                where: { id },
                include: [
                    {
                        model: TicketMessage, as: 'messages', include: [
                            { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] }
                        ]
                    },
                ],
            }
        );

        if (!ticket) {
            return errorResponse(res,400,'تیکت مورد نظر یافت نشد!')
        }

        if (ticket.status === 'answered') {
            ticket.status = 'closed'
            await ticket.save()
            return successResponse(res, 200, 'تیکت با موفقیت بسته شد.', { ticket })
        } else if (ticket.status === 'closed') {
            ticket.status = 'answered'
            await ticket.save()
            return successResponse(res, 200, 'وضعیت تیکت به حالت "پاسخ داده شده" تغییر کرد.',{ ticket })
        }

        return errorResponse(res , 400,'برای بستن تیکت، ابتدا باید به آن پاسخ دهید.')

    } catch (error) {
        next(error)
    }
}

const getUsersideickets = async (req, res, next) => {
    try {
        const userId = req.user.id
        const tickets = await Ticket.findAll({where : {user_id:userId} , attributes:{exclude:['created_at','user_id']}})

        if (!tickets) {
            return errorResponse(res,404,'مشکل در جستجوی تیکت ها!')
        }

        return successResponse(res, 200, '', { tickets })
    } catch (error) {
        next(error)
    }
}

const getUsersideTicketDetails = async (req, res, next) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const ticket = await Ticket.findOne(
            {
                where: { 
                    id,
                    user_id:userId
                },
                include: [
                    {
                        model: TicketMessage, as: 'messages', include: [
                            { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] }
                        ]
                    },
                ],
            }
        );

        if (!ticket) {
            return errorResponse(res,404,'تیکت مورد نظر یافت نشد!')
        }

        return successResponse(res, 200, '', { ticket })
    } catch (error) {
        next(error)
    }
}

const usersideCloseTicket = async (req, res, next) => {
    try {
        const { id } = req.params;

        const ticket = await Ticket.findOne(
            {
                where: { id },
                include: [
                    {
                        model: TicketMessage, as: 'messages', include: [
                            { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] }
                        ]
                    },
                ],
            }
        );

        ticket.status = 'closed'
        await ticket.save()
        return successResponse(res, 200, 'تیکت با موفقیت بسته شد.', { ticket })

    } catch (error) {
        next(error)
    }
}

const usersideAnswerTicket = async (req, res, next) => {
    try {
        const validationError = validationResult(req)

        if (validationError?.errors && validationError?.errors[0]) {
            return errorResponse(res, 400, validationError.errors[0].msg)
        }

        const { message } = req.body;
        const { id } = req.params;
        const  userId  = req.user.id;

        const ticket = await Ticket.findOne({ where: { id } })

        if (!ticket) {
            return errorResponse(res, 400, 'ثبت پیغام، با خطا مواجه شد. لطفا بعدا تلاش کنید.')
        }

        await TicketMessage.create({
            ticket_id: ticket.id,
            sender_id: userId,
            message,
        })

        ticket.status = 'pending'
        await ticket.save()

        const updatedTicket = await Ticket.findOne(
            {
                where: { id },
                include: [
                    {
                        model: TicketMessage, as: 'messages', include: [
                            { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] }
                        ]
                    },
                ],
            }
        );

        return successResponse(res, 201, "تیکت شما با موفقیت ارسال شد و پس از بررسی، به آن پاسخ داده خواهد شد.", { ticket: updatedTicket })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createTicket,
    getTickets,
    sendMessage,
    answerToTicket,
    deleteTicket,
    getTicketDetails,
    deleteMessage,
    changeStatusOfTicket,
    getUsersideickets,
    getUsersideTicketDetails,
    usersideCloseTicket,
    usersideAnswerTicket
}