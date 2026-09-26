const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return next(new ApiError('Name, email and password are required.', 400));
    const existing = await User.findOne({ email });
    if (existing) return next(new ApiError('Email already registered.', 409));
    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id, user.role);
    res.status(201).json({ success: true, message: 'Registration successful', data: { token, user } });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new ApiError('Email and password required.', 400));
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return next(new ApiError('Invalid email or password.', 401));
    if (user.isBanned) return next(new ApiError('Your account has been banned.', 403));
    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id, user.role);
    res.json({ success: true, message: 'Login successful', data: { token, user } });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (err) { next(err); }
};

// PUT /api/auth/me
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) { next(err); }
};

// PUT /api/auth/me/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword)))
      return next(new ApiError('Current password is incorrect.', 400));
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
