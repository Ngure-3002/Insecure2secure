const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

module.exports = (app) => {
    // Security headers
    app.use(helmet());

    // Rate limiting
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }));

    // MongoDB query sanitization
    app.use(mongoSanitize());

    // CSRF protection
    app.use(csrf({ cookie: true }));

    // XSS prevention
    app.use((req, res, next) => {
        res.setHeader('Content-Security-Policy', "default-src 'self'");
        next();
    });
};