const express = require('express');
const router = express.Router();
const { galleryController } = require('../controllers');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', galleryController.getGallery);

// Protected routes (admin only)
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 10), galleryController.createGallery);
router.post('/:id/images', authMiddleware, adminMiddleware, upload.array('images', 10), galleryController.addImages);
router.put('/:id/images/:imageId', authMiddleware, adminMiddleware, galleryController.updateImageCaption);
router.delete('/:id/images/:imageId', authMiddleware, adminMiddleware, galleryController.deleteImage);
router.delete('/:id', authMiddleware, adminMiddleware, galleryController.deleteGallery);

module.exports = router;
