const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshToken, logoutUser, getProfile, updateProfile, verifyEmail, changePassword, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidation, loginValidation } = require('../middleware/validateRequest');

// Public routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/refresh', refreshToken);
router.post('/google', googleLogin);
router.get('/verify/:token', verifyEmail);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logoutUser);

module.exports = router;