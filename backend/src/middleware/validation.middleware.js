const { z } = require('zod');

/**
 * Middleware factory for validating request data using Zod schemas
 * @param {Object} schema - Zod schema object with optional body, params, query properties
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Validate request body
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }

            // Validate request params
            if (schema.params) {
                req.params = await schema.params.parseAsync(req.params);
            }

            // Validate query parameters
            if (schema.query) {
                req.query = await schema.query.parseAsync(req.query);
            }

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }

            next(error);
        }
    };
};

module.exports = validate;
