const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Webhook (no auth - Stripe will verify)
router.post('/webhook', paymentsController.handleWebhook);

// All other payment routes require authentication
router.use(authMiddleware);

router.post('/create-checkout-session', paymentsController.createCheckoutSession);
router.post('/create-intent', paymentsController.createPaymentIntent);
router.get('/:id', paymentsController.getPayment);
router.get('/my-payments', paymentsController.getMyPayments);

module.exports = router;
