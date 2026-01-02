const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/:id', usersController.getProfile);

// Protected routes
router.use(authMiddleware);

router.put('/profile', usersController.updateProfile);
router.put('/avatar', upload.single('avatar'), usersController.updateAvatar);
router.put('/password', usersController.changePassword);
router.delete('/account', usersController.deleteAccount);
router.get('/me/stats', usersController.getStats);

module.exports = router;
