const sendSuccess = (res, statusCode = 200, message = 'Operation completed', data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 400, code = 'ERROR', message = 'An error occurred', fields = {}) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(Object.keys(fields).length > 0 ? { fields } : {})
    }
  });
};

module.exports = {
  sendSuccess,
  sendError
};
