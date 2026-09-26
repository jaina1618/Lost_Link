const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['LostItem', 'FoundItem', 'User'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: ['Spam', 'Fraud', 'Inappropriate', 'Fake', 'Harassment', 'Other'],
      required: true,
    },
    details: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Dismissed', 'Actioned'],
      default: 'Pending',
    },
    adminNote: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

reportSchema.index({ reportedBy: 1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);
