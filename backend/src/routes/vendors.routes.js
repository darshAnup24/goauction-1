const express = require('express');
const router = express.Router();
const vendorsController = require('../controllers/vendors.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All vendor routes require authentication
router.use(authMiddleware);

router.post('/connect', vendorsController.createConnectAccount);
router.get('/status', vendorsController.getAccountStatus);
router.post('/onboarding-link', vendorsController.createOnboardingLink);
router.post('/dashboard-link', vendorsController.createDashboardLink);
router.get('/earnings', vendorsController.getEarnings);
router.post('/apply', vendorsController.applyVendor);

module.exports = router;
