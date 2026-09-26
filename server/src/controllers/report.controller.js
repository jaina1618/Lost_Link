const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');

const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    const report = await Report.create({ reportedBy: req.user._id, targetType, targetId, reason, details });
    res.status(201).json({ success: true, message: 'Report submitted. Admin will review.', data: report });
  } catch (err) { next(err); }
};

const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
};

module.exports = { createReport, getMyReports };
