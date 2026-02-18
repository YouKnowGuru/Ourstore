const express = require('express');
const router = express.Router();
const { blogController } = require('../controllers');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', blogController.getBlogs);
router.get('/:slug', blogController.getBlog);

// Protected routes (admin only)
router.post('/', authMiddleware, adminMiddleware, upload.single('featuredImage'), blogController.createBlog);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('featuredImage'), blogController.updateBlog);
router.delete('/:id', authMiddleware, adminMiddleware, blogController.deleteBlog);

module.exports = router;
