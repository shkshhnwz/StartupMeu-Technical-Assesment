const authRoutes = require('./auth.routes');
const User = require('./User.model');
const { protect, authorizeRoles, optionalAuth } = require('./auth.middleware');

module.exports = {
  authRoutes,
  User,
  protect,
  authorizeRoles,
  optionalAuth
};
