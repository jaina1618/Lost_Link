const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics', 'Clothing', 'Accessories', 'Documents',
  'Keys', 'Bags', 'Jewelry', 'Books', 'Sports', 'Pets', 'Other'
];

const locationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, { _id: false });

const lostItemSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemName: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    subcategory: { type: String, trim: true },
    description: { type: String, required: true },
    brand: { type: String, trim: true },
    color: { type: String, trim: true },
    distinguishingFeatures: { type: String },
    privateDetails: { type: String, select: false },
    image: { type: String, default: '' },
    dateLost: { type: Date, required: true },
    location: { type: locationSchema, required: true },
    status: {
      type: String,
      enum: ['Active', 'Potential Match', 'Recovery Requested', 'Recovered', 'Closed'],
      default: 'Active',
    },
    isActive: { type: Boolean, default: true },
    matchCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

lostItemSchema.index({ reportedBy: 1, status: 1 });
lostItemSchema.index({ category: 1, 'location.city': 1 });
lostItemSchema.index({ itemName: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('LostItem', lostItemSchema);
