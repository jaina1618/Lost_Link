const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const RecoveryRequest = require('../models/RecoveryRequest');
const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');

const getStats = async (req, res, next) => {
  try {
    const [users, lostItems, foundItems, matches, requests, recovered, pendingReports] = await Promise.all([
      User.countDocuments(),
      LostItem.countDocuments({ isActive: true }),
      FoundItem.countDocuments({ isActive: true }),
      Match.countDocuments(),
      RecoveryRequest.countDocuments(),
      RecoveryRequest.countDocuments({ status: { $in: ['Accepted', 'Resolved'] } }),
      Report.countDocuments({ status: 'Pending' }),
    ]);
    res.json({ success: true, data: { users, lostItems, foundItems, matches, requests, recovered, pendingReports } });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.keyword) filter.name = { $regex: req.query.keyword, $options: 'i' };
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError('User not found.', 404));
    user.isBanned = !user.isBanned;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: `User ${user.isBanned ? 'banned' : 'unbanned'}.`, data: user });
  } catch (err) { next(err); }
};

const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return next(new ApiError('User not found.', 404));
    res.json({ success: true, message: 'Role updated.', data: user });
  } catch (err) { next(err); }
};

const getAllLostItems = async (req, res, next) => {
  try {
    const items = await LostItem.find().populate('reportedBy', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

const getAllFoundItems = async (req, res, next) => {
  try {
    const items = await FoundItem.find().populate('reportedBy', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

const deleteItem = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'lost' ? LostItem : FoundItem;
    await Model.findByIdAndUpdate(id, { isActive: false });
    res.json({ success: true, message: 'Item removed.' });
  } catch (err) { next(err); }
};

const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find().populate('reportedBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
};

const reviewReport = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!report) return next(new ApiError('Report not found.', 404));
    res.json({ success: true, message: 'Report reviewed.', data: report });
  } catch (err) { next(err); }
};

const getAllRequests = async (req, res, next) => {
  try {
    const requests = await RecoveryRequest.find()
      .populate('lostItem', 'itemName')
      .populate('foundItem', 'itemName')
      .populate('claimant', 'name email')
      .populate('respondent', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
};

module.exports = { getStats, getAllUsers, suspendUser, changeUserRole, getAllLostItems, getAllFoundItems, deleteItem, getAllReports, reviewReport, getAllRequests };
