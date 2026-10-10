const jwt = require('jsonwebtoken');
const User = require('./User.model');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = signToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

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

    const passwordHash = await User.hashPassword(password);

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

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
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

const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  return sendSuccess(res, 200, 'Logged out successfully.');
};

const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Current user retrieved.', {
    user: req.user
  });
};

const testFounderAccess = async (req, res) => {
  return sendSuccess(res, 200, 'Access granted to Founder role.', {
    user: req.user
  });
};

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
