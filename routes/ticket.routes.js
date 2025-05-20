const {Router} = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/ticket.controller");
const configs = require("../configs");
const { createTicketValidator, getTicketsValidator,sendMessageValidator } = require("../validators/ticket.validator");

const router = Router();


router.post('/' ,authMiddleware,createTicketValidator(),controller.createTicket);
router.get('/' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),getTicketsValidator() , controller.getTickets);
router.post('/user-side/close/:id' ,authMiddleware ,controller.usersideCloseTicket);
router.post('/user-side/answer/:id' ,authMiddleware,sendMessageValidator() ,controller.usersideAnswerTicket);
router.post('/:id' ,authMiddleware ,sendMessageValidator(),controller.sendMessage);
router.post('/:id/answer' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),sendMessageValidator() , controller.answerToTicket);
router.delete('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),getTicketsValidator() , controller.deleteTicket);
router.delete('/:ticketId/message/:messageId' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]) , controller.deleteMessage);
router.get('/user-side' ,authMiddleware ,controller.getUsersideickets);
router.get('/user-side/:id' ,authMiddleware,controller.getUsersideTicketDetails);
router.get('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),controller.getTicketDetails);
router.put('/:id' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),controller.changeStatusOfTicket);

module.exports = router;