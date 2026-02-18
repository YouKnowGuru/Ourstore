const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
  text: { type: Map, of: String },
  images: [{ type: String }],
  size: { type: String },
  color: { type: String }
});

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  customization: customizationSchema,
  image: { type: String }
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  dzongkhag: { type: String, required: true },
  postalCode: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderNumber: { type: String, unique: true, required: true },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  guestInfo: {
    fullName: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  isGuest: { type: Boolean, default: false },
  paymentMethod: { type: String, enum: ['COD', 'Online'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  orderStatus: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  notes: { type: String },
  trackingNumber: { type: String }
}, { timestamps: true });

orderSchema.index({ orderNumber: 1, userId: 1, orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
