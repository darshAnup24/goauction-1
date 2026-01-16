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
router.post('/complete', paymentsController.completePayment); // Manual completion for testing
router.get('/my-payments', paymentsController.getMyPayments); // Must come before /:id
router.get('/:id', paymentsController.getPayment);

module.exports = router;
