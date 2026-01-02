const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { z } = require('zod');

// Validation schemas
const registerSchema = {
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters')
    })
};

const loginSchema = {
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required')
    })
};

const verifyEmailSchema = {
    body: z.object({
        token: z.string().min(1, 'Token is required')
    })
};

// Routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.get('/session', authMiddleware, authController.getSession);

module.exports = router;
