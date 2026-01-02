const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listings.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');

// Public routes
router.get('/', optionalAuth, listingsController.getAll);
router.get('/:id', optionalAuth, listingsController.getById);

// Protected routes
router.post('/', authMiddleware, listingsController.create);
router.put('/:id', authMiddleware, listingsController.update);
router.delete('/:id', authMiddleware, listingsController.delete);
router.get('/user/my-listings', authMiddleware, listingsController.getMyListings);

module.exports = router;
