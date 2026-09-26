const RecoveryRequest = require('../models/RecoveryRequest');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const ApiError = require('../utils/ApiError');
const { triggerNotification } = require('../services/notificationService');

// GET /api/requests
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await RecoveryRequest.find({
      $or: [{ claimant: req.user._id }, { respondent: req.user._id }],
    })
      .populate('lostItem', 'itemName category image status')
      .populate('foundItem', 'itemName category image status')
      .populate('claimant', 'name avatar')
      .populate('respondent', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
};

// POST /api/requests
const createRequest = async (req, res, next) => {
  try {
    const { lostItemId, foundItemId, matchId, claimMessage, privateFieldAnswer } = req.body;
    const lostItem = await LostItem.findById(lostItemId);
    const foundItem = await FoundItem.findById(foundItemId);
    if (!lostItem || !foundItem) return next(new ApiError('Items not found.', 404));
    if (lostItem.reportedBy.toString() !== req.user._id.toString())
      return next(new ApiError('Only the lost item owner can send a recovery request.', 403));

    const existing = await RecoveryRequest.findOne({ lostItem: lostItemId, foundItem: foundItemId, claimant: req.user._id });
    if (existing) return next(new ApiError('Recovery request already sent.', 409));

    const request = await RecoveryRequest.create({
      match: matchId,
      lostItem: lostItemId,
      foundItem: foundItemId,
      claimant: req.user._id,
      respondent: foundItem.reportedBy,
      claimMessage,
      privateFieldAnswer,
    });

    await LostItem.findByIdAndUpdate(lostItemId, { status: 'Recovery Requested' });
    await FoundItem.findByIdAndUpdate(foundItemId, { status: 'Ownership Requested' });

    await triggerNotification(
      foundItem.reportedBy,
      'RECOVERY_REQUEST_RECEIVED',
      'Recovery Request Received',
      `Someone is claiming your found item "${foundItem.itemName}". Review their claim.`,
      `/dashboard/requests`
    );

    res.status(201).json({ success: true, message: 'Recovery request sent.', data: request });
  } catch (err) { next(err); }
};

// GET /api/requests/:id
const getRequestById = async (req, res, next) => {
  try {
    const request = await RecoveryRequest.findById(req.params.id)
      .populate('lostItem')
      .populate('foundItem')
      .populate('claimant', 'name avatar email phone')
      .populate('respondent', 'name avatar email phone');
    if (!request) return next(new ApiError('Request not found.', 404));

    const uid = req.user._id.toString();
    const isClaimant = request.claimant._id.toString() === uid;
    const isRespondent = request.respondent._id.toString() === uid;
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isRespondent && !isAdmin)
      return next(new ApiError('Not authorized.', 403));

    let responseData = request.toObject();

    // Only respondent and admin can see the private field challenge for comparison
    if (isRespondent || isAdmin) {
      const lostItemWithPrivate = await LostItem.findById(request.lostItem._id).select('+privateDetails');
      responseData.privateDetailsChallenge = lostItemWithPrivate?.privateDetails || null;
    }

    res.json({ success: true, data: responseData });
  } catch (err) { next(err); }
};

// PATCH /api/requests/:id/accept
const acceptRequest = async (req, res, next) => {
  try {
    const request = await RecoveryRequest.findById(req.params.id);
    if (!request) return next(new ApiError('Request not found.', 404));
    if (request.respondent.toString() !== req.user._id.toString())
      return next(new ApiError('Only the respondent can accept.', 403));

    request.status = 'Accepted';
    await request.save();

    await LostItem.findByIdAndUpdate(request.lostItem, { status: 'Recovered' });
    await FoundItem.findByIdAndUpdate(request.foundItem, { status: 'Returned' });

    await triggerNotification(
      request.claimant,
      'RECOVERY_REQUEST_ACCEPTED',
      'Your Recovery Request Was Accepted!',
      'Your ownership has been verified. Contact the finder to coordinate pickup.',
      `/dashboard/requests`
    );

    res.json({ success: true, message: 'Request accepted. Item marked as recovered.' });
  } catch (err) { next(err); }
};

// PATCH /api/requests/:id/reject
const rejectRequest = async (req, res, next) => {
  try {
    const { respondentNote } = req.body;
    const request = await RecoveryRequest.findById(req.params.id);
    if (!request) return next(new ApiError('Request not found.', 404));
    if (request.respondent.toString() !== req.user._id.toString())
      return next(new ApiError('Only the respondent can reject.', 403));

    request.status = 'Rejected';
    request.respondentNote = respondentNote;
    await request.save();

    await LostItem.findByIdAndUpdate(request.lostItem, { status: 'Active' });
    await FoundItem.findByIdAndUpdate(request.foundItem, { status: 'Available' });

    await triggerNotification(
      request.claimant,
      'RECOVERY_REQUEST_REJECTED',
      'Recovery Request Rejected',
      `Your claim was not verified. Reason: ${respondentNote || 'Not provided.'}`,
      `/dashboard/requests`
    );

    res.json({ success: true, message: 'Request rejected.' });
  } catch (err) { next(err); }
};

// PATCH /api/requests/:id/resolve
const resolveRequest = async (req, res, next) => {
  try {
    const request = await RecoveryRequest.findById(req.params.id);
    if (!request) return next(new ApiError('Request not found.', 404));
    const uid = req.user._id.toString();
    if (request.claimant.toString() !== uid && request.respondent.toString() !== uid && req.user.role !== 'admin')
      return next(new ApiError('Not authorized.', 403));
    request.status = 'Resolved';
    request.resolvedAt = new Date();
    await request.save();
    await LostItem.findByIdAndUpdate(request.lostItem, { status: 'Closed' });
    await FoundItem.findByIdAndUpdate(request.foundItem, { status: 'Closed' });
    res.json({ success: true, message: 'Case resolved and closed.' });
  } catch (err) { next(err); }
};

// POST /api/requests/:id/dispute
const disputeRequest = async (req, res, next) => {
  try {
    const request = await RecoveryRequest.findById(req.params.id);
    if (!request) return next(new ApiError('Request not found.', 404));
    request.status = 'Disputed';
    await request.save();
    res.json({ success: true, message: 'Dispute raised. Admin will review.' });
  } catch (err) { next(err); }
};

module.exports = { getMyRequests, createRequest, getRequestById, acceptRequest, rejectRequest, resolveRequest, disputeRequest };
