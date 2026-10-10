const { sendError } = require('../../utils/apiResponse');

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const fields = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    fields.name = 'Name must be at least 2 characters long';
  } else if (name.trim().length > 100) {
    fields.name = 'Name cannot exceed 100 characters';
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    fields.email = 'Please provide a valid email address';
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    fields.password = 'Password must be at least 8 characters long';
  }

  const allowedRoles = ['founder', 'investor'];
  if (!role || !allowedRoles.includes(role)) {
    fields.role = 'Role must be either "founder" or "investor"';
  }

  if (Object.keys(fields).length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Please check your inputs', fields);
  }

  // Normalize trimmed values
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const fields = {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    fields.email = 'Email is required';
  }

  if (!password || typeof password !== 'string' || !password) {
    fields.password = 'Password is required';
  }

  if (Object.keys(fields).length > 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Please check your inputs', fields);
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

module.exports = {
  validateRegister,
  validateLogin
};
