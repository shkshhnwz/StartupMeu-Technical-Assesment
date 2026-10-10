const mongoose = require('mongoose');
const { sendError } = require('../../utils/apiResponse');

const validateSubmitInterest = (req, res, next) => {
  const { businessId, message } = req.body;
  const fields = {};

  if (!businessId || !mongoose.Types.ObjectId.isValid(businessId)) {
    fields.businessId = 'A valid business ID is required';
  }

  if (message !== undefined && message !== null) {
    if (typeof message !== 'string') {
      fields.message = 'Message must be a string';
    } else if (message.trim().length > 500) {
      fields.message = 'Message cannot exceed 500 characters';
    }
  }

  if (Object.keys(fields).length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Please check your inputs', fields);
  }

  req.body.businessId = businessId.toString();
  req.body.message = message ? message.trim() : '';

  next();
};

const validateUpdateStatus = (req, res, next) => {
  const { status } = req.body;
  const fields = {};

  const allowedStatuses = ['accepted', 'declined'];
  if (!status || !allowedStatuses.includes(status)) {
    fields.status = 'Status must be either "accepted" or "declined"';
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendError(res, 400, 'INVALID_ID', 'Invalid interest request identifier');
  }

  if (Object.keys(fields).length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid status update', fields);
  }

  next();
};

module.exports = {
  validateSubmitInterest,
  validateUpdateStatus
};
