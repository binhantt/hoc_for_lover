const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);

// Protected routes
router.get('/me', auth, authController.getMe);
router.post('/logout', auth, authController.logout);
router.put('/last-active', auth, authController.updateLastActive);

module.exports = router;
