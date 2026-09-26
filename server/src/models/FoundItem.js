const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics', 'Clothing', 'Accessories', 'Documents',
  'Keys', 'Bags', 'Jewelry', 'Books', 'Sports', 'Pets', 'Other'
];

const locationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  coordinates: { lat: Number, lng: Number },
}, { _id: false });

const foundItemSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemName: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    subcategory: { type: String, trim: true },
    description: { type: String, required: true },
    brand: { type: String, trim: true },
    color: { type: String, trim: true },
    distinguishingFeatures: { type: String },
    image: { type: String, default: '' },
    dateFound: { type: Date, required: true },
    location: { type: locationSchema, required: true },
    status: {
      type: String,
      enum: ['Available', 'Potential Match', 'Ownership Requested', 'Returned', 'Closed'],
      default: 'Available',
    },
    isActive: { type: Boolean, default: true },
    matchCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

foundItemSchema.index({ reportedBy: 1, status: 1 });
foundItemSchema.index({ category: 1, 'location.city': 1 });
foundItemSchema.index({ itemName: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('FoundItem', foundItemSchema);
