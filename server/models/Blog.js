const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  featuredImage: { type: String },
  category: { type: String },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  views: { type: Number, default: 0 }
}, { timestamps: true });

blogSchema.index({ slug: 1, status: 1, category: 1 });

module.exports = mongoose.model('Blog', blogSchema);
