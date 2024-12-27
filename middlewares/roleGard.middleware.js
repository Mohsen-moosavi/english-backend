const configs = require("../configs");

function roleGardMiddleware(roles) {
  return async (req, res, next) => {
    try {
      if (req.user['role.name'] === configs.roles.manager) {
        return next()
      }
      if (roles.includes(req.user['role.name'])) {
        return next()
      }
      return errorResponse(res, 401, "شما به این بخش دسترسی ندارید!");
    } catch (err) {
      next(err);
    }
  }
}



module.exports = {
  roleGardMiddleware
};