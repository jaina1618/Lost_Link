const mongoose = require('mongoose');

const recoveryRequestSchema = new mongoose.Schema(
  {
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    lostItem: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem', required: true },
    foundItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
    claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    respondent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimMessage: { type: String, required: true },
    privateFieldAnswer: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Disputed', 'Resolved'],
      default: 'Pending',
    },
    respondentNote: { type: String },
    adminNote: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

recoveryRequestSchema.index({ claimant: 1 });
recoveryRequestSchema.index({ respondent: 1 });
recoveryRequestSchema.index({ lostItem: 1, foundItem: 1 });
recoveryRequestSchema.index({ status: 1 });

module.exports = mongoose.model('RecoveryRequest', recoveryRequestSchema);
