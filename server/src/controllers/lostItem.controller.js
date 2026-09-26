const LostItem = require('../models/LostItem');
const ApiError = require('../utils/ApiError');
const { runMatchForLostItem } = require('../services/matchingService');
const path = require('path');

const buildQuery = (query) => {
  const filter = { isActive: true };
  if (query.keyword) filter.$text = { $search: query.keyword };
  if (query.category) filter.category = query.category;
  if (query.city) filter['location.city'] = { $regex: query.city, $options: 'i' };
  if (query.color) filter.color = { $regex: query.color, $options: 'i' };
  if (query.brand) filter.brand = { $regex: query.brand, $options: 'i' };
  if (query.status) filter.status = query.status;
  if (query.dateFrom || query.dateTo) {
    filter.dateLost = {};
    if (query.dateFrom) filter.dateLost.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.dateLost.$lte = new Date(query.dateTo);
  }
  return filter;
};

// GET /api/lost
const getLostItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const filter = buildQuery(req.query);
    const sort = req.query.sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const [items, total] = await Promise.all([
      LostItem.find(filter).populate('reportedBy', 'name avatar').sort(sort).skip(skip).limit(limit),
      LostItem.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// POST /api/lost
const createLostItem = async (req, res, next) => {
  try {
    const { itemName, category, subcategory, description, brand, color,
            distinguishingFeatures, privateDetails, dateLost } = req.body;
    const location = {
      address: req.body['location[address]'] || req.body.locationAddress,
      city: req.body['location[city]'] || req.body.locationCity,
      state: req.body['location[state]'] || req.body.locationState,
    };
    if (!location.address) {
      // Try JSON parse fallback
      try { Object.assign(location, JSON.parse(req.body.location)); } catch {}
    }
    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    const item = await LostItem.create({
      reportedBy: req.user._id,
      itemName, category, subcategory, description, brand, color,
      distinguishingFeatures, privateDetails,
      dateLost: new Date(dateLost),
      location, image,
    });
    // Run matching engine async
    runMatchForLostItem(item.toObject());
    res.status(201).json({ success: true, message: 'Lost item report created.', data: item });
  } catch (err) { next(err); }
};

// GET /api/lost/:id
const getLostItemById = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id).populate('reportedBy', 'name avatar phone');
    if (!item || !item.isActive) return next(new ApiError('Item not found.', 404));
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

// PUT /api/lost/:id
const updateLostItem = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return next(new ApiError('Item not found.', 404));
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return next(new ApiError('Not authorized.', 403));
    const updates = { ...req.body };
    if (req.file) updates.image = `/uploads/${req.file.filename}`;
    const updated = await LostItem.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Item updated.', data: updated });
  } catch (err) { next(err); }
};

// DELETE /api/lost/:id
const deleteLostItem = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return next(new ApiError('Item not found.', 404));
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return next(new ApiError('Not authorized.', 403));
    item.isActive = false;
    await item.save();
    res.json({ success: true, message: 'Item report deleted.' });
  } catch (err) { next(err); }
};

// PATCH /api/lost/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const item = await LostItem.findById(req.params.id);
    if (!item) return next(new ApiError('Item not found.', 404));
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return next(new ApiError('Not authorized.', 403));
    item.status = status;
    await item.save();
    res.json({ success: true, message: 'Status updated.', data: item });
  } catch (err) { next(err); }
};

// GET /api/lost/my
const getMyLostItems = async (req, res, next) => {
  try {
    const items = await LostItem.find({ reportedBy: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

module.exports = { getLostItems, createLostItem, getLostItemById, updateLostItem, deleteLostItem, updateStatus, getMyLostItems };
