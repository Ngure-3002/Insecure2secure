const Joi = require('joi');

exports.sanitizeInput = (data) => {
    if (typeof data === 'string') {
        return data.replace(/[<>]/g, '');
    }
    if (typeof data === 'object') {
        const sanitized = {};
        for (let key in data) {
            sanitized[key] = this.sanitizeInput(data[key]);
        }
        return sanitized;
    }
    return data;
};

exports.validatePaymentData = (data) => {
    const schema = Joi.object({
        mpesaCode: Joi.string()
            .pattern(/^[A-Z]{3}[0-9]{6}$/)
            .required(),
        amount: Joi.number()
            .min(1)
            .required(),
        plan: Joi.string()
            .valid('Hourly', 'Daily', 'Weekly', 'Monthly', 'Annual')
            .required(),
        phoneNumber: Joi.string()
            .pattern(/^(?:254|\+254|0)?(7(?:(?:[129][0-9])|(?:0[0-8])|(?:4[0-3])|(?:4[5-9])|(?:5[7-9])|(?:6[8-9])[0-9]{6})$/)
            .required()
    });

    return schema.validate(data);
};