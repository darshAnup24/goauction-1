const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    
    // Prisma errors
    if (err.code === 'P2002') {
        statusCode = 409;
        message = 'A record with this value already exists';
    } else if (err.code === 'P2025') {
        statusCode = 404;
        message = 'Record not found';
    } else if (err.code?.startsWith('P')) {
        statusCode = 400;
        message = 'Database operation failed';
    }

    // Validation errors
    if (err.name === 'ValidationError' || err.name === 'ZodError') {
        statusCode = 400;
        message = err.message || 'Validation failed';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Multer errors (file upload)
    if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size too large';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file field';
        } else {
            message = 'File upload failed';
        }
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            errorDetails: {
                name: err.name,
                code: err.code,
                message: err.message
            }
        })
    });
};

module.exports = errorMiddleware;
