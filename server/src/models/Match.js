const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    lostItem: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem', required: true },
    foundItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
    lostItemOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foundItemReporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    scoreBreakdown: {
      category: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      date: { type: Number, default: 0 },
      color: { type: Number, default: 0 },
      brand: { type: Number, default: 0 },
      description: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Dismissed', 'Resolved'],
      default: 'Pending',
    },
    notifiedLostOwner: { type: Boolean, default: false },
    notifiedFoundReporter: { type: Boolean, default: false },
  },
  { timestamps: true }
);

matchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });
matchSchema.index({ lostItemOwner: 1 });
matchSchema.index({ foundItemReporter: 1 });
matchSchema.index({ matchScore: -1 });

module.exports = mongoose.model('Match', matchSchema);
