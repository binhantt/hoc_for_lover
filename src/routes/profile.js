const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/:userId', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.put('/privacy', profileController.updatePrivacySettings);
router.post('/photo', profileController.addPhoto);
router.delete('/photo', profileController.removePhoto);
router.post('/block', profileController.blockUser);
router.post('/unblock', profileController.unblockUser);
router.get('/blocked/list', profileController.getBlockedUsers);

module.exports = router;
