const mongoose = require('mongoose');

const customizationOptionsSchema = new mongoose.Schema({
  allowTextInput: { type: Boolean, default: false },
  allowImageUpload: { type: Boolean, default: false },
  textFields: [{ type: String }],
  imageFields: [{ type: String }],
  availableSizes: [{ type: String }],
  availableColors: [{ type: String }]
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  category: { type: String, required: true, index: true },
  subcategory: { type: String },
  images: [{ type: String }],
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, unique: true, sparse: true },
  isCustomizable: { type: Boolean, default: false },
  customizationOptions: customizationOptionsSchema,
  isFeatured: { type: Boolean, default: false },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  tags: [{ type: String, index: true }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  salesCount: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
