const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        name: 'GoAuction API',
        version: '1.0.0',
        description: 'REST API for GoAuction platform',
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
