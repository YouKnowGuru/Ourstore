const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { authMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.put('/profile', userController.updateProfile);
router.put('/profile-picture', upload.single('image'), userController.updateProfilePicture);
router.post('/addresses', userController.addAddress);
router.put('/addresses/:addressId', userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);
router.put('/change-password', userController.changePassword);
router.post('/wishlist', userController.addToWishlist);
router.delete('/wishlist/:productId', userController.removeFromWishlist);
router.get('/wishlist', userController.getWishlist);
router.post('/delete-account', userController.deleteAccount);

module.exports = router;
