const Match = require('../models/Match');
const ApiError = require('../utils/ApiError');

// GET /api/matches - user's matches
const getMyMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({
      $or: [{ lostItemOwner: req.user._id }, { foundItemReporter: req.user._id }],
      status: { $ne: 'Dismissed' },
    })
      .populate('lostItem', 'itemName category color brand image status dateLost location')
      .populate('foundItem', 'itemName category color brand image status dateFound location')
      .populate('lostItemOwner', 'name avatar')
      .populate('foundItemReporter', 'name avatar')
      .sort({ matchScore: -1, createdAt: -1 });
    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
};

// GET /api/matches/:id
const getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('lostItem')
      .populate('foundItem')
      .populate('lostItemOwner', 'name avatar phone')
      .populate('foundItemReporter', 'name avatar phone');
    if (!match) return next(new ApiError('Match not found.', 404));
    const uid = req.user._id.toString();
    if (match.lostItemOwner._id.toString() !== uid && match.foundItemReporter._id.toString() !== uid && req.user.role !== 'admin')
      return next(new ApiError('Not authorized.', 403));
    res.json({ success: true, data: match });
  } catch (err) { next(err); }
};

// PATCH /api/matches/:id/dismiss
const dismissMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return next(new ApiError('Match not found.', 404));
    match.status = 'Dismissed';
    await match.save();
    res.json({ success: true, message: 'Match dismissed.' });
  } catch (err) { next(err); }
};

module.exports = { getMyMatches, getMatchById, dismissMatch };
