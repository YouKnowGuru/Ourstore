const express = require('express');
const router = express.Router();
const { productController } = require('../controllers');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProduct);

// Protected routes (admin only)
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 5), productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

// Reviews
router.post('/reviews', authMiddleware, productController.createReview);

module.exports = router;
