const express = require('express');
const router = express.Router();
const bidsController = require('../controllers/bids.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All bid routes require authentication
router.use(authMiddleware);

router.post('/place', bidsController.placeBid);
router.get('/listing/:listingId', bidsController.getListingBids);
router.get('/my-bids', bidsController.getMyBids);
router.get('/stats/:listingId', bidsController.getBidStats);

module.exports = router;
