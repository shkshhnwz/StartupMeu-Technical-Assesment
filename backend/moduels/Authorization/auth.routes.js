const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  testFounderAccess,
  testInvestorAccess
} = require('./auth.controller');

const { validateRegister, validateLogin } = require('./auth.validator');
const { protect, authorizeRoles } = require('./auth.middleware');

// Public auth endpoints
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Authenticated session endpoints
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// Role-protected verification endpoints
router.get('/test/founder', protect, authorizeRoles('founder'), testFounderAccess);
router.get('/test/investor', protect, authorizeRoles('investor'), testInvestorAccess);

module.exports = router;
