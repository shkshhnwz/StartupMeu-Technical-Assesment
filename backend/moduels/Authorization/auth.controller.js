const jwt = require('jsonwebtoken');
const User = require('./User.model');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

/**
 * Generate signed JWT for authenticated user
 */
const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Helper to set secure HTTP-only cookie and send JSON response
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = signToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  return sendSuccess(res, statusCode, message, {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    },
    token
  });
};

/**
 * @desc    Register a new user (founder or investor)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check for existing user with identical email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(
        res,
        409,
        'CONFLICT',
        'An account with this email address already exists.',
        { email: 'Email is already registered' }
      );
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user with explicit allowed fields only (prevents arbitrary role injection)
    const user = await User.create({
      name,
      email,
      passwordHash,
      role
    });

    return sendTokenResponse(user, 201, res, 'Account created successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Query user and explicitly select passwordHash
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      // Generic error to avoid email enumeration
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    return sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out current user and clear cookie
 * @route   POST /api/auth/logout
 * @access  Authenticated
 */
const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  return sendSuccess(res, 200, 'Logged out successfully.');
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Authenticated
 */
const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Current user retrieved.', {
    user: req.user
  });
};

/**
 * @desc    Sample role-protected endpoint for testing Founder access
 * @route   GET /api/auth/test/founder
 * @access  Founder only
 */
const testFounderAccess = async (req, res) => {
  return sendSuccess(res, 200, 'Access granted to Founder role.', {
    user: req.user
  });
};

/**
 * @desc    Sample role-protected endpoint for testing Investor access
 * @route   GET /api/auth/test/investor
 * @access  Investor only
 */
const testInvestorAccess = async (req, res) => {
  return sendSuccess(res, 200, 'Access granted to Investor role.', {
    user: req.user
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  testFounderAccess,
  testInvestorAccess
};
