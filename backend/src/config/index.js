const config = {
    development: {
        port: process.env.PORT || 5000,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        corsOrigins: [
            'http://localhost:3000',
            'http://localhost:3001'
        ],
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 200 // requests per windowMs
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
    },
    production: {
        port: process.env.PORT || 5000,
        frontendUrl: process.env.FRONTEND_URL,
        corsOrigins: process.env.CORS_ORIGINS?.split(',') || [],
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 100
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
    }
};

const env = process.env.NODE_ENV || 'development';

module.exports = config[env];
