const jwt = require('jsonwebtoken');
const User = require('./User.model');
const { sendError } = require('../../utils/apiResponse');

/**
 * Protect middleware: Ensures the user is authenticated via JWT in HTTP-only cookie or Authorization header.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check HTTP-only cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Also support Bearer token in Authorization header for API testing
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required. Please log in.');
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve active user
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'The account associated with this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'TOKEN_EXPIRED', 'Your session has expired. Please log in again.');
    }
    return sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired authentication token.');
  }
};

/**
 * Role-based authorization middleware factory.
 * Enforces role check (e.g. authorizeRoles('founder'), authorizeRoles('investor'))
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        'FORBIDDEN',
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

/**
 * Optional Auth middleware: Populates req.user if token is present and valid, but doesn't block unauthenticated requests
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch (_) {
    // Silently continue for public requests
  }
  next();
};

module.exports = {
  protect,
  authorizeRoles,
  optionalAuth
};
