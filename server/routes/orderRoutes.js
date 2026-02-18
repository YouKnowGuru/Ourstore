const express = require('express');
const router = express.Router();
const { orderController } = require('../controllers');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

router.post('/', optionalAuth, orderController.createOrder);
router.get('/', authMiddleware, orderController.getOrders);
router.get('/stats', authMiddleware, adminMiddleware, orderController.getOrderStats);
router.get('/:id', authMiddleware, orderController.getOrder);
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);
router.put('/:id/payment', authMiddleware, adminMiddleware, orderController.updatePaymentStatus);
router.post('/:id/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;
