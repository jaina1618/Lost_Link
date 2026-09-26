const Message = require('../models/Message');
const RecoveryRequest = require('../models/RecoveryRequest');
const ApiError = require('../utils/ApiError');
const { triggerNotification } = require('../services/notificationService');

// GET /api/messages/request/:requestId
const getMessages = async (req, res, next) => {
  try {
    const request = await RecoveryRequest.findById(req.params.requestId);
    if (!request) return next(new ApiError('Request not found.', 404));
    const uid = req.user._id.toString();
    if (request.claimant.toString() !== uid && request.respondent.toString() !== uid)
      return next(new ApiError('Not authorized.', 403));
    if (request.status !== 'Accepted' && req.user.role !== 'admin')
      return next(new ApiError('Messaging is only available after the request is accepted.', 403));
    const messages = await Message.find({ recoveryRequest: req.params.requestId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });
    // Mark messages to current user as read
    await Message.updateMany(
      { recoveryRequest: req.params.requestId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
};

// POST /api/messages/request/:requestId
const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return next(new ApiError('Message content required.', 400));
    const request = await RecoveryRequest.findById(req.params.requestId);
    if (!request) return next(new ApiError('Request not found.', 404));
    if (request.status !== 'Accepted')
      return next(new ApiError('Messaging only available for accepted requests.', 403));
    const uid = req.user._id.toString();
    if (request.claimant.toString() !== uid && request.respondent.toString() !== uid)
      return next(new ApiError('Not authorized.', 403));
    const receiverId = request.claimant.toString() === uid ? request.respondent : request.claimant;
    const message = await Message.create({
      recoveryRequest: req.params.requestId,
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
    });
    await triggerNotification(receiverId, 'NEW_MESSAGE', 'New Message', `You have a new message regarding your recovery case.`, `/dashboard/messages/${req.params.requestId}`);
    const populated = await message.populate('sender', 'name avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

// GET /api/messages - get all conversations
const getConversations = async (req, res, next) => {
  try {
    const requests = await RecoveryRequest.find({
      $or: [{ claimant: req.user._id }, { respondent: req.user._id }],
      status: 'Accepted',
    })
      .populate('lostItem', 'itemName image')
      .populate('foundItem', 'itemName image')
      .populate('claimant', 'name avatar')
      .populate('respondent', 'name avatar')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
};

module.exports = { getMessages, sendMessage, getConversations };
