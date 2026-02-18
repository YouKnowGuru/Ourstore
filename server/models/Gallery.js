const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String }
});

const gallerySchema = new mongoose.Schema({
  title: { type: String },
  images: [galleryImageSchema],
  album: { type: String, index: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
