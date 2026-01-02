const jwt = require('jsonwebtoken');
const prisma = require('../models/prisma');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('⚠️ No authorization header on:', req.path);
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from database
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    username: true,
                    role: true,
                    image: true,
                    emailVerified: true
                }
            });

            if (!user) {
                console.log('❌ User not found for token:', decoded.userId);
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                console.log('⏰ Token expired for:', req.path);
                return res.status(401).json({
                    success: false,
                    message: 'Token expired',
                    code: 'TOKEN_EXPIRED'
                });
            }
            
            console.log('❌ Invalid token on:', req.path);
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    image: true
                }
            });

            if (user) {
                req.user = user;
            }
        } catch (error) {
            // Silently fail for optional auth
        }
        
        next();
    } catch (error) {
        next();
    }
};

// Role-based middleware
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    optionalAuth,
    requireRole
};
