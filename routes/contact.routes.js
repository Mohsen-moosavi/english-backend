const {Router} = require("express");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/contact.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const configs = require("../configs");
const { createContactValidator, getContactValidator, changeStatusOfContactValidator, answerToContactValidator, deleteContactValidator } = require("../validators/contact.validator");

const router = Router();

router.post('/' ,authMiddleware, createContactValidator() ,controller.createContact);
router.get('/' ,authMiddleware,roleGardMiddleware([]), getContactValidator() ,controller.getContacts);
router.put('/:id' ,authMiddleware,roleGardMiddleware([]), [...getContactValidator(),...changeStatusOfContactValidator()] ,controller.changeStatusOfContact);
router.post('/answer/:id' ,authMiddleware,roleGardMiddleware([]), [...getContactValidator(),...answerToContactValidator()] ,controller.answerToContact);
router.delete('/:id' ,authMiddleware,roleGardMiddleware([]), [...getContactValidator(),...deleteContactValidator()] ,controller.deleteContact);


module.exports = router;