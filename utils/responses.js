//* Helper function to format success response
function successResponse (res, statusCode = 200, message, data) {
  return res
    .status(statusCode)
    .json({success: true, status: statusCode, message , data });
};

//* Helper function to format error response

function errorResponse (res, statusCode, message, data) {
  console.log({ message, data }); // Log error details ...

  return res
    .status(statusCode)
    .json({success: false , status: statusCode, message, data });
};

module.exports = {
  successResponse,
  errorResponse,
};
