const Joi = require('joi');

// User validation schemas
const userSchema = Joi.object({
    fullName: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.min': 'Name must be at least 3 characters long',
            'string.max': 'Name cannot exceed 50 characters'
        }),
        
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address'
        }),
        
    password: Joi.string()
        .min(6)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }),
        
    phone: Joi.string()
        .pattern(/^(?:254|\+254|0)?(7(?:(?:[129][0-9])|(?:0[0-8])|(?:4[0-3])|(?:4[5-9])|(?:5[7-9])|(?:6[8-9])[0-9]{6})$/)
        .required()
        .messages({
            'string.pattern.base': 'Please provide a valid Kenyan phone number'
        })
});

// Payment validation schema
const paymentSchema = Joi.object({
    mpesaCode: Joi.string()
        .pattern(/^[A-Z0-9]{10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid M-Pesa transaction code format'
        }),
        
    amount: Joi.number()
        .min(20)
        .required()
        .messages({
            'number.min': 'Minimum payment amount is KES 20'
        }),
        
    plan: Joi.string()
        .valid('Hourly', 'Daily', 'Weekly', 'Monthly', 'Annual')
        .required()
});

// Content validation schema
const contentSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required(),
        
    type: Joi.string()
        .valid('video', 'pdf', 'audio', 'article')
        .required(),
        
    description: Joi.string()
        .max(500)
});

// Validation middleware
exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

exports.validatePayment = (req, res, next) => {
    const { error } = paymentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

exports.validateContent = (req, res, next) => {
    const { error } = contentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

module.exports = exports;
