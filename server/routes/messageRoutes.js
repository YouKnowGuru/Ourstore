const express = require('express');
const router = express.Router();
const { messageController } = require('../controllers');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

router.post('/', messageController.createMessage);

// Protected routes (admin only)
router.get('/', authMiddleware, adminMiddleware, messageController.getMessages);
router.get('/:id', authMiddleware, adminMiddleware, messageController.getMessage);
router.post('/:id/reply', authMiddleware, adminMiddleware, messageController.replyToMessage);
router.delete('/:id', authMiddleware, adminMiddleware, messageController.deleteMessage);

module.exports = router;
