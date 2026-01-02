const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../models/prisma');
const emailService = require('../services/email.service');

class AuthController {
    // Register new user
    async register(req, res, next) {
        try {
            const { name, email, password, username } = req.body;
            console.log('📝 Registration attempt for:', email);

            // Validate input
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and password are required'
                });
            }

            // Check if user exists
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [{ email }, ...(username ? [{ username }] : [])]
                }
            });

            if (existingUser) {
                console.log('❌ User already exists:', email);
                return res.status(409).json({
                    success: false,
                    message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');

            // Create user
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    username: username || email.split('@')[0],
                    password: hashedPassword,
                    emailVerificationToken: verificationToken,
                    role: 'BUYER'
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    role: true,
                    image: true,
                    emailVerified: true
                }
            });

            // Generate JWT token for auto-login
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            // Send verification email (async, don't wait)
            emailService.sendVerificationEmail(user.email, user.name, verificationToken)
                .catch(err => console.error('Error sending verification email:', err));

            console.log('✅ User registered successfully:', email);

            res.status(201).json({
                success: true,
                message: 'Registration successful! You are now logged in.',
                token,
                user
            });
        } catch (error) {
            next(error);
        }
    }

    // Login user
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            console.log('🔐 Login attempt for:', email);

            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Find user
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                console.log('❌ User not found:', email);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                console.log('❌ Invalid password for:', email);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            console.log('✅ Login successful for:', email);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    image: user.image,
                    emailVerified: user.emailVerified
                }
            });
        } catch (error) {
            console.error('❌ Login error:', error.message);
            next(error);
        }
    }

    // Logout user
    async logout(req, res, next) {
        try {
            // In JWT-based auth, logout is handled client-side by removing the token
            // You could implement token blacklisting here if needed
            
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Verify email
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.body;

            const user = await prisma.user.findFirst({
                where: { emailVerificationToken: token }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification token'
                });
            }

            // Update user
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: new Date(),
                    emailVerificationToken: null
                }
            });

            res.json({
                success: true,
                message: 'Email verified successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Forgot password
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;

            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                // Don't reveal if email exists
                return res.json({
                    success: true,
                    message: 'If the email exists, a reset link has been sent'
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetToken,
                    resetTokenExpiry
                }
            });

            // Send reset email
            await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

            res.json({
                success: true,
                message: 'If the email exists, a reset link has been sent'
            });
        } catch (error) {
            next(error);
        }
    }

    // Reset password
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;

            const user = await prisma.user.findFirst({
                where: {
                    resetToken: token,
                    resetTokenExpiry: {
                        gt: new Date()
                    }
                }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token'
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update user
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpiry: null
                }
            });

            res.json({
                success: true,
                message: 'Password reset successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Get current user
    async getCurrentUser(req, res, next) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    role: true,
                    image: true,
                    emailVerified: true,
                    isVendor: true,
                    phone: true,
                    address: true,
                    createdAt: true
                }
            });

            res.json({
                success: true,
                user
            });
        } catch (error) {
            next(error);
        }
    }

    // Get session (for compatibility with frontend)
    async getSession(req, res, next) {
        try {
            res.json({
                success: true,
                user: req.user
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
