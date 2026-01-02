const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All notification routes require authentication
router.use(authMiddleware);

router.get('/', notificationsController.getNotifications);
router.get('/unread-count', notificationsController.getUnreadCount);
router.put('/:id/read', notificationsController.markAsRead);
router.put('/read-all', notificationsController.markAllAsRead);
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
