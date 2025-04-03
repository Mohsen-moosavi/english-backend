const { Role } = require("../../db");
const { successResponse } = require("../../utils/responses");

const getRoles = async (req, res, next) => {
    try {
      const roles = await Role.findAll();
  
      return successResponse(res, 200, '', { roles })
    } catch (error) {
      next(error)
    }
  }

  module.exports = {
    getRoles
  }