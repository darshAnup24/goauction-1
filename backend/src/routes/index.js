const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const listingsRoutes = require('./listings.routes');
const bidsRoutes = require('./bids.routes');
const paymentsRoutes = require('./payments.routes');
const notificationsRoutes = require('./notifications.routes');
const uploadRoutes = require('./upload.routes');
const usersRoutes = require('./users.routes');
const vendorsRoutes = require('./vendors.routes');
const cronRoutes = require('./cron.routes');

// Mount health check routes (no /api prefix)
router.use('/', healthRoutes);

// Mount routes
router.use('/auth', authRoutes);
router.use('/listings', listingsRoutes);
router.use('/bids', bidsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/upload', uploadRoutes);
router.use('/users', usersRoutes);
router.use('/vendors', vendorsRoutes);
router.use('/cron', cronRoutes);

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'GoAuction API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            listings: '/api/listings',
            bids: '/api/bids',
            payments: '/api/payments',
            notifications: '/api/notifications',
            upload: '/api/upload',
            users: '/api/users',
            vendors: '/api/vendors'
        }
    });
});

module.exports = router;
