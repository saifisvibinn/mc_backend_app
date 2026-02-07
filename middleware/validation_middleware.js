// Simple validation utility for request bodies
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            // Format errors object: { field: "Error message" }
            const errors = {};
            error.details.forEach(detail => {
                // Remove quotes from field name in message if present
                errors[detail.path[0]] = detail.message.replace(/"/g, '');
            });

            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: errors
            });
        }

        req.body = value;
        next();
    };
};

module.exports = validate;
