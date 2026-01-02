const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cron.controller');

// Cron routes (should be secured with API key in production)
router.post('/expire-auctions', cronController.expireAuctions);
router.post('/reminders', cronController.sendAuctionReminders);
router.post('/cleanup', cronController.cleanupNotifications);

module.exports = router;
