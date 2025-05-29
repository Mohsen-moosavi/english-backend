const {Router} = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { roleGardMiddleware } = require("../middlewares/roleGard.middleware");
const controller = require("../controllers/v1/sale.controller");
const configs = require("../configs");
const { getSalesValidator, createSaleByAdminValidator, createSaleByUserValidator } = require("../validators/sale.validator");

const router = Router();


router.post('/' ,authMiddleware,roleGardMiddleware([configs.roles.writter,configs.roles.admin]),createSaleByAdminValidator(),controller.createSaleByAdmin);
router.post('/get-all' ,authMiddleware , roleGardMiddleware([configs.roles.writter,configs.roles.admin]),getSalesValidator() , controller.getSales);
router.post('/delete/:id' ,authMiddleware , roleGardMiddleware([configs.roles.admin , configs.roles.writter]),getSalesValidator(),controller.deleteSale);
router.post('/user-side' ,authMiddleware,createSaleByUserValidator(),controller.createSale);

module.exports = router;