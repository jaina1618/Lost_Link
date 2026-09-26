const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError('Not authenticated. Please login.', 401));
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new ApiError('User not found.', 401));
    if (user.isBanned) return next(new ApiError('Your account has been banned.', 403));
    req.user = user;
    next();
  } catch (err) {
    next(new ApiError('Invalid or expired token.', 401));
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return next(new ApiError('Admin access required.', 403));
};

module.exports = { authMiddleware, adminMiddleware };
