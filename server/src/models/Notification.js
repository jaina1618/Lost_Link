const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'MATCH_FOUND',
        'RECOVERY_REQUEST_RECEIVED',
        'RECOVERY_REQUEST_ACCEPTED',
        'RECOVERY_REQUEST_REJECTED',
        'NEW_MESSAGE',
        'ITEM_RECOVERED',
        'ADMIN_ACTION',
        'REPORT_REVIEWED',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
